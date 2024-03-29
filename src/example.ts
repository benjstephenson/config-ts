import { describe, getConfigUnsafe, Infer, readFromEnvironment } from './index'

const appStartup = async () => {
  const databaseConfig = describe({
    dbName: { key: 'DATABASE_NAME', type: 'string' },
    connectionString: { key: 'DATABASE_CONN_STR', type: 'string' },
    autoCommit: { key: 'DATABASE_AUTO_COMMIT', type: 'boolean', default: false }
  })

  const awsConfig = describe({
    region: { key: 'AWS_REGION', type: 'string' },
    secret: { key: 'AWS_SECRET', type: 'string' },
    services: { key: 'AWS_ENABLED_SERVICES', type: 'list' }
  })

  const awsSchema = describe({
    region: { key: 'AWS_REGION', type: 'string' },
    secret: { key: 'AWS_SECRET', type: 'string' },
    services: { key: 'AWS_ENABLED_SERVICES', type: 'list' }
  })

  type AwsConfig = Infer<typeof awsConfig>

  type DbConfig = Infer<typeof databaseConfig>

  const appConfig = {
    databaseConfig: await readFromEnvironment(databaseConfig),
    awsConfig: await readFromEnvironment(awsConfig)
  }

  return getConfigUnsafe(appConfig)
}

const notSoGood = () => {
  const getString = (key: string) => {
    const value = process.env[key]
    if (value === undefined) throw new Error(`value for key ${key} is undefined`)

    return value
  }

  const getBoolean = (key: string) => {
    const strValue = getString(key)
    return strValue.toLowerCase() === 'true'
  }

  const dbName = getString('DATABASE_NAME')
  const autoCommit = getBoolean('DATABASE_AUTO_COMMIT')
  // ...etc
}
