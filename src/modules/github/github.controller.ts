import { Controller, Get, Logger } from '@nestjs/common';
import { GitHubService } from './github.service';
import { RepositoryTrafficResult } from '../../common/github/github.interfaces';

@Controller('github')
export class GitHubController {
  private readonly logger = new Logger(GitHubController.name);

  constructor(private readonly githubService: GitHubService) {}

  @Get('repositories')
  async getRepositories() {
    this.logger.log('Getting all repositories');
    const repos = await this.githubService.getRepositories();
    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      url: repo.html_url,
      description: repo.description,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    }));
  }

  @Get('traffic')
  async getAllRepositoriesTraffic() {
    this.logger.log('Getting traffic for all repositories');
    const repos = await this.githubService.getRepositories();

    const trafficResults: RepositoryTrafficResult[] = [];
    for (const repo of repos) {
      try {
        const traffic = await this.githubService.getRepositoryTraffic(
          repo.owner.login,
          repo.name,
        );
        trafficResults.push({
          repository: repo.full_name,
          traffic,
        });
      } catch (error) {
        this.logger.error(
          `Error getting traffic for ${repo.full_name}: ${error.message}`,
        );
        trafficResults.push({
          repository: repo.full_name,
          error: error.message,
        });
      }
    }

    return trafficResults;
  }
}
