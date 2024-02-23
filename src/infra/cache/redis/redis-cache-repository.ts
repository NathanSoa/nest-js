import { Injectable } from '@nestjs/common'
import { CacheRepository } from '../cache-repository'
import { RedisService } from './redis.service'

const FIFTEEN_MINUTES = 60 * 15

@Injectable()
export class RedisCacheRepository implements CacheRepository {
  constructor(private redis: RedisService) {}

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value, 'EX', FIFTEEN_MINUTES)
  }

  async get(value: string): Promise<string | null> {
    return await this.redis.get(value)
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }
}
