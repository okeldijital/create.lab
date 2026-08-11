import { TimeBlock } from "../aggregates/TimeBlock/TimeBlock.js";
import type { CreateTimeBlockProps } from "../aggregates/TimeBlock/TimeBlock.js";
import {
  ScheduleNotFoundError,
  TimeBlockNotFoundError,
} from "../errors/SchedulingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ScheduleLifecyclePolicy } from "../policies/ScheduleLifecyclePolicy.js";
import { TimeBlockPolicy } from "../policies/TimeBlockPolicy.js";
import type { ScheduleRepository } from "../repositories/ScheduleRepository.js";
import type { TimeBlockRepository } from "../repositories/TimeBlockRepository.js";
import type { ScheduleId, TimeBlockId } from "../types/ids.js";

export type TimeBlockServiceDeps = {
  timeBlockRepository: TimeBlockRepository;
  scheduleRepository: ScheduleRepository;
  eventPublisher: DomainEventPublisher;
};

export class TimeBlockService {
  constructor(private readonly deps: TimeBlockServiceDeps) {}

  async create(props: CreateTimeBlockProps): Promise<TimeBlock> {
    const schedule = await this.deps.scheduleRepository.findById(
      props.scheduleId,
    );
    if (!schedule) {
      throw new ScheduleNotFoundError(props.scheduleId);
    }
    ScheduleLifecyclePolicy.assertNotArchived(schedule);
    if (schedule.organizationId !== props.organizationId) {
      throw new ScheduleNotFoundError(
        "Schedule organization mismatch for time block.",
      );
    }

    const existing = await this.deps.timeBlockRepository.findBySchedule(
      props.scheduleId,
    );
    TimeBlockPolicy.assertNoOverlap(existing, {
      start: props.start,
      end: props.end,
    });

    const block = TimeBlock.create(props);
    await this.deps.timeBlockRepository.save(block);
    await this.deps.eventPublisher.publish(block.pullDomainEvents());
    return block;
  }

  async getById(id: TimeBlockId): Promise<TimeBlock> {
    const block = await this.deps.timeBlockRepository.findById(id);
    if (!block) throw new TimeBlockNotFoundError(id);
    return block;
  }

  async listBySchedule(scheduleId: ScheduleId): Promise<TimeBlock[]> {
    return this.deps.timeBlockRepository.findBySchedule(scheduleId);
  }

  async complete(id: TimeBlockId, now?: Date): Promise<TimeBlock> {
    const block = await this.getById(id);
    block.complete(now);
    await this.deps.timeBlockRepository.update(block);
    await this.deps.eventPublisher.publish(block.pullDomainEvents());
    return block;
  }

  async remove(id: TimeBlockId, now?: Date): Promise<TimeBlock> {
    const block = await this.getById(id);
    block.remove(now);
    await this.deps.timeBlockRepository.update(block);
    await this.deps.eventPublisher.publish(block.pullDomainEvents());
    return block;
  }
}
