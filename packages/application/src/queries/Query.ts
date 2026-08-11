/**
 * Marker for read-side application inputs.
 * Queries never mutate state.
 */
export interface Query<TType extends string = string> {
  readonly type: TType;
}

export type QueryResult<T = unknown> = {
  readonly data: T;
};
