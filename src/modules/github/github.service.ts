import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from 'octokit';
import {
  GitHubRepository,
  RepositoryTrafficData,
} from '../../common/github/github.interfaces';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GitHubService {
  private readonly octokit: Octokit;
  private readonly logger = new Logger(GitHubService.name);

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    const token = this.configService.get<string>('GITHUB_TOKEN');

    if (!token) {
      this.logger.error('GitHub token not found in environment variables');
      throw new Error('GitHub token is required');
    }

    this.octokit = new Octokit({ auth: token });
    this.logger.log('GitHub API client initialized');
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    try {
      this.logger.log('Fetching all public repositories...');

      const { data: repos } =
        await this.octokit.rest.repos.listForAuthenticatedUser({
          visibility: 'public',
          per_page: 100,
        });

      this.logger.log(`Found ${repos.length} public repositories`);

      return repos;
    } catch (error) {
      this.logger.error(`Error fetching repositories: ${error.message}`);
      throw error;
    }
  }

  async getRepositoryTraffic(
    owner: string,
    repo: string,
  ): Promise<RepositoryTrafficData> {
    try {
      this.logger.log(`Fetching traffic for ${owner}/${repo}...`);

      const { data: views } = await this.octokit.rest.repos.getViews({
        owner,
        repo,
      });

      const { data: clones } = await this.octokit.rest.repos.getClones({
        owner,
        repo,
      });

      const { data: referrers } = await this.octokit.rest.repos.getTopReferrers(
        {
          owner,
          repo,
        },
      );

      const { data: paths } = await this.octokit.rest.repos.getTopPaths({
        owner,
        repo,
      });

      const trafficData: RepositoryTrafficData = {
        views,
        clones,
        referrers,
        paths,
      };

      const repositoryFullName = `${owner}/${repo}`;
      await this.databaseService.saveTrafficData(
        repositoryFullName,
        trafficData,
      );
      this.logger.log(
        `Saved traffic data for ${repositoryFullName} to database`,
      );

      return trafficData;
    } catch (error) {
      this.logger.error(
        `Error fetching traffic for ${owner}/${repo}: ${error.message}`,
      );
      throw error;
    }
  }
}
