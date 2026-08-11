import {
  WorkSession,
  type CreateWorkSessionProps,
} from "../aggregates/WorkSession/WorkSession.js";
import {
  WorkOrderNotFoundError,
  WorkSessionNotFoundError,
} from "../errors/OperationsErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { SessionPolicy } from "../policies/SessionPolicy.js";
import { WorkLifecyclePolicy } from "../policies/WorkLifecyclePolicy.js";
import type { WorkOrderRepository } from "../repositories/WorkOrderRepository.js";
import type { WorkSessionRepository } from "../repositories/WorkSessionRepository.js";
import type { WorkOrderId, WorkSessionId } from "../types/ids.js";

export type WorkSessionServiceDeps = {
  workSessionRepository: WorkSessionRepository;
  workOrderRepository: WorkOrderRepository;
  eventPublisher: DomainEventPublisher;
};

export class WorkSessionService {
  constructor(private readonly deps: WorkSessionServiceDeps) {}

  async start(props: CreateWorkSessionProps): Promise<WorkSession> {
    const order = await this.deps.workOrderRepository.findById(
      props.workOrderId,
    );
    if (!order) throw new WorkOrderNotFoundError(props.workOrderId);
    WorkLifecyclePolicy.assertAcceptsExecution(order);

    const existing = await this.deps.workSessionRepository.findByWorkOrder(
      props.workOrderId,
    );
    const now = props.now ?? new Date();
    const startedAt = props.startedAt ? new Date(props.startedAt) : now;
    SessionPolicy.assertNoOverlapWithSessions(
      existing,
      { startedAt, endedAt: null },
      now,
    );

    const session = WorkSession.create(props);
    await this.deps.workSessionRepository.save(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async end(
    sessionId: WorkSessionId,
    endedAt?: Date,
  ): Promise<WorkSession> {
    const session = await this.getById(sessionId);
    const end = endedAt ?? new Date();
    const siblings = (
      await this.deps.workSessionRepository.findByWorkOrder(session.workOrderId)
    ).filter((s) => s.id !== session.id);

    SessionPolicy.assertNoOverlapWithSessions(
      siblings,
      { id: session.id, startedAt: session.startedAt, endedAt: end },
      end,
    );

    session.end(end);
    await this.deps.workSessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async pause(sessionId: WorkSessionId, now?: Date): Promise<WorkSession> {
    const session = await this.getById(sessionId);
    session.pause(now);
    await this.deps.workSessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async resume(sessionId: WorkSessionId, now?: Date): Promise<WorkSession> {
    const session = await this.getById(sessionId);
    session.resume(now);
    await this.deps.workSessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async getById(id: WorkSessionId): Promise<WorkSession> {
    const session = await this.deps.workSessionRepository.findById(id);
    if (!session) throw new WorkSessionNotFoundError(id);
    return session;
  }

  async listByWorkOrder(workOrderId: WorkOrderId): Promise<WorkSession[]> {
    return this.deps.workSessionRepository.findByWorkOrder(workOrderId);
  }
}
