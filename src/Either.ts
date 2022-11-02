import {NonEmptyArray, concat} from "./NonEmptyArray"
import {pipe} from "./pipe"

export type Either<E, A> = Left<E> | Right<A>

export type Left<E> = {
  readonly _tag: 'left',
  readonly value: E
}

export type Right<A> = {
  readonly _tag: 'right',
  readonly value: A
}


export const left = <E>(e: E): Left<E> => ({_tag: 'left', value: e})
export const right = <A>(a: A): Right<A> => ({_tag: 'right', value: a})

export const isLeft = <E, A>(e: Either<E, A>): e is Left<E> => e._tag === 'left'
export const isRight = <E, A>(e: Either<E, A>): e is Right<A> => e._tag === 'right'

export const map =
  <A, B>(f: (a: A) => B) =>
    <E>(fa: Either<E, A>): Either<E, B> =>
      isRight(fa) ? right(f(fa.value)) : fa

export const flatMap =
  <E, A, B>(f: (a: A) => Either<E, B>) =>
    (fa: Either<E, A>): Either<E, B> =>
      isRight(fa) ? f(fa.value) : fa

export const mapLeft =
  <E, E2>(f: (a: E) => E2) =>
    <A>(fa: Either<E, A>): Either<E2, A> =>
      isLeft(fa) ? left(f(fa.value)) : right(fa.value)

export const flatMapLeft =
  <E, E2, A>(f: (e: E) => Either<E2, A>) =>
    (fa: Either<E, A>): Either<E2, A> =>
      isLeft(fa) ? f(fa.value) : right(fa.value)


export const match = <E, A, B>(o: { Left: (e: E) => B, Right: (a: A) => B }) => (fa: Either<E, A>) =>
  isLeft(fa) ? o.Left(fa.value) : o.Right(fa.value)

export function sequenceR<R extends Record<string, Either<NonEmptyArray<string>, any>>>(
  record: R
): Either<NonEmptyArray<string>, { [K in keyof R]: R[K] extends Either<NonEmptyArray<string>, infer A> ? A : never }>
export function sequenceR(record: Record<string, Either<NonEmptyArray<string>, any>>): Either<NonEmptyArray<string>, Record<string, any>> {
  const [head, ...tail] = Object.keys(record)

  const initial = pipe(
    record[head],
    mapLeft(e => e as NonEmptyArray<string>),
    map(v => ({[head]: v}))
  )

  return tail.reduce(
    (acc, key) =>
      pipe(
        record[key],
        match({
          Left: err =>
            isLeft(acc) ? left(concat(acc.value, err)) : left(err),
          Right: val =>
            isLeft(acc) ? left(acc.value) : right({...acc.value, [key]: val})
        })
      ),
    initial
  )
}
