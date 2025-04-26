import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GitHubService } from './github.service';

@Injectable()
export class GitHubSchedulerService {
  private readonly logger = new Logger(GitHubSchedulerService.name);

  constructor(private readonly githubService: GitHubService) {}

  @Cron('0 0 * * *', {
    timeZone: 'UTC',
  })
  async collectTrafficData() {
    this.logger.log('Starting scheduled traffic data collection');
    try {
      const repos = await this.githubService.getRepositories();
      this.logger.log(
        `Found ${repos.length} repositories to collect traffic for`,
      );

      for (const repo of repos) {
        try {
          await this.githubService.getRepositoryTraffic(
            repo.owner.login,
            repo.name,
          );
          this.logger.log(`Collected traffic data for ${repo.full_name}`);
        } catch (error) {
          this.logger.error(
            `Failed to collect traffic for ${repo.full_name}: ${error.message}`,
          );
        }
      }

      this.logger.log('Scheduled traffic collection completed');
    } catch (error) {
      this.logger.error(
        `Scheduled traffic collection failed: ${error.message}`,
      );
    }
  }
}
