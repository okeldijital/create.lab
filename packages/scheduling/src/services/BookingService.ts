import { Booking } from "../aggregates/Booking/Booking.js";
import type { CreateBookingProps } from "../aggregates/Booking/Booking.js";
import {
  BookingNotFoundError,
  ScheduleNotFoundError,
  TimeBlockNotFoundError,
} from "../errors/SchedulingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { BookingPolicy } from "../policies/BookingPolicy.js";
import type { BookingRepository } from "../repositories/BookingRepository.js";
import type { ScheduleRepository } from "../repositories/ScheduleRepository.js";
import type { TimeBlockRepository } from "../repositories/TimeBlockRepository.js";
import type { BookingId, ScheduleId } from "../types/ids.js";

export type BookingServiceDeps = {
  bookingRepository: BookingRepository;
  scheduleRepository: ScheduleRepository;
  timeBlockRepository: TimeBlockRepository;
  eventPublisher: DomainEventPublisher;
};

export class BookingService {
  constructor(private readonly deps: BookingServiceDeps) {}

  async create(props: CreateBookingProps): Promise<Booking> {
    const schedule = await this.deps.scheduleRepository.findById(
      props.scheduleId,
    );
    if (!schedule) throw new ScheduleNotFoundError(props.scheduleId);

    const timeBlock = await this.deps.timeBlockRepository.findById(
      props.timeBlockId,
    );
    if (!timeBlock) throw new TimeBlockNotFoundError(props.timeBlockId);

    const existingOnBlock = await this.deps.bookingRepository.findByTimeBlock(
      props.timeBlockId,
    );
    BookingPolicy.assertCanCreate(schedule, timeBlock, existingOnBlock);

    const booking = Booking.create(props);
    await this.deps.bookingRepository.save(booking);
    await this.deps.eventPublisher.publish(booking.pullDomainEvents());
    return booking;
  }

  async getById(id: BookingId): Promise<Booking> {
    const booking = await this.deps.bookingRepository.findById(id);
    if (!booking) throw new BookingNotFoundError(id);
    return booking;
  }

  async listBySchedule(scheduleId: ScheduleId): Promise<Booking[]> {
    return this.deps.bookingRepository.findBySchedule(scheduleId);
  }

  async cancel(id: BookingId, now?: Date): Promise<Booking> {
    const booking = await this.getById(id);
    BookingPolicy.assertCanCancel(booking);
    booking.cancel(now);
    await this.deps.bookingRepository.update(booking);
    await this.deps.eventPublisher.publish(booking.pullDomainEvents());
    return booking;
  }

  async complete(id: BookingId, now?: Date): Promise<Booking> {
    const booking = await this.getById(id);
    booking.complete(now);
    await this.deps.bookingRepository.update(booking);
    await this.deps.eventPublisher.publish(booking.pullDomainEvents());
    return booking;
  }

  async confirm(id: BookingId, now?: Date): Promise<Booking> {
    const booking = await this.getById(id);
    booking.confirm(now);
    await this.deps.bookingRepository.update(booking);
    await this.deps.eventPublisher.publish(booking.pullDomainEvents());
    return booking;
  }
}
