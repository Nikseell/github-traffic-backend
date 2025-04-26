import { Controller, Get, Logger, Query } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  private readonly logger = new Logger(DatabaseController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Get('repositories')
  async getRepositories(): Promise<any[]> {
    this.logger.log('Getting repositories from database');
    return this.databaseService.getRepositories();
  }

  @Get('repositories/traffic')
  async getRepositoryTrafficByQuery(
    @Query('name') name: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    this.logger.log(`Getting traffic data for repository: ${name}`);
    return this.databaseService.getTraffic(name, startDate, endDate);
  }
}
