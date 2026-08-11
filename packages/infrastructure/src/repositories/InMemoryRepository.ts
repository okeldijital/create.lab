import { RepositoryError } from "../errors/InfrastructureErrors.js";

export type InfrastructureEntity = {
  readonly id: string;
  readonly organizationId: string;
};

export class InMemoryRepository<T extends InfrastructureEntity> {
  private readonly records = new Map<string, T>();

  async save(entity: T): Promise<T> {
    if (!entity.id || !entity.organizationId) {
      throw new RepositoryError("Repository entities require id and organizationId");
    }
    const key = this.key(entity.organizationId, entity.id);
    this.records.set(key, entity);
    return entity;
  }

  async findById(organizationId: string, id: string): Promise<T | null> {
    return this.records.get(this.key(organizationId, id)) ?? null;
  }

  async exists(organizationId: string, id: string): Promise<boolean> {
    return this.records.has(this.key(organizationId, id));
  }

  async findByOrganization(organizationId: string): Promise<readonly T[]> {
    const prefix = `${organizationId}:`;
    return [...this.records.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value);
  }

  async remove(organizationId: string, id: string): Promise<boolean> {
    return this.records.delete(this.key(organizationId, id));
  }

  clear(): void {
    this.records.clear();
  }

  count(): number {
    return this.records.size;
  }

  private key(organizationId: string, id: string): string {
    return `${organizationId}:${id}`;
  }
}
