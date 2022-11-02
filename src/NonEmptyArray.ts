export type NonEmptyArray<T> = Array<T> & {
  readonly 0: T
}

export const concat = <A>(a: NonEmptyArray<A>, b: A[]): NonEmptyArray<A> => [...a, ...b] as NonEmptyArray<A>
