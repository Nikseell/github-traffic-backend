import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';
import { DatabaseModule } from '../database/database.module';
import { GitHubSchedulerService } from './github.scheduler.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [GitHubController],
  providers: [GitHubService, GitHubSchedulerService],
  exports: [GitHubService],
})
export class GitHubModule {}
