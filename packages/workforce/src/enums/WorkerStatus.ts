export const WorkerStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ON_LEAVE: "ON_LEAVE",
  TERMINATED: "TERMINATED",
  ARCHIVED: "ARCHIVED",
} as const;

export type WorkerStatus = (typeof WorkerStatus)[keyof typeof WorkerStatus];

export const WORKER_STATUS_TRANSITIONS: Readonly<
  Record<WorkerStatus, readonly WorkerStatus[]>
> = {
  [WorkerStatus.ACTIVE]: [
    WorkerStatus.INACTIVE,
    WorkerStatus.ON_LEAVE,
    WorkerStatus.TERMINATED,
    WorkerStatus.ARCHIVED,
  ],
  [WorkerStatus.INACTIVE]: [
    WorkerStatus.ACTIVE,
    WorkerStatus.TERMINATED,
    WorkerStatus.ARCHIVED,
  ],
  [WorkerStatus.ON_LEAVE]: [
    WorkerStatus.ACTIVE,
    WorkerStatus.TERMINATED,
    WorkerStatus.ARCHIVED,
  ],
  [WorkerStatus.TERMINATED]: [WorkerStatus.ARCHIVED],
  [WorkerStatus.ARCHIVED]: [],
};

export function canTransitionWorkerStatus(
  from: WorkerStatus,
  to: WorkerStatus,
): boolean {
  if (from === to) return true;
  return WORKER_STATUS_TRANSITIONS[from].includes(to);
}
