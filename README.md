# config-ts

Small library that reads config values from the node process environment.
Config objects are described using a micro format which informs the library how to fetch them.
Errors fetching values are accumulated when the config objects are instantiated and ultimately return an `Either<NonEmptyList<string>, Config>`
which can be extracted unsafely using `getConfigUnsafe`.

Takes some inspiration from [PureConfig](https://pureconfig.github.io/) and [Zod](https://zod.js.org/)

```Typescript
const databaseConfig = readFromEnvironment({
  dbName: { key: "DATABASE_NAME", type: 'string' },
  connectionString: { key: "DATABASE_CONN_STR", type: 'string' },
  autoCommit: { key: "DATABASE_AUTO_COMMIT", type: 'boolean', default: false }
})

const awsConfig = readFromEnvironment({
  region: { key: "AWS_REGION", type: 'string' },
  secret: { key: "AWS_SECRET", type: 'string' },
  services: { key: "AWS_ENABLED_SERVICES", type: 'list' }
})

// Grabs the type for use in the app code, type would be { region: string, secret: string, services: string[] }
type AwsConfig = Infer<typeof awsConfig>

// This will throw an exception of one or more config values couldn't be read.
const appConfig = getConfigUnsafe({
  databaseConfig,
  awsConfig
})

/*
 *  Resulting type of appConfig is
 {
   databaseConfig: { dbName: string, connectionString: string, autoCommit: boolean },
   awsConfig: { region: string, secret: string, services: string[] }
 }
*/

```
