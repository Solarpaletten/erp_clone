//f/src/services/cloudide/cloudIdeApi.ts
// 🌟 Solar Cloud IDE - API Service
import { api } from '../axios';

export interface GitHubRepo {
  owner: string;
  repo: string;
  branch?: string;
}

export interface RepoFile {
  path: string;
  name: string;
  type: string;
  size: number;
  isComponent: boolean;
}

export interface ComparisonResult {
  repo: string;
  branch: string;
  file: {
    path: string;
    repoContent: string;
    compareContent: string;
    localExists: boolean;
  };
  diff: any[];
  analysis: {
    lines: {
      repo: number;
      compare: number;
      diff: number;
    };
    patterns: string[];
    status: 'identical' | 'modified' | 'new';
  };
  timestamp: string;
}

export const cloudIdeApi = {
  // 🐙 Load GitHub repository
  loadRepo: async (owner: string, repo: string, branch = 'main'): Promise<any> => {
    const response = await api.post('/api/cloudide/repo/load', {
      owner,
      repo,
      branch
    });
    return response.data;
  },

  // 📄 Get file content
  getFile: async (owner: string, repo: string, filePath: string, branch = 'main'): Promise<any> => {
    const response = await api.get('/api/cloudide/repo/file', {
      params: { owner, repo, filePath, branch }
    });
    return response.data;
  },

  // 🔍 Compare file
  compareFile: async (owner: string, repo: string, filePath: string, newCode: string, branch = 'main'): Promise<ComparisonResult> => {
    const response = await api.post('/api/cloudide/repo/compare', {
      owner,
      repo,
      filePath,
      newCode,
      branch
    });
    return response.data.data;
  },

  // 🌿 Get branches
  getBranches: async (owner: string, repo: string): Promise<any> => {
    const response = await api.get('/api/cloudide/repo/branches', {
      params: { owner, repo }
    });
    return response.data;
  },

  // 🔍 Search repositories
  searchRepos: async (query: string, user?: string): Promise<any> => {
    const response = await api.get('/api/cloudide/repo/search', {
      params: { query, user }
    });
    return response.data;
  },

  // 🧪 Health check
  healthCheck: async (): Promise<any> => {
    const response = await api.get('/api/cloudide/health');
    return response.data;
  }
};