import * as E from './Either';
export type Option<A> = Some<A> | None;
export type Some<A> = {
    readonly _tag: 'some';
    readonly value: A;
};
export type None = {
    readonly _tag: 'none';
};
export declare const none: () => None;
export declare const some: <A>(a: A) => Some<A>;
export declare const of: <A>(a: A | null | undefined) => Option<A>;
export declare const isSome: <A>(fa: Option<A>) => fa is Some<A>;
export declare const isNone: <A>(fa: Option<A>) => fa is None;
export declare const ap: <A, B>(fa: Option<A>) => (fab: Option<(a: A) => B>) => Option<B>;
export declare const map: <A, B>(f: (a: A) => B) => (fa: Option<A>) => Option<B>;
export declare const orElse: <A>(a: A) => (fa: Option<A>) => A;
export declare const flatMap: <A, B>(f: (a: A) => Option<B>) => (fa: Option<A>) => Option<B>;
export declare const toEither: <E, A>(e: E) => (fa: Option<A>) => E.Either<E, A>;
