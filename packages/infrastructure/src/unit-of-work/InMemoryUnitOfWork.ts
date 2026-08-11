import type { UnitOfWork } from "@creative-lab/application";
import { TransactionError } from "../errors/InfrastructureErrors.js";

export class InMemoryUnitOfWork implements UnitOfWork {
  private active = false;

  async begin(): Promise<void> {
    if (this.active) throw new TransactionError("Transaction already active");
    this.active = true;
  }

  async commit(): Promise<void> {
    if (!this.active) throw new TransactionError("No active transaction");
    this.active = false;
  }

  async rollback(): Promise<void> {
    if (!this.active) throw new TransactionError("No active transaction");
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  async run<T>(work: () => Promise<T>): Promise<T> {
    await this.begin();
    try {
      const result = await work();
      await this.commit();
      return result;
    } catch (error) {
      if (this.active) await this.rollback();
      throw error;
    }
  }
}
