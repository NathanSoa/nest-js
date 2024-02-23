export abstract class CacheRepository {
  abstract set(key: string, value: string): Promise<void>
  abstract get(value: string): Promise<string | null>
  abstract delete(key: string): Promise<void>
}
