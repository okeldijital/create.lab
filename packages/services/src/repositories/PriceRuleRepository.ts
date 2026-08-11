import type { PriceRule } from "../aggregates/PriceRule/PriceRule.js";
import type { PriceBookId, PriceRuleId, ServiceId } from "../types/ids.js";

export interface PriceRuleRepository {
  findById(id: PriceRuleId): Promise<PriceRule | null>;
  findByPriceBook(priceBookId: PriceBookId): Promise<PriceRule[]>;
  findByService(serviceId: ServiceId): Promise<PriceRule[]>;
  findActiveByServiceAndBook(
    serviceId: ServiceId,
    priceBookId: PriceBookId,
  ): Promise<PriceRule | null>;
  save(rule: PriceRule): Promise<void>;
  update(rule: PriceRule): Promise<void>;
  archive(id: PriceRuleId): Promise<void>;
  exists(id: PriceRuleId): Promise<boolean>;
}
