import * as E from './Either'
import * as O from './Option'
import { NonEmptyArray, concat} from './NonEmptyArray'
import { compose } from './pipe'
import { None } from './Option'

type Validation<A> = E.Either<NonEmptyArray<string>, A>

const getVariable: (key: string) => Validation<string> = key => compose(
  O.of(process.env[key]),
  O.toEither<NonEmptyArray<string>, string>([`Couldn't read ${key} from environment`])
)

const get: <T>(key: string, fn: (v: string) => Validation<T>) => Validation<T> = (key, fn) =>
  compose(
    getVariable(key),
    E.flatMap(fn)
  )

const readInt: (key: string) => (v: string) => Validation<number> = k => v => {
  const attempt = parseInt(v)
  return isNaN(attempt) ? E.left([`Key [${k}] provided invalid integer [${v}]`]) : E.right(attempt)
}

/*
 * Read a `number` value from the environment, safely returning an `Either<string[], number>`
 */
export const getInt = (key: string): Validation<number> => get(key, readInt(key))

/*
 * Read a `string` value from the environment, safely returning an `Either<string[], string>`
 */
export const getString: (key: string) => Validation<string> = key => get(key, E.right)

const readBoolean: (key: string) => (v: string) => Validation<boolean> = k => v => {
  const cased = v.trim().toLowerCase()
  return cased === 'true'
    ? E.right(true)
    : cased === 'false'
      ? E.right(false)
      : E.left([`Key [${k}] provided an invalid boolean [${v}]`])
}

/*
 * Read a `boolean` value from the environment, safely returning an `Either<string[], boolean>`
 */
export const getBoolean: (key: string) => Validation<boolean> = key => get(key, readBoolean(key))

/*
 * Read a `string[]` value from the environment, safely returning an `Either<string[], string[]>`
 */
export const getStringList = (key: string, delim = ','): Validation<string[]> => getList(s => E.of(s))(key, delim)

/*
 * Read a `number[]` value from the environment, safely returning an `Either<string[], number[]>`
 */
export const getNumberList = (key: string, delim = ','): Validation<number[]> => getList(readInt(key))(key, delim)

const getList = <R>(f: (s: string) => Validation<R>) => (key: string, delim = ','): Validation<R[]> => compose(
  getVariable(key),
  E.flatMap<NonEmptyArray<string>, string, R[]>(v => {
    const array = v.length < 1
      ? []
      : v.split(delim)
        .map(x => x.trim())
        .filter(e => e.length > 0)
        .map(f)

    return  array.reduce(
      (acc, val) =>
        E.isLeft(acc)
          ? E.isLeft(val) ? E.left(concat(acc.value, val.value)) : acc
          : E.isLeft(val) ? val : E.right(acc.value.concat([val.value]))
      ,
      E.of<NonEmptyArray<string>, R[]>([])
    )
  })
)


type ConfigTypeMap = {
  string: string
  boolean: boolean
  number: number
  'string[]': string[]
  'number[]': number[]
}

/*
 * Available values for use in the config micro format
 */
type ConfigType = 'number' | 'string' | 'boolean' | 'string[]' | 'number[]'

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

export type ValidatedConfig<D extends ConfigValue> = E.Either<NonEmptyArray<string>, { [K in keyof D]: ConfigTypeMap[D[K]['type']] }>

export type Infer<T extends ValidatedConfig<ConfigValue>> = T extends E.Right<infer A> ? A : never

const getTypeReader = (type: ConfigType) => {
  switch (type) {
    case 'string':
      return getString
    case 'number':
      return getInt
    case 'boolean':
      return getBoolean
    case 'string[]':
      return getStringList
    case 'number[]':
      return getNumberList
  }
}

export const getConfig = E.sequenceR

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
  const objectKeys = Object.keys(desc)

  const readConfig = objectKeys.reduce((acc, k) => {
    const { key, type } = desc[k]
    const alt = O.of(desc[k].default)

    const value = compose(
      getTypeReader(type)(key),
      E.flatMapLeft(e => O.toEither(e)(alt))
    )

    return {
      ...acc,
      [k]: value
    }
  }, {})

  return getConfig(readConfig)
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
  return compose(
    getConfig(validated),
    E.match({
      Left: errs => {
        throw new Error(`Missing config keys at startup: ${errs.join(', ')}`)
      },
      Right: cfg => cfg
    })
  )
}
