import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import { Allocation } from "../aggregates/Allocation/Allocation.js";
import {
  Reservation,
  type CreateReservationProps,
} from "../aggregates/Reservation/Reservation.js";
import type { ResourceType } from "../enums/ResourceType.js";
import type { AllocationPriority } from "../enums/AllocationPriority.js";
import { ReservationNotFoundError } from "../errors/AllocationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import {
  AllocationConflictPolicy,
  ReservationPolicy,
} from "../policies/index.js";
import type { AllocationRepository } from "../repositories/AllocationRepository.js";
import type { ReservationRepository } from "../repositories/ReservationRepository.js";
import type { ReservationId } from "../types/ids.js";

export type ReservationServiceDeps = {
  reservationRepository: ReservationRepository;
  allocationRepository: AllocationRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export type ConvertReservationProps = {
  workOrderId: WorkOrderId;
  resourceType: ResourceType;
  allocationPercentage: number;
  priority?: AllocationPriority;
  notes?: string | null;
  /** Defaults to reservation period */
  startDate?: Date;
  endDate?: Date;
  now?: Date;
};

export class ReservationService {
  constructor(private readonly deps: ReservationServiceDeps) {}

  async request(props: CreateReservationProps): Promise<Reservation> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const reservation = Reservation.create(props);
    await this.deps.reservationRepository.save(reservation);
    await this.deps.eventPublisher.publish(reservation.pullDomainEvents());
    return reservation;
  }

  async approve(id: ReservationId, now?: Date): Promise<Reservation> {
    const reservation = await this.getById(id);
    ReservationPolicy.assertCanApprove(reservation);
    reservation.approve(now);
    await this.deps.reservationRepository.update(reservation);
    await this.deps.eventPublisher.publish(reservation.pullDomainEvents());
    return reservation;
  }

  async cancel(id: ReservationId, now?: Date): Promise<Reservation> {
    const reservation = await this.getById(id);
    ReservationPolicy.assertCanCancel(reservation);
    reservation.cancel(now);
    await this.deps.reservationRepository.cancel(id);
    await this.deps.reservationRepository.update(reservation);
    await this.deps.eventPublisher.publish(reservation.pullDomainEvents());
    return reservation;
  }

  /**
   * Convert approved reservation → Allocation.
   * Publishes ReservationConverted and AllocationCreated.
   */
  async convert(
    id: ReservationId,
    props: ConvertReservationProps,
  ): Promise<{ reservation: Reservation; allocation: Allocation }> {
    const reservation = await this.getById(id);
    ReservationPolicy.assertCanConvert(reservation);

    const start = props.startDate ?? reservation.reservedFrom;
    const end = props.endDate ?? reservation.reservedUntil;
    const now = props.now ?? new Date();

    const byResource = await this.deps.allocationRepository.findByResource(
      reservation.resourceId,
    );
    AllocationConflictPolicy.detectConflicts({
      existing: byResource,
      resourceId: reservation.resourceId,
      workOrderId: props.workOrderId,
      start: new Date(start),
      end: new Date(end),
    });

    const allocation = Allocation.create({
      organizationId: reservation.organizationId,
      projectId: reservation.projectId,
      workOrderId: props.workOrderId,
      resourceId: reservation.resourceId,
      resourceType: props.resourceType,
      allocationPercentage: props.allocationPercentage,
      startDate: start,
      endDate: end,
      priority: props.priority,
      notes: props.notes,
      now,
      skipCreatedEvent: true,
    });
    allocation.recordCreatedFromReservation(now);

    reservation.convert(allocation.id, now);

    await this.deps.allocationRepository.save(allocation);
    await this.deps.reservationRepository.convert(id);
    await this.deps.reservationRepository.update(reservation);

    // Publish both event sets: ReservationConverted + AllocationCreated
    await this.deps.eventPublisher.publish([
      ...reservation.pullDomainEvents(),
      ...allocation.pullDomainEvents(),
    ]);

    return { reservation, allocation };
  }

  async getById(id: ReservationId): Promise<Reservation> {
    const reservation = await this.deps.reservationRepository.findById(id);
    if (!reservation) throw new ReservationNotFoundError(id);
    return reservation;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Reservation[]> {
    return this.deps.reservationRepository.findByOrganization(organizationId);
  }
}
