import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { InteractionType } from "../../enums/InteractionType.js";
import { CRMValidationError } from "../../errors/CRMErrors.js";
import { InteractionRecorded } from "../../events/crm-events.js";
import {
  asInteractionId,
  type ContactId,
  type CustomerId,
  type InteractionId,
} from "../../types/ids.js";
import { InteractionSummary } from "../../value-objects/InteractionSummary.js";

export type CreateInteractionProps = {
  organizationId: OrganizationId;
  customerId: CustomerId;
  contactId?: ContactId | null;
  type: InteractionType;
  summary: string;
  occurredAt?: Date;
  id?: string;
  now?: Date;
};

export type InteractionSnapshot = {
  id: InteractionId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  contactId: string | null;
  type: InteractionType;
  summary: string;
  occurredAt: Date;
  createdAt: Date;
};

/**
 * Communication history record. Immutable after creation.
 */
export class Interaction extends AggregateRoot<InteractionId> {
  private constructor(
    id: InteractionId,
    private readonly _organizationId: OrganizationId,
    private readonly _customerId: CustomerId,
    private readonly _contactId: ContactId | null,
    private readonly _type: InteractionType,
    private readonly _summary: InteractionSummary,
    private readonly _occurredAt: Date,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateInteractionProps): Interaction {
    if (!props.customerId) {
      throw new CRMValidationError("Interaction requires a customer.");
    }
    if (!Object.values(InteractionType).includes(props.type)) {
      throw new CRMValidationError(
        `Invalid interaction type: ${String(props.type)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asInteractionId(props.id ?? generateId());
    const occurredAt = props.occurredAt
      ? new Date(props.occurredAt)
      : now;
    const interaction = new Interaction(
      id,
      props.organizationId,
      props.customerId,
      props.contactId ?? null,
      props.type,
      InteractionSummary.create(props.summary),
      occurredAt,
      now,
    );
    interaction.record(
      InteractionRecorded.create({
        organizationId: props.organizationId,
        interactionId: id,
        customerId: props.customerId,
        contactId: props.contactId ?? null,
        type: props.type,
        occurredAt: now,
      }),
    );
    return interaction;
  }

  static reconstitute(snapshot: InteractionSnapshot): Interaction {
    return new Interaction(
      snapshot.id,
      snapshot.organizationId,
      snapshot.customerId,
      (snapshot.contactId as ContactId | null) ?? null,
      snapshot.type,
      InteractionSummary.create(snapshot.summary),
      new Date(snapshot.occurredAt),
      new Date(snapshot.createdAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get customerId(): CustomerId {
    return this._customerId;
  }
  get contactId(): ContactId | null {
    return this._contactId;
  }
  get type(): InteractionType {
    return this._type;
  }
  get summary(): InteractionSummary {
    return this._summary;
  }
  get occurredAt(): Date {
    return new Date(this._occurredAt);
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toSnapshot(): InteractionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      customerId: this._customerId,
      contactId: this._contactId,
      type: this._type,
      summary: this._summary.value,
      occurredAt: this.occurredAt,
      createdAt: this.createdAt,
    };
  }
}
