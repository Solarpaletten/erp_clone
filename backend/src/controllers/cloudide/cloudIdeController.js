//b/src/controllers/cloudide/cloudIdeController.js
// 🌟 Solar Cloud IDE - Main Controller
const GitHubService = require('../../services/github/githubService');
const { diffLines } = require('diff');

const githubService = new GitHubService();

const cloudIdeController = {
  // 🐙 Load GitHub repository
  loadRepo: async (req, res) => {
    try {
      const { owner, repo, branch = 'main' } = req.body;
      
      if (!owner || !repo) {
        return res.status(400).json({
          success: false,
          error: 'Owner and repo are required'
        });
      }

      const result = await githubService.loadRepoTree(owner, repo, branch);
      
      res.json({
        success: result.success,
        data: result.data,
        message: result.success 
          ? `Repository ${owner}/${repo} loaded successfully`
          : result.error
      });

    } catch (error) {
      console.error('Error in loadRepo:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load repository',
        details: error.message
      });
    }
  },

  // 📄 Get file from GitHub
  getFile: async (req, res) => {
    try {
      const { owner, repo, filePath, branch = 'main' } = req.query;
      
      if (!owner || !repo || !filePath) {
        return res.status(400).json({
          success: false,
          error: 'Owner, repo, and filePath are required'
        });
      }

      const result = await githubService.getFileContent(owner, repo, filePath, branch);
      
      res.json({
        success: result.success,
        data: result.data,
        message: result.success 
          ? `File ${filePath} loaded successfully`
          : result.error
      });

    } catch (error) {
      console.error('Error in getFile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get file',
        details: error.message
      });
    }
  },

  // 🔍 Compare GitHub file with local
  compareFile: async (req, res) => {
    try {
      const { owner, repo, filePath, branch = 'main', newCode } = req.body;
      
      if (!owner || !repo || !filePath) {
        return res.status(400).json({
          success: false,
          error: 'Owner, repo, and filePath are required'
        });
      }

      // Get file from GitHub
      const repoResult = await githubService.getFileContent(owner, repo, filePath, branch);
      if (!repoResult.success) {
        return res.json(repoResult);
      }

      const repoFile = repoResult.data;
      
      // Compare with local or provided code
      const compareCode = newCode || '';
      const codeToCompare = newCode ? newCode : repoFile.content;
      
      // Compare with local file
      const localResult = await githubService.compareWithLocal(repoFile);
      
      // Generate diff
      const diff = diffLines(repoFile.content, codeToCompare);
      
      // AI Analysis
      const analysis = {
        lines: {
          repo: repoFile.content.split('\n').length,
          compare: codeToCompare.split('\n').length,
          diff: diff.filter(part => part.added || part.removed).length
        },
        patterns: this.detectPatterns(codeToCompare),
        status: this.getFileStatus(repoFile.content, codeToCompare, localResult.data?.localExists)
      };

      res.json({
        success: true,
        data: {
          repo: `${owner}/${repo}`,
          branch,
          file: {
            path: filePath,
            repoContent: repoFile.content,
            compareContent: codeToCompare,
            localExists: localResult.data?.localExists || false
          },
          diff,
          analysis,
          timestamp: new Date().toISOString()
        },
        message: 'File comparison completed'
      });

    } catch (error) {
      console.error('Error in compareFile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare file',
        details: error.message
      });
    }
  },

  // 🌿 Get repository branches
  getBranches: async (req, res) => {
    try {
      const { owner, repo } = req.query;
      
      if (!owner || !repo) {
        return res.status(400).json({
          success: false,
          error: 'Owner and repo are required'
        });
      }

      const result = await githubService.getBranches(owner, repo);
      
      res.json({
        success: result.success,
        data: result.data,
        message: result.success 
          ? `Branches for ${owner}/${repo} loaded`
          : result.error
      });

    } catch (error) {
      console.error('Error in getBranches:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get branches',
        details: error.message
      });
    }
  },

  // 🔍 Search repositories
  searchRepos: async (req, res) => {
    try {
      const { query, user } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const result = await githubService.searchRepos(query, user);
      
      res.json({
        success: result.success,
        data: result.data,
        message: result.success 
          ? `Found ${result.data?.length || 0} repositories`
          : result.error
      });

    } catch (error) {
      console.error('Error in searchRepos:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search repositories',
        details: error.message
      });
    }
  },

  // 🔧 Helper methods
  detectPatterns(code) {
    const patterns = [];
    
    if (code.includes('useState') || code.includes('useEffect')) {
      patterns.push('React Hooks');
    }
    if (code.includes('interface ') || code.includes(': React.FC')) {
      patterns.push('TypeScript');
    }
    if (code.includes('className') && code.includes('bg-')) {
      patterns.push('Tailwind CSS');
    }
    if (code.includes('drag') || code.includes('Drop')) {
      patterns.push('Drag & Drop');
    }
    if (code.includes('prisma') || code.includes('@prisma')) {
      patterns.push('Prisma ORM');
    }
    
    return patterns;
  },

  getFileStatus(repoContent, compareContent, localExists) {
    if (repoContent === compareContent) {
      return 'identical';
    }
    
    if (!localExists) {
      return 'new';
    }
    
    return 'modified';
  }
};

module.exports = cloudIdeController;
