import type { Interaction } from "../aggregates/Interaction/Interaction.js";
import type { CustomerId, InteractionId } from "../types/ids.js";

export interface InteractionRepository {
  findById(id: InteractionId): Promise<Interaction | null>;
  findByCustomer(customerId: CustomerId): Promise<Interaction[]>;
  save(interaction: Interaction): Promise<void>;
  exists(id: InteractionId): Promise<boolean>;
}
