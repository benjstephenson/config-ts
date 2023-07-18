import { NonEmptyArray } from './NonEmptyArray';
export type Either<E, A> = Left<E> | Right<A>;
export type Left<E> = {
    readonly _tag: 'left';
    readonly value: E;
};
export type Right<A> = {
    readonly _tag: 'right';
    readonly value: A;
};
export declare const left: <E>(e: E) => Left<E>;
export declare const right: <A>(a: A) => Right<A>;
export declare const isLeft: <E, A>(e: Either<E, A>) => e is Left<E>;
export declare const isRight: <E, A>(e: Either<E, A>) => e is Right<A>;
export declare const map: <A, B>(f: (a: A) => B) => <E>(fa: Either<E, A>) => Either<E, B>;
export declare const flatMap: <E, A, B>(f: (a: A) => Either<E, B>) => (fa: Either<E, A>) => Either<E, B>;
export declare const mapLeft: <E, E2>(f: (a: E) => E2) => <A>(fa: Either<E, A>) => Either<E2, A>;
export declare const flatMapLeft: <E, E2, A>(f: (e: E) => Either<E2, A>) => (fa: Either<E, A>) => Either<E2, A>;
export declare const match: <E, A, B>(o: {
    Left: (e: E) => B;
    Right: (a: A) => B;
}) => (fa: Either<E, A>) => B;
export declare const flatten: <E, A>(fa: Either<E, Either<E, A>>) => Either<E, A>;
export declare function sequenceR<T, R extends Record<string, Either<NonEmptyArray<string>, T>>>(record: R): Either<NonEmptyArray<string>, {
    [K in keyof R]: R[K] extends Either<NonEmptyArray<string>, infer A> ? A : never;
}>;
