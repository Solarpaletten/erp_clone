const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logger } = require('../../config/logger');

// Inline implementation of generateTemporaryPassword для избежания проблем с импортом
const generateTemporaryPassword = () => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};

const { PrismaClient } = require('@prisma/client'); // Обновляем импорт
const prisma = new PrismaClient();

class AuthController {
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await prisma.users.findFirst({
        where: {
          verification_token: token,
          token_expires: {
            gt: new Date(),
          },
        },
        include: {
          companies: true
        }
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: 'Invalid or expired verification token' });
      }

      // Обновляем пользователя - устанавливаем email_verified
      await prisma.users.update({
        where: { id: user.id },
        data: {
          email_verified: true,
          verification_token: null,
          token_expires: null,
        },
      });

      // Обновляем все компании пользователя - подтверждаем email
      if (user.companies && user.companies.length > 0) {
        await prisma.companies.updateMany({
          where: { user_id: user.id },
          data: {
            is_email_confirmed: true
          }
        });
      }

      // Возвращаем успешный ответ с редиректом на страницу входа
      res.json({ 
        message: 'Email verified successfully',
        redirectTo: '/auth/login'
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({ error: 'Email verification failed' });
    }
  }
  
  async confirmEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const user = await prisma.users.findFirst({
        where: {
          verification_token: token,
          token_expires: {
            gt: new Date(),
          },
        },
        include: {
          companies: true
        }
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: 'Invalid or expired verification token' });
      }

      // Обновляем пользователя
      await prisma.users.update({
        where: { id: user.id },
        data: {
          email_verified: true,
          verification_token: null,
          token_expires: null,
        },
      });

      // Обновляем статус компаний пользователя
      if (user.companies && user.companies.length > 0) {
        await prisma.companies.updateMany({
          where: { user_id: user.id },
          data: {
            is_email_confirmed: true
          }
        });
      }

      // Успешный ответ
      res.json({ 
        message: 'Email confirmed successfully',
        redirectTo: '/auth/login'
      });
    } catch (error) {
      logger.error('Email confirmation error:', error);
      res.status(500).json({ error: 'Email confirmation failed' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.users.update({
        where: { id: user.id },
        data: {
          reset_token: resetToken,
          reset_token_expires: tokenExpires,
        },
      });

      if (process.env.NODE_ENV !== 'test') {
        try {
          await emailService.sendPasswordReset(user.email, resetToken);
        } catch (error) {
          logger.error('Failed to send password reset email:', error);
        }
      }

      res.json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const user = await prisma.users.findFirst({
        where: {
          reset_token: token,
          reset_token_expires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: 'Invalid or expired reset token' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          reset_token: null,
          reset_token_expires: null,
        },
      });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          email_verified: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  }

  async createTemporaryPassword(req, res) {
    try {
      const { email } = req.body;
      const tempPassword = generateTemporaryPassword();

      if (process.env.NODE_ENV !== 'test') {
        try {
          await emailService.sendTemporaryPassword(email, tempPassword);
        } catch (error) {
          logger.error('Failed to send temporary password email:', error);
        }
      }

      res.json({
        message: 'Temporary password sent to your email',
      });
    } catch (error) {
      logger.error('Create temporary password error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async register(req, res) {
    try {
      const { email, username, password } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Добавляем подробное логирование
      logger.info('Регистрация нового пользователя:', {
        email,
        username,
        passwordLength: password ? password.length : 0
      });

      // Проверка на существующего пользователя
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        logger.warn('Попытка регистрации с уже существующим email:', email);
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Хэширование пароля и создание пользователя
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Создаем токен для подтверждения email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

      const user = await prisma.users.create({
        data: {
          email,
          username,
          password_hash: passwordHash,
          verification_token: verificationToken,
          token_expires: tokenExpires,
          role: 'USER',
          // В тестовом режиме сразу подтверждаем email
          email_verified: process.env.NODE_ENV === 'test',
        },
      });

      // Отправляем email с подтверждением, если не тестовый режим
      if (process.env.NODE_ENV !== 'test') {
        try {
          await emailService.sendVerificationEmail(
            user.email,
            verificationToken
          );
          logger.info('Отправлено письмо для подтверждения email:', { email: user.email });
        } catch (error) {
          logger.error('Failed to send verification email:', error);
        }
      }

      logger.info('Пользователь успешно создан:', {
        userId: user.id,
        email: user.email,
        emailVerified: user.email_verified
      });

      // Создаем токен для ответа
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      logger.info('Сгенерирован токен для пользователя:', {
        userId: user.id,
        tokenLength: token.length
      });

      // Возвращаем ответ с флагом emailVerificationSent
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        emailVerificationSent: true,
        message: 'На ваш email отправлена ссылка для подтверждения регистрации. Пожалуйста, подтвердите, чтобы войти.'
      });
    } catch (error) {
      logger.error('Registration error:', {
        message: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      logger.info('Login attempt:', { email });

      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        logger.warn('Login failed: User not found', { email });
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        logger.warn('Login failed: Invalid password', { email });
        return res.status(401).json({ message: 'Неверный пароль' });
      }

      // Проверка на подтверждение email
      if (!user.email_verified) {
        logger.warn('Login failed: Email not verified', { email });
        return res
          .status(403)
          .json({ 
            message: 'Пожалуйста, подтвердите email перед входом в систему. Проверьте почту для активации аккаунта.',
            needsEmailConfirmation: true 
          });
      }

      logger.info('Login success:', { email });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера при попытке входа' });
    }
  }

  async validateToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          valid: false,
          message: 'Token is required',
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.json({
          valid: false,
          message: 'User not found',
        });
      }

      return res.json({
        valid: true,
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error('Token validation error:', error);
      return res.json({
        valid: false,
        message: 'Invalid token',
      });
    }
  }
}

module.exports = new AuthController();
