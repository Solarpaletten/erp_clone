const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

// Initialise Prisma client
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all clients
app.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { id: 'asc' } });
    res.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new client
app.post('/clients', async (req, res) => {
  try {
    const { name, abbreviation, code, email, phone, role } = req.body;
    const client = await prisma.client.create({
      data: {
        name,
        abbreviation,
        code,
        email,
        phone,
        role
      }
    });
    res.status(201).json(client);
  } catch (error) {
    console.error('Failed to create client:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Update an existing client
app.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, abbreviation, code, email, phone, role, isActive } = req.body;
  try {
    const updated = await prisma.client.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        abbreviation,
        code,
        email,
        phone,
        role,
        isActive
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update client:', error);
    res.status(404).json({ error: 'Client not found' });
  }
});

// Delete a client
app.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.client.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete client:', error);
    res.status(404).json({ error: 'Client not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`ERP clone backend running on port ${PORT}`);
});