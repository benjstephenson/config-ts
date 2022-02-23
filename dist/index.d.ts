import { E } from '@benjstephenson/kittens-ts';
import { NonEmptyArray } from '@benjstephenson/kittens-ts/dist/src/NonEmptyArray';
export declare const getInt: (key: string) => E.Either<string, number>;
export declare const getString: (key: string) => E.Either<string, string>;
export declare const getBoolean: (key: string) => E.Either<string, boolean>;
export declare const getStringList: (key: string, delim?: string) => E.Either<string, string[]>;
declare type ReifyConfigType<T> = T extends {
    type: 'string';
} ? string : T extends {
    type: 'boolean';
} ? boolean : T extends {
    type: 'number';
} ? number : T extends {
    type: 'list';
} ? string[] : never;
declare type ConfigType = 'number' | 'string' | 'boolean' | 'list';
declare type ConfigDesc = Record<string, {
    key: string;
    type: ConfigType;
}>;
export declare function readFromEnvironment<Desc extends ConfigDesc>(desc: Desc): E.Either<NonEmptyArray<string>, {
    [K in keyof Desc]: ReifyConfigType<Desc[K]>;
}>;
export declare function getConfigUnsafe<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>>(validated: Rec): {
    [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never;
};
export {};
