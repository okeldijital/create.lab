/**
 * Transaction boundary port.
 * Infrastructure implements persistence-backed units of work later.
 */
export interface UnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}
