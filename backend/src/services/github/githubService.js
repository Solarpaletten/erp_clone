//b/src/services/github/githubService.js
// 🌟 Solar Cloud IDE - GitHub Integration Service
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // Optional for public repos
    });
    this.git = simpleGit();
  }

  // 📁 Load repository file tree
  async loadRepoTree(owner, repo, branch = 'main') {
    try {
      console.log(`🔍 Loading repo tree: ${owner}/${repo}@${branch}`);
      
      const { data } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: 'true'
      });

      // Filter for relevant files
      const files = data.tree
        .filter(item => 
          item.type === 'blob' && 
          /\.(js|jsx|ts|tsx|css|json|md)$/.test(item.path)
        )
        .map(item => ({
          path: item.path,
          sha: item.sha,
          size: item.size,
          type: path.extname(item.path).slice(1),
          name: path.basename(item.path),
          isComponent: this.isComponentFile(item.path)
        }));

      return {
        success: true,
        data: {
          repo: `${owner}/${repo}`,
          branch,
          totalFiles: files.length,
          files: files.sort((a, b) => a.path.localeCompare(b.path))
        }
      };

    } catch (error) {
      console.error('Error loading repo tree:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📄 Get file content
  async getFileContent(owner, repo, filePath, branch = 'main') {
    try {
      console.log(`📄 Getting file: ${owner}/${repo}/${filePath}@${branch}`);
      
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch
      });

      if (data.type !== 'file') {
        throw new Error('Not a file');
      }

      const content = Buffer.from(data.content, 'base64').toString('utf8');
      
      return {
        success: true,
        data: {
          path: filePath,
          content,
          size: data.size,
          sha: data.sha,
          encoding: data.encoding,
          lastModified: data._links?.git || null
        }
      };

    } catch (error) {
      console.error('Error getting file content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔍 Compare with local file
  async compareWithLocal(repoFile, localPath = './f/src') {
    try {
      const fullLocalPath = path.join(localPath, repoFile.path);
      
      let localContent = '';
      let localExists = false;
      
      try {
        localContent = await fs.readFile(fullLocalPath, 'utf8');
        localExists = true;
      } catch (error) {
        // File doesn't exist locally
        localExists = false;
      }

      const comparison = {
        path: repoFile.path,
        localExists,
        repoContent: repoFile.content,
        localContent,
        status: this.getComparisonStatus(repoFile.content, localContent, localExists)
      };

      return {
        success: true,
        data: comparison
      };

    } catch (error) {
      console.error('Error comparing files:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🌿 Get repository branches
  async getBranches(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner,
        repo
      });

      return {
        success: true,
        data: data.map(branch => ({
          name: branch.name,
          sha: branch.commit.sha,
          protected: branch.protected
        }))
      };

    } catch (error) {
      console.error('Error getting branches:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔍 Search repositories
  async searchRepos(query, user = null) {
    try {
      const searchQuery = user ? `${query} user:${user}` : query;
      
      const { data } = await this.octokit.rest.search.repos({
        q: searchQuery,
        sort: 'updated',
        order: 'desc',
        per_page: 10
      });

      return {
        success: true,
        data: data.items.map(repo => ({
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner.login,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated: repo.updated_at,
          private: repo.private
        }))
      };

    } catch (error) {
      console.error('Error searching repos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔧 Helper methods
  isComponentFile(filePath) {
    const componentPatterns = [
      /components?\/.*\.(jsx?|tsx?)$/,
      /pages?\/.*\.(jsx?|tsx?)$/,
      /views?\/.*\.(jsx?|tsx?)$/,
      /containers?\/.*\.(jsx?|tsx?)$/
    ];
    
    return componentPatterns.some(pattern => pattern.test(filePath));
  }

  getComparisonStatus(repoContent, localContent, localExists) {
    if (!localExists) {
      return 'new';
    }
    
    if (repoContent === localContent) {
      return 'identical';
    }
    
    return 'modified';
  }
}

module.exports = GitHubService;
