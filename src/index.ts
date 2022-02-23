import { E, O, functions } from '@benjstephenson/kittens-ts'
import { NonEmptyArray } from '@benjstephenson/kittens-ts/dist/src/NonEmptyArray'
import { getRecordValidation } from '@benjstephenson/kittens-ts/dist/src/Validation'

const getVariable = (key: string): O.Option<string> => O.of(process.env[key])

const get = <T>(key: string, fn: (v: string) => O.Option<T>): E.Either<string, T> =>
  functions.pipe(
    getVariable(key),
    O.flatMap_(fn),
  ).toEither(`Couldn't read ${key} from environment`)


export const getInt = (key: string): E.Either<string, number> => get(key, (v) => {
  const attempt = parseInt(v)
  return isNaN(attempt) ? O.none<number>() : O.of(attempt)
})


export const getString = (key: string): E.Either<string, string> => get(key, O.of)

export const getBoolean = (key: string): E.Either<string, boolean> => get(key, (v) => {
  const cased = v.toLowerCase()

  return cased === 'true'
    ? O.of(true)
    : cased === 'false'
      ? O.of(false)
      : O.none()
})


export const getStringList = (key: string, delim = ','): E.Either<string, string[]> => get(key, (v) => O.of(v.split(delim).map(x => x.trim())))

type ReifyConfigType<T> =
  T extends { type: 'string' } ? string :
  T extends { type: 'boolean' } ? boolean :
  T extends { type: 'number' } ? number :
  T extends { type: 'list' } ? string[]
  : never


type ConfigType = 'number' | 'string' | 'boolean' | 'list'


type ConfigDesc = Record<string, { key: string, type: ConfigType }>

const getTypeReader = (type: ConfigType) => {
  switch (type) {
    case 'string': return getString
    case 'number': return getInt
    case 'boolean': return getBoolean
    case 'list': return getStringList
  }
}

const validateConfig = getRecordValidation<string>()

export function readFromEnvironment<Desc extends ConfigDesc>(desc: Desc): E.Either<NonEmptyArray<string>, { [K in keyof Desc]: ReifyConfigType<Desc[K]> }>
export function readFromEnvironment(desc: ConfigDesc) {
  const objectKeys = Object.keys(desc)

  const readConfig = objectKeys.reduce(
    (acc, k) => {
      const { key, type } = desc[k]
      const value = getTypeReader(type)(key).mapLeft(e => [e] as const)
      return {
        ...acc,
        [k]: value
      }
    },
    {}
  )

  return validateConfig(readConfig)
}

export function getConfigUnsafe<Rec extends Record<string, E.Either<NonEmptyArray<string>, any>>>(validated: Rec): { [K in keyof Rec]: Rec[K] extends E.Either<NonEmptyArray<string>, infer A> ? A : never }
export function getConfigUnsafe(validated: Record<string, E.Either<NonEmptyArray<string>, any>>) {
  return E.match({
    Left: errs => { throw new Error(`Missing config keys at startup: ${errs.join(', ')}`) },
    Right: cfg => cfg
  }, validateConfig(validated))
}
