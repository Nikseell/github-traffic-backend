import { Module, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const client = await MongoClient.connect(process.env.MONGODB_URI || '');
        const db = client.db();
        Logger.log(`MongoDB Connected: ${db.databaseName}`);

        const collections = await db
          .listCollections({ name: 'repositoryTraffic' })
          .toArray();
        if (collections.length === 0) {
          await db.createCollection('repositoryTraffic');
          Logger.log('Collection repositoryTraffic created successfully');
        } else {
          Logger.log('Collection repositoryTraffic already exists');
        }

        return db;
      },
    },
    DatabaseService,
  ],
  controllers: [DatabaseController],
  exports: ['DATABASE_CONNECTION', DatabaseService],
})
export class DatabaseModule {}
