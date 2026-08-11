import type { WorkingPatternRepository } from "@creative-lab/capacity";
import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import { Shift } from "../aggregates/Shift/Shift.js";
import type { CreateShiftProps } from "../aggregates/Shift/Shift.js";
import type { ShiftType } from "../enums/ShiftType.js";
import { ShiftNotFoundError } from "../errors/SchedulingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ShiftPolicy } from "../policies/ShiftPolicy.js";
import type { ShiftRepository } from "../repositories/ShiftRepository.js";
import type { ShiftId } from "../types/ids.js";

export type ShiftServiceDeps = {
  shiftRepository: ShiftRepository;
  organizationRepository: OrganizationRepository;
  workingPatternRepository: WorkingPatternRepository;
  eventPublisher: DomainEventPublisher;
};

export class ShiftService {
  constructor(private readonly deps: ShiftServiceDeps) {}

  async create(props: CreateShiftProps): Promise<Shift> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const pattern = await this.deps.workingPatternRepository.findById(
      props.workingPatternId,
    );
    ShiftPolicy.assertWorkingPatternBelongs(pattern, props.organizationId);

    const shift = Shift.create(props);
    ShiftPolicy.assertValidDuration(shift);
    await this.deps.shiftRepository.save(shift);
    await this.deps.eventPublisher.publish(shift.pullDomainEvents());
    return shift;
  }

  async getById(id: ShiftId): Promise<Shift> {
    const shift = await this.deps.shiftRepository.findById(id);
    if (!shift) throw new ShiftNotFoundError(id);
    return shift;
  }

  async listByOrganization(organizationId: OrganizationId): Promise<Shift[]> {
    return this.deps.shiftRepository.findByOrganization(organizationId);
  }

  async update(
    id: ShiftId,
    props: {
      name?: string;
      startTime?: string;
      endTime?: string;
      shiftType?: ShiftType;
      now?: Date;
    },
  ): Promise<Shift> {
    const shift = await this.getById(id);
    shift.update(props);
    ShiftPolicy.assertValidDuration(shift);
    await this.deps.shiftRepository.update(shift);
    await this.deps.eventPublisher.publish(shift.pullDomainEvents());
    return shift;
  }
}
