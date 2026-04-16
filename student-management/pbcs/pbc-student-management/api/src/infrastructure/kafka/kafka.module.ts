// AI-GENERATED
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaConfig } from '../../config/kafka.config';
import { EventPublisher } from '../events/event-publisher';

export interface KafkaModuleAsyncOptions {
  useClass: new (...args: any[]) => KafkaConfig;
}

@Module({})
export class KafkaModule {
  static forRootAsync(_options: KafkaModuleAsyncOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [ConfigModule],
      providers: [EventPublisher],
      exports: [EventPublisher],
      global: true,
    };
  }
}
