import * as E from 'kittens-ts/Either'
import * as O from 'kittens-ts/Option'
import { pipe } from 'kittens-ts/core/functions'
import { NonEmptyArray } from 'kittens-ts/NonEmptyArray'
import { getRecordValidation } from 'kittens-ts/Validation'

const getVariable = (key: string): O.Option<string> => O.of(process.env[key])

const get = <T>(key: string, fn: (v: string) => O.Option<T>): E.Either<string, T> => pipe(getVariable(key), O.flatMap(fn)).toEither(`Couldn't read ${key} from environment`)

export const getInt = (key: string): E.Either<string, number> =>
  get(key, v => {
    const attempt = parseInt(v)
    return isNaN(attempt) ? O.none<number>() : O.of(attempt)
  })

export const getString = (key: string): E.Either<string, string> => get(key, O.of)

export const getBoolean = (key: string): E.Either<string, boolean> =>
  get(key, v => {
    const cased = v.toLowerCase()

    return cased === 'true' ? O.of(true) : cased === 'false' ? O.of(false) : O.none()
  })

export const getStringList = (key: string, delim = ','): E.Either<string, string[]> => get(key, v => O.of(v.split(delim).map(x => x.trim())))

type ConfigTypeMap = {
  string: string
  boolean: boolean
  number: number
  list: string[]
}

type ConfigType = 'number' | 'string' | 'boolean' | 'list'

type ConfigDesc<C, T extends keyof C = keyof C> = {
  key: string
  type: T
  default?: C[T]
}

type AnyConfigDesc<C = ConfigTypeMap, T extends keyof C = keyof C> = T extends keyof C ? ConfigDesc<C, T> : never

type ConfigValue = { [x: string]: AnyConfigDesc }

type ValidatedConfig<D extends ConfigValue> = E.Either<NonEmptyArray<string>, { [K in keyof D]: ConfigTypeMap[D[K]['type']] }>

export type Infer<T extends ValidatedConfig<any>> = T extends E.Either<NonEmptyArray<string>, infer A> ? A : never

const getTypeReader = (type: ConfigType) => {
  switch (type) {
    case 'string':
      return getString
    case 'number':
      return getInt
    case 'boolean':
      return getBoolean
    case 'list':
      return getStringList
  }
}

const validateConfig = getRecordValidation<string>()

export function readFromEnvironment<Desc extends ConfigValue>(desc: Desc): ValidatedConfig<Desc>

export function readFromEnvironment(desc: ConfigValue) {
  const objectKeys = Object.keys(desc)

  const readConfig = objectKeys.reduce((acc, k) => {
    const { key, type } = desc[k]
    const alt = O.of(desc[k].default)

    const value = getTypeReader(type)(key)
      .flatMapLeft(e => alt.toEither(e))
      .mapLeft(e => [e] as const)

    return {
      ...acc,
      [k]: value
    }
  }, {})

  return validateConfig(readConfig)
}

export type InferConfig<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>> = {
  [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never
}

export function getConfigUnsafe<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>>(
  validated: Rec
): {
  [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never
}
export function getConfigUnsafe(validated: Record<string, E.Either<NonEmptyArray<string>, any>>) {
  return E._match(
    {
      Left: errs => {
        throw new Error(`Missing config keys at startup: ${errs.join(', ')}`)
      },
      Right: cfg => cfg
    },
    validateConfig(validated)
  )
}
