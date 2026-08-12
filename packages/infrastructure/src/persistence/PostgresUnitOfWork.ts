import type { UnitOfWork } from "@creative-lab/application";
import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresClient, DrizzleDatabase } from "./PostgresDatabase.js";

/**
 * PostgreSQL-backed implementation of the application transaction port.
 *
 * A reserved postgres.js connection is used so BEGIN/COMMIT/ROLLBACK and all
 * repository work bound to this unit of work execute on the same connection.
 */
export class PostgresUnitOfWork implements UnitOfWork {
  private reserved: Awaited<ReturnType<PostgresClient["reserve"]>> | null = null;
  private database: DrizzleDatabase | null = null;
  private active = false;

  public constructor(private readonly client: PostgresClient) {}

  public async begin(): Promise<void> {
    if (this.active) {
      throw new Error("A PostgreSQL unit of work is already active");
    }

    const reserved = await this.client.reserve();
    try {
      await reserved`begin`;
      this.reserved = reserved;
      this.database = drizzle({ client: reserved });
      this.active = true;
    } catch (error) {
      await reserved.release();
      throw error;
    }
  }

  public async commit(): Promise<void> {
    const reserved = this.requireActiveConnection();
    try {
      await reserved`commit`;
    } finally {
      await reserved.release();
      this.reset();
    }
  }

  public async rollback(): Promise<void> {
    const reserved = this.requireActiveConnection();
    try {
      await reserved`rollback`;
    } finally {
      await reserved.release();
      this.reset();
    }
  }

  public isActive(): boolean {
    return this.active;
  }

  /** Returns the Drizzle instance bound to this transaction. */
  public getDatabase(): DrizzleDatabase {
    if (!this.database || !this.active) {
      throw new Error("A PostgreSQL unit of work must be active before accessing its database");
    }
    return this.database;
  }

  private requireActiveConnection() {
    if (!this.active || !this.reserved) {
      throw new Error("No active PostgreSQL unit of work");
    }
    return this.reserved;
  }

  private reset(): void {
    this.reserved = null;
    this.database = null;
    this.active = false;
  }
}
