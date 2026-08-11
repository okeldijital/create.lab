/**
 * Marker for write-side application inputs.
 * Commands carry data only — no behavior.
 */
export interface Command<TType extends string = string> {
  readonly type: TType;
}

export type CommandResult<T = unknown> = {
  readonly data: T;
  readonly eventsPublished: number;
};
