import * as E from "./Either";
import * as O from "./Option";
import { NonEmptyArray } from "./NonEmptyArray";
import { pipe } from "./pipe";

const getVariable = (key: string): O.Option<string> => O.of(process.env[key]);

const get = <T>(key: string, fn: (v: string) => O.Option<T>): E.Either<string, T> =>
  pipe(
    getVariable(key),
    O.flatMap(fn),
    O.toEither(`Couldn't read ${key} from environment`)
  );

/*
 * Read a `number` value from the environment, safely returning an `Either<string, number>`
 */
export const getInt = (key: string): E.Either<string, number> =>
  get(key, v => {
    const attempt = parseInt(v);
    return isNaN(attempt) ? O.none() : O.of(attempt);
  });

/*
 * Read a `string` value from the environment, safely returning an `Either<string, string>`
 */
export const getString = (key: string): E.Either<string, string> => get(key, O.of);

/*
 * Read a `boolean` value from the environment, safely returning an `Either<string, boolean>`
 */
export const getBoolean = (key: string): E.Either<string, boolean> =>
  get(key, v => {
    const cased = v.toLowerCase();

    return cased === "true" ? O.of(true) : cased === "false" ? O.of(false) : O.none();
  });

/*
 * Read a `string[]` value from the environment, safely returning an `Either<string, string[]>`
 */
export const getStringList = (key: string, delim = ","): E.Either<string, string[]> => get(key, v => {
  const array = v.length < 1 ? [] : v.split(delim).map(x => x.trim())
  return O.of(array.filter(i => i.length > 0))
});

type ConfigTypeMap = {
  string: string
  boolean: boolean
  number: number
  list: string[]
}

/*
 * Available values for use in the config micro format
 */
type ConfigType = "number" | "string" | "boolean" | "list"

/*
 * This describes the config micro format used to describe config values to read
 */
type ConfigDesc<C, T extends keyof C = keyof C> = {
  key: string
  type: T
  default?: C[T]
}

type AnyConfigDesc<C = ConfigTypeMap, T extends keyof C = keyof C> = T extends keyof C ? ConfigDesc<C, T> : never

type ConfigValue = { [x: string]: AnyConfigDesc }

export type ValidatedConfig<D extends ConfigValue> = E.Either<NonEmptyArray<string>, { [K in keyof D]: ConfigTypeMap[D[K]["type"]] }>

export type Infer<T extends ValidatedConfig<any>> = T extends E.Either<NonEmptyArray<string>, infer A> ? A : never

const getTypeReader = (type: ConfigType) => {
  switch (type) {
    case "string":
      return getString;
    case "number":
      return getInt;
    case "boolean":
      return getBoolean;
    case "list":
      return getStringList;
  }
};

export const getConfig = E.sequenceR;

/*
 * Given the `ConfigValue` description, read the values from the node process environment
 * and accumulate any errors into the resulting Either.
 * The right side of the returned Either is inferred from the provided config value.
 * @example
 * import { getConfig, getConfigUnsafe, Infer, readFromEnvironment } from './index'
 *
 * const databaseConfig = readFromEnvironment({
 *   dbName: { key: 'DATABASE_NAME', type: 'string' },
 *   connectionString: { key: 'DATABASE_CONN_STR', type: 'string' },
 *   autoCommit: { key: 'DATABASE_AUTO_COMMIT', type: 'boolean', default: false }
 * })
 */
export function readFromEnvironment<Desc extends ConfigValue>(desc: Desc): ValidatedConfig<Desc>
export function readFromEnvironment(desc: ConfigValue): ValidatedConfig<ConfigValue> {
  const objectKeys = Object.keys(desc);

  const readConfig = objectKeys.reduce((acc, k) => {
    const { key, type } = desc[k];
    const alt = O.of(desc[k].default);

    const value = pipe(
      getTypeReader(type)(key),
      E.flatMapLeft((e: string) => O.toEither([e] as NonEmptyArray<string>)(alt)),
      E.mapLeft(e => e)
    );

    return {
      ...acc,
      [k]: value
    };
  }, {});

  return getConfig(readConfig);
}

/*
 * Utility type to infer the config type from a ValidatedConfig<T> for use in the application.
 * @example
 * const databaseConfig = readFromEnvironment({
 *
 * dbName: { key: "DATABASE_NAME", type: 'string' },
 *   connectionString: { key: "DATABASE_CONN_STR", type: 'string' },
 *   autoCommit: { key: "DATABASE_AUTO_COMMIT", type: 'boolean', default: false }
 *  })
 *
 * // Grabs the type for use in the app code, type would be { region: string, secret: string, services: string[] }
 * type DBConfig = Infer<typeof databaseConfig>
 *
 *  Resulting type of DBConfig is
 *  {
 *    dbName: string,
 *    connectionString: string,
 *    autoCommit: boolean
 *  }
 */
export type InferConfig<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>> = {
  [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never
}

export function getConfigUnsafe<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>>(
  validated: Rec
): {
  [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never
}
export function getConfigUnsafe(validated: Record<string, E.Either<NonEmptyArray<string>, any>>) {
  return pipe(
    getConfig(validated),
    E.match(
      {
        Left: errs => {
          throw new Error(`Missing config keys at startup: ${errs.join(", ")}`);
        },
        Right: cfg => cfg
      }
    )
  );
}
