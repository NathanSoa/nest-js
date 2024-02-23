export abstract class InMemoryBaseRepository<T> {
  public data: T[] = []

  reset(): void {
    this.data = []
  }
}
