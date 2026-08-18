/**
 * Composition-only registry for concrete repository adapters.
 *
 * The registry owns no persistence behavior and contains no domain rules.
 * Adapters are supplied by the composition root and consumed by application
 * handlers through the domain repository interfaces they already implement.
 */
export class RepositoryRegistry {
  private readonly bindings = new Map<string, unknown>();

  register<TRepository>(key: string, repository: TRepository): void {
    if (!key.trim()) {
      throw new Error("Repository binding key is required");
    }
    this.bindings.set(key, repository);
  }

  has(key: string): boolean {
    return this.bindings.has(key);
  }

  get<TRepository>(key: string): TRepository {
    const repository = this.bindings.get(key);
    if (repository === undefined) {
      throw new Error(`Repository binding not found: ${key}`);
    }
    return repository as TRepository;
  }

  clear(): void {
    this.bindings.clear();
  }
}
