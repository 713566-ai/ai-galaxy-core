require('dotenv').config();
const express = require('express');
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs');
const { exec, spawn } = require('child_process');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

console.log('🔧 Загрузка AI Galaxy Core V116...');

// ========== GITHUB MANAGER ==========

class GitHubManager {
  constructor(token, username) {
    this.token = token;
    this.username = username;
    this.octokit = new Octokit({ auth: token });
    this.git = simpleGit();
  }

  async createUniverseIssue(universeId, entropy, parentId) {
    try {
      const response = await this.octokit.issues.create({
        owner: this.username,
        repo: "ai-galaxy-core",
        title: `🌌 Universe: ${universeId}`,
        body: JSON.stringify({ universeId, entropy, parentId }),
        labels: ["universe"]
      });
      return response.data;
    } catch (e) {
      console.log("issue error:", e.message);
      return null;
    }
  }

  async backupToGist(worldState, universeId) {
    try {
      const response = await this.octokit.gists.create({
        description: "backup " + universeId,
        public: false,
        files: {
          ["state_" + universeId + ".json"]: {
            content: JSON.stringify(worldState, null, 2)
          }
        }
      });
      return response.data;
    } catch (e) {
      console.log("gist error:", e.message);
      return null;
    }
  }

  async triggerAction(workflowId = "deploy.yml", inputs = {}) {
    try {
      await this.octokit.actions.createWorkflowDispatch({
        owner: this.username,
        repo: "ai-galaxy-core",
        workflow_id: workflowId,
        ref: "main",
        inputs
      });
      return true;
    } catch (e) {
      console.log("action error:", e.message);
      return false;
    }
  }

  async listUniversesFromRepos() {
    try {
      const repos = await this.octokit.repos.listForAuthenticatedUser({
        per_page: 100
      });
      return repos.data.filter(r => r.name.startsWith("universe_"));
    } catch (e) {
      return [];
    }
  }
}



if (typeof app !== "undefined" && app.listen) {
  app.listen(port, "0.0.0.0", () => {
    console.log("💀 AUTO-RECOVERY SERVER STARTED ON", port);
  });
} else {
  console.log("❌ app not found");
}

