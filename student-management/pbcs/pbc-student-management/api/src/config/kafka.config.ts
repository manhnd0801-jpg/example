// AI-GENERATED
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KafkaModuleOptions {
  brokers: string[];
  clientId: string;
  groupId: string;
}

@Injectable()
export class KafkaConfig {
  constructor(private configService: ConfigService) {}

  createKafkaOptions(): KafkaModuleOptions {
    return {
      brokers: this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'pbc-student-management'),
      groupId: this.configService.get<string>('KAFKA_CONSUMER_GROUP', 'cg.student-mgmt'),
    };
  }
}