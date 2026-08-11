import type { Program } from "../aggregates/Program/Program.js";
import type { PortfolioId, ProgramId } from "../types/ids.js";

export interface ProgramRepository {
  findById(id: ProgramId): Promise<Program | null>;
  findByPortfolio(portfolioId: PortfolioId): Promise<Program[]>;
  save(program: Program): Promise<void>;
  update(program: Program): Promise<void>;
  exists(id: ProgramId): Promise<boolean>;
}
