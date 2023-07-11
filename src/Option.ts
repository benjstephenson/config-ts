import * as E from './Either'

export type Option<A> = Some<A> | None

export type Some<A> = {
  readonly _tag: 'some'
  readonly value: A
}

export type None = {
  readonly _tag: 'none'
}

export const none = (): None => ({ _tag: 'none' })
export const some = <A>(a: A): Some<A> => ({
  _tag: 'some',
  value: a
})

export const of = <A>(a: A | undefined | null): Option<A> => (a === undefined || a === null ? none() : some(a))

export const isSome = <A>(fa: Option<A>): fa is Some<A> => fa._tag === 'some'
export const isNone = <A>(fa: Option<A>): fa is None => fa._tag === 'none'

export const map =
  <A, B>(f: (a: A) => B) =>
  (fa: Option<A>): Option<B> =>
    isSome(fa) ? some(f(fa.value)) : fa

export const orElse =
  <A>(a: A) =>
  (fa: Option<A>): A =>
    isSome(fa) ? fa.value : a

export const flatMap =
  <A, B>(f: (a: A) => Option<B>) =>
  (fa: Option<A>): Option<B> =>
    isSome(fa) ? f(fa.value) : fa

export const toEither =
  <E, A>(e: E) =>
  (fa: Option<A>): E.Either<E, A> =>
    isSome(fa) ? E.right(fa.value) : E.left(e)
