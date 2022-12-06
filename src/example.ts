import { getConfigUnsafe, Infer, readFromEnvironment } from './index'
import { unicode } from 'fast-check'

const databaseConfig = readFromEnvironment({
  dbName: { key: 'DATABASE_NAME', type: 'string' },
  connectionString: { key: 'DATABASE_CONN_STR', type: 'string' },
  autoCommit: { key: 'DATABASE_AUTO_COMMIT', type: 'boolean', default: false }
})

const awsConfig = readFromEnvironment({
  region: { key: 'AWS_REGION', type: 'string' },
  secret: { key: 'AWS_SECRET', type: 'string' },
  services: { key: 'AWS_ENABLED_SERVICES', type: 'list' }
})

type AwsConfig = Infer<typeof awsConfig>

type DbConfig = Infer<typeof databaseConfig>

const appConfig = getConfigUnsafe({
  databaseConfig,
  awsConfig
})

const notSoGood = () => {

  const getString = (key: string) => {
    const value = process.env[key]
    if (value === undefined)
     throw new Error(`value for key ${key} is undefined`)

    return value
  }

  const getBoolean = (key: string) => {
    const strValue = getString(key)
    return strValue.toLowerCase() === "true"
  }

  const dbName = getString("DATABASE_NAME")
  const autoCommit = getBoolean("DATABASE_AUTO_COMMIT")

}