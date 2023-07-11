import * as E from './Either';
import { NonEmptyArray } from './NonEmptyArray';
export declare const getInt: (key: string) => E.Either<string, number>;
export declare const getString: (key: string) => E.Either<string, string>;
export declare const getBoolean: (key: string) => E.Either<string, boolean>;
export declare const getStringList: (key: string, delim?: string) => E.Either<string, string[]>;
type ConfigTypeMap = {
    string: string;
    boolean: boolean;
    number: number;
    list: string[];
};
type ConfigDesc<C, T extends keyof C = keyof C> = {
    key: string;
    type: T;
    default?: C[T];
    override?: (key: string) => PromiseLike<C[T]>;
};
type AnyConfigDesc<C = ConfigTypeMap, T extends keyof C = keyof C> = T extends keyof C ? ConfigDesc<C, T> : never;
type ConfigValue = {
    [x: string]: AnyConfigDesc;
};
export type ValidatedConfig<D extends ConfigValue> = E.Either<NonEmptyArray<string>, {
    [K in keyof D]: ConfigTypeMap[D[K]['type']];
}>;
export type Infer<T extends ValidatedConfig<ConfigValue>> = T extends E.Right<infer A> ? A : never;
export type Infer22<T extends ValidatedConfig<ConfigValue> | Promise<ValidatedConfig<ConfigValue>>> = T extends E.Right<infer A> ? A : T extends Promise<ValidatedConfig<ConfigValue>> ? Infer22<Awaited<T>> : never;
export declare const getConfig: typeof E.sequenceR;
export declare function readFromEnvironment<Desc extends ConfigValue>(desc: Desc): Promise<ValidatedConfig<Desc>>;
export type InferConfig<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>> = {
    [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never;
};
export declare function getConfigUnsafe<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>>(validated: Rec): {
    [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never;
};
export {};
