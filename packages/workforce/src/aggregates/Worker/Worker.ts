import type {
  DepartmentId,
  OrganizationId,
  TeamId,
} from "@creative-lab/organization";
import {
  WorkerStatus,
  canTransitionWorkerStatus,
} from "../../enums/WorkerStatus.js";
import { EmploymentType } from "../../enums/EmploymentType.js";
import {
  InvalidWorkerStatusTransitionError,
  WorkerArchivedError,
  WorkerValidationError,
} from "../../errors/WorkforceErrors.js";
import {
  WorkerArchived,
  WorkerCreated,
  WorkerUpdated,
} from "../../events/worker-events.js";
import { AggregateRoot } from "@creative-lab/core";
import {
  asWorkerId,
  type PositionId,
  type WorkerId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { WorkerName } from "../../value-objects/WorkerName.js";
import { EmailAddress } from "../../value-objects/EmailAddress.js";
import { PhoneNumber } from "../../value-objects/PhoneNumber.js";
import { EmployeeNumber } from "../../value-objects/EmployeeNumber.js";

export type CreateWorkerProps = {
  organizationId: OrganizationId;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  email: string;
  phone?: string | null;
  employmentType: EmploymentType;
  departmentId: DepartmentId;
  teamId?: TeamId | null;
  positionId?: PositionId | null;
  managerId?: WorkerId | null;
  dateJoined?: Date;
  id?: string;
  now?: Date;
};

export type WorkerSnapshot = {
  id: WorkerId;
  organizationId: OrganizationId;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string;
  phone: string | null;
  status: WorkerStatus;
  employmentType: EmploymentType;
  positionId: PositionId | null;
  departmentId: DepartmentId;
  teamId: TeamId | null;
  managerId: WorkerId | null;
  dateJoined: Date;
  dateLeft: Date | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export class Worker extends AggregateRoot<WorkerId> {

  private constructor(
    id: WorkerId,
    private readonly _organizationId: OrganizationId,
    private _employeeNumber: EmployeeNumber,
    private _name: WorkerName,
    private _email: EmailAddress,
    private _phone: PhoneNumber | null,
    private _status: WorkerStatus,
    private _employmentType: EmploymentType,
    private _positionId: PositionId | null,
    private _departmentId: DepartmentId,
    private _teamId: TeamId | null,
    private _managerId: WorkerId | null,
    private readonly _dateJoined: Date,
    private _dateLeft: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateWorkerProps): Worker {
    if (!props.departmentId) {
      throw new WorkerValidationError("Worker must belong to a department.");
    }
    if (
      props.managerId !== undefined &&
      props.managerId !== null &&
      props.id &&
      props.managerId === props.id
    ) {
      throw new WorkerValidationError("Worker cannot report to themselves.");
    }

    const name = WorkerName.create({
      firstName: props.firstName,
      lastName: props.lastName,
      preferredName: props.preferredName,
    });
    const email = EmailAddress.create(props.email);
    const employeeNumber = EmployeeNumber.create(props.employeeNumber);
    const phone = PhoneNumber.create(props.phone);
    if (!Object.values(EmploymentType).includes(props.employmentType)) {
      throw new WorkerValidationError(
        `Invalid employment type: ${String(props.employmentType)}`,
      );
    }

    const now = props.now ?? new Date();
    const id = asWorkerId(props.id ?? generateId());
    if (props.managerId === id) {
      throw new WorkerValidationError("Worker cannot report to themselves.");
    }

    const worker = new Worker(
      id,
      props.organizationId,
      employeeNumber,
      name,
      email,
      phone,
      WorkerStatus.ACTIVE,
      props.employmentType,
      props.positionId ?? null,
      props.departmentId,
      props.teamId ?? null,
      props.managerId ?? null,
      props.dateJoined ?? now,
      null,
      now,
      now,
      null,
    );

    worker.record(
      WorkerCreated.create({
        organizationId: props.organizationId,
        workerId: id,
        employeeNumber: employeeNumber.value,
        email: email.value,
        status: WorkerStatus.ACTIVE,
        employmentType: props.employmentType,
        occurredAt: now,
      }),
    );

    return worker;
  }

  static reconstitute(snapshot: WorkerSnapshot): Worker {
    return new Worker(
      snapshot.id,
      snapshot.organizationId,
      EmployeeNumber.create(snapshot.employeeNumber),
      WorkerName.create({
        firstName: snapshot.firstName,
        lastName: snapshot.lastName,
        preferredName: snapshot.preferredName,
      }),
      EmailAddress.create(snapshot.email),
      PhoneNumber.create(snapshot.phone),
      snapshot.status,
      snapshot.employmentType,
      snapshot.positionId,
      snapshot.departmentId,
      snapshot.teamId,
      snapshot.managerId,
      new Date(snapshot.dateJoined),
      snapshot.dateLeft ? new Date(snapshot.dateLeft) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get employeeNumber(): EmployeeNumber {
    return this._employeeNumber;
  }
  get name(): WorkerName {
    return this._name;
  }
  get firstName(): string {
    return this._name.firstName;
  }
  get lastName(): string {
    return this._name.lastName;
  }
  get preferredName(): string | null {
    return this._name.preferredName;
  }
  get email(): EmailAddress {
    return this._email;
  }
  get phone(): PhoneNumber | null {
    return this._phone;
  }
  get status(): WorkerStatus {
    return this._status;
  }
  get employmentType(): EmploymentType {
    return this._employmentType;
  }
  get positionId(): PositionId | null {
    return this._positionId;
  }
  get departmentId(): DepartmentId {
    return this._departmentId;
  }
  get teamId(): TeamId | null {
    return this._teamId;
  }
  get managerId(): WorkerId | null {
    return this._managerId;
  }
  get dateJoined(): Date {
    return this._dateJoined;
  }
  get dateLeft(): Date | null {
    return this._dateLeft;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get archivedAt(): Date | null {
    return this._archivedAt;
  }
  get isArchived(): boolean {
    return this._status === WorkerStatus.ARCHIVED;
  }

  update(props: {
    firstName?: string;
    lastName?: string;
    preferredName?: string | null;
    email?: string;
    phone?: string | null;
    employmentType?: EmploymentType;
    departmentId?: DepartmentId;
    teamId?: TeamId | null;
    positionId?: PositionId | null;
    managerId?: WorkerId | null;
    now?: Date;
  }): void {
    this.assertNotArchived();
    const now = props.now ?? new Date();

    if (
      props.firstName !== undefined ||
      props.lastName !== undefined ||
      props.preferredName !== undefined
    ) {
      this._name = WorkerName.create({
        firstName: props.firstName ?? this._name.firstName,
        lastName: props.lastName ?? this._name.lastName,
        preferredName:
          props.preferredName !== undefined
            ? props.preferredName
            : this._name.preferredName,
      });
    }
    if (props.email !== undefined) {
      this._email = EmailAddress.create(props.email);
    }
    if (props.phone !== undefined) {
      this._phone = PhoneNumber.create(props.phone);
    }
    if (props.employmentType !== undefined) {
      this._employmentType = props.employmentType;
    }
    if (props.departmentId !== undefined) {
      this._departmentId = props.departmentId;
    }
    if (props.teamId !== undefined) {
      this._teamId = props.teamId;
    }
    if (props.positionId !== undefined) {
      this._positionId = props.positionId;
    }
    if (props.managerId !== undefined) {
      if (props.managerId === this.id) {
        throw new WorkerValidationError("Worker cannot report to themselves.");
      }
      this._managerId = props.managerId;
    }

    this._updatedAt = now;
    this.emitUpdated(now);
  }

  assignManager(managerId: WorkerId | null, now: Date = new Date()): void {
    this.assertNotArchived();
    if (managerId === this.id) {
      throw new WorkerValidationError("Worker cannot report to themselves.");
    }
    this._managerId = managerId;
    this._updatedAt = now;
    this.emitUpdated(now);
  }

  changeStatus(to: WorkerStatus, now: Date = new Date()): void {
    this.assertNotArchived();
    if (!canTransitionWorkerStatus(this._status, to)) {
      throw new InvalidWorkerStatusTransitionError(this._status, to);
    }
    if (this._status === to) return;
    if (to === WorkerStatus.ARCHIVED) {
      this.archive(now);
      return;
    }
    if (to === WorkerStatus.TERMINATED && !this._dateLeft) {
      this._dateLeft = now;
    }
    this._status = to;
    this._updatedAt = now;
    this.emitUpdated(now);
  }

  archive(now: Date = new Date()): void {
    if (this.isArchived) {
      throw new WorkerArchivedError(this.id);
    }
    if (!canTransitionWorkerStatus(this._status, WorkerStatus.ARCHIVED)) {
      throw new InvalidWorkerStatusTransitionError(
        this._status,
        WorkerStatus.ARCHIVED,
      );
    }
    this._status = WorkerStatus.ARCHIVED;
    this._archivedAt = now;
    this._dateLeft = this._dateLeft ?? now;
    this._updatedAt = now;
    this.record(
      WorkerArchived.create({
        organizationId: this._organizationId,
        workerId: this.id,
        archivedAt: now,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): WorkerSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      employeeNumber: this._employeeNumber.value,
      firstName: this._name.firstName,
      lastName: this._name.lastName,
      preferredName: this._name.preferredName,
      email: this._email.value,
      phone: this._phone?.value ?? null,
      status: this._status,
      employmentType: this._employmentType,
      positionId: this._positionId,
      departmentId: this._departmentId,
      teamId: this._teamId,
      managerId: this._managerId,
      dateJoined: new Date(this._dateJoined),
      dateLeft: this._dateLeft ? new Date(this._dateLeft) : null,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
      archivedAt: this._archivedAt ? new Date(this._archivedAt) : null,
    };
  }

  private emitUpdated(now: Date): void {
    this.record(
      WorkerUpdated.create({
        organizationId: this._organizationId,
        workerId: this.id,
        firstName: this._name.firstName,
        lastName: this._name.lastName,
        email: this._email.value,
        status: this._status,
        departmentId: this._departmentId,
        teamId: this._teamId,
        positionId: this._positionId,
        managerId: this._managerId,
        occurredAt: now,
      }),
    );
  }

  private assertNotArchived(): void {
    if (this.isArchived) {
      throw new WorkerArchivedError(this.id);
    }
  }
}
