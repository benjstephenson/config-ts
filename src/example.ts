import { getConfigUnsafe, Infer, readFromEnvironment } from './index'

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
