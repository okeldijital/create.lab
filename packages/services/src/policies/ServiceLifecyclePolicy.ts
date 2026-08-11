import type { Service } from "../aggregates/Service/Service.js";
import {
  ServiceStatus,
  canTransitionService,
} from "../enums/ServiceStatus.js";
import { InvalidServiceStateError } from "../errors/ServicesErrors.js";

export class ServiceLifecyclePolicy {
  static assertCanTransition(service: Service, to: ServiceStatus): void {
    if (service.isArchived) {
      throw new InvalidServiceStateError("Archived services are immutable.");
    }
    if (!canTransitionService(service.status, to)) {
      throw new InvalidServiceStateError(
        `Illegal service transition: ${service.status} → ${to}.`,
      );
    }
  }

  static assertMutable(service: Service): void {
    if (service.isArchived) {
      throw new InvalidServiceStateError("Archived services are immutable.");
    }
  }

  static assertCanActivate(service: Service): void {
    ServiceLifecyclePolicy.assertCanTransition(service, ServiceStatus.ACTIVE);
  }
}
