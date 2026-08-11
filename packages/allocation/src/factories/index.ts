import {
  Allocation,
  type CreateAllocationProps,
} from "../aggregates/Allocation/Allocation.js";
import {
  AllocationGroup,
  type CreateAllocationGroupProps,
} from "../aggregates/AllocationGroup/AllocationGroup.js";
import {
  Reservation,
  type CreateReservationProps,
} from "../aggregates/Reservation/Reservation.js";

export const AllocationFactory = {
  create: (props: CreateAllocationProps) => Allocation.create(props),
  reconstitute: Allocation.reconstitute.bind(Allocation),
};

export const AllocationGroupFactory = {
  create: (props: CreateAllocationGroupProps) => AllocationGroup.create(props),
  reconstitute: AllocationGroup.reconstitute.bind(AllocationGroup),
};

export const ReservationFactory = {
  create: (props: CreateReservationProps) => Reservation.create(props),
  reconstitute: Reservation.reconstitute.bind(Reservation),
};
