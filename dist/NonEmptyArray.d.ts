export type NonEmptyArray<T> = Array<T> & {
    readonly 0: T;
};
export declare const concat: <A>(a: NonEmptyArray<A>, b: A[]) => NonEmptyArray<A>;
