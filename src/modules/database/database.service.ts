import { Injectable, Logger, Inject } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import {
  RepositoryTrafficData,
  RepositoryTrafficDocument,
  TrafficDataPoint,
} from '../../common/github/github.interfaces';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly collection: Collection<RepositoryTrafficDocument>;

  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {
    this.collection =
      this.db.collection<RepositoryTrafficDocument>('repositoryTraffic');
    this.logger.log('Database service initialized');
  }

  async getRepositories() {
    try {
      this.logger.log('Fetching repositories from database');
      const repositories = await this.collection.find().toArray();
      return repositories.map((repo) => ({
        name: repo.repository,
      }));
    } catch (error) {
      this.logger.error(`Error getting all repositories: ${error.message}`);
      throw error;
    }
  }

  async getTraffic(repository: string, startDate?: string, endDate?: string) {
    try {
      this.logger.log(`Fetching traffic data for repository: ${repository}`);
      const repoData = await this.collection.findOne({ repository });

      if (!repoData) {
        throw new Error(`Repository ${repository} not found`);
      }

      const totals = this.calculateTotals(repoData);
      const chartData = this.createChartDataset(repoData, startDate, endDate);

      return {
        name: repoData.repository,
        totals,
        chartData,
      };
    } catch (error) {
      this.logger.error(
        `Error getting traffic for ${repository}: ${error.message}`,
      );
      throw error;
    }
  }

  async saveTrafficData(
    repository: string,
    trafficData: RepositoryTrafficData,
  ): Promise<void> {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const newDataPoint: TrafficDataPoint = {
        timestamp: now,
        date: dateStr,
        views: trafficData.views,
        clones: trafficData.clones,
        referrers: trafficData.referrers,
        paths: trafficData.paths,
      };

      const result = await this.collection.updateOne(
        { repository },
        {
          $set: { lastUpdated: now },
          $push: { dataPoints: newDataPoint },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        this.logger.log(`Created new repository document for ${repository}`);
      } else {
        this.logger.log(`Added new traffic data point for ${repository}`);
      }
    } catch (error) {
      this.logger.error(
        `Error saving traffic data for ${repository}: ${error.message}`,
      );
      throw error;
    }
  }

  private calculateTotals(repository: RepositoryTrafficDocument): {
    views: number;
    clones: number;
    uniqueViews: number;
    uniqueClones: number;
  } {
    const viewsMap = new Map<string, number>();
    const uniqueViewsMap = new Map<string, number>();
    const clonesMap = new Map<string, number>();
    const uniqueClonesMap = new Map<string, number>();

    for (const { views, clones } of repository.dataPoints) {
      views?.views?.forEach(({ timestamp, count, uniques }) => {
        const dateStr = timestamp.split('T')[0];
        viewsMap.set(dateStr, count);
        uniqueViewsMap.set(dateStr, uniques);
      });

      clones?.clones?.forEach(({ timestamp, count, uniques }) => {
        const dateStr = timestamp.split('T')[0];
        clonesMap.set(dateStr, count);
        uniqueClonesMap.set(dateStr, uniques);
      });
    }

    const sumValues = (map: Map<string, number>) =>
      [...map.values()].reduce((sum, val) => sum + val, 0);

    return {
      views: sumValues(viewsMap),
      clones: sumValues(clonesMap),
      uniqueViews: sumValues(uniqueViewsMap),
      uniqueClones: sumValues(uniqueClonesMap),
    };
  }

  private createChartDataset(
    repository: RepositoryTrafficDocument,
    startDate?: string,
    endDate?: string,
  ) {
    const viewsMap = new Map<string, number>();
    const uniqueViewsMap = new Map<string, number>();
    const clonesMap = new Map<string, number>();
    const uniqueClonesMap = new Map<string, number>();
    const timestamps = new Set<string>();

    for (const { views, clones } of repository.dataPoints) {
      views?.views?.forEach(({ timestamp, count, uniques }) => {
        const dateStr = timestamp.split('T')[0];
        viewsMap.set(dateStr, count);
        uniqueViewsMap.set(dateStr, uniques);
        timestamps.add(dateStr);
      });

      clones?.clones?.forEach(({ timestamp, count, uniques }) => {
        const dateStr = timestamp.split('T')[0];
        clonesMap.set(dateStr, count);
        uniqueClonesMap.set(dateStr, uniques);
        timestamps.add(dateStr);
      });
    }

    const sortedDates = Array.from(timestamps).sort();

    const effectiveStart = startDate ?? sortedDates[0];
    const effectiveEnd = endDate ?? sortedDates[sortedDates.length - 1];

    const allDatesInRange: string[] = [];

    if (effectiveStart && effectiveEnd) {
      let current = new Date(effectiveStart);
      const end = new Date(effectiveEnd);

      while (current <= end) {
        allDatesInRange.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    } else {
      allDatesInRange.push(...sortedDates);
    }

    return {
      viewsChartData: allDatesInRange.map((date) => ({
        date,
        views: viewsMap.get(date) || 0,
        uniqueViews: uniqueViewsMap.get(date) || 0,
      })),
      clonesChartData: allDatesInRange.map((date) => ({
        date,
        clones: clonesMap.get(date) || 0,
        uniqueClones: uniqueClonesMap.get(date) || 0,
      })),
    };
  }
}
