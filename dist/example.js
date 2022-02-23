"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const databaseConfig = (0, index_1.readFromEnvironment)({
    dbName: { key: "DATABASE_NAME", type: 'string' },
    connectionString: { key: "DATABASE_CONN_STR", type: 'string' },
    autoCommit: { key: "DATABASE_AUTO_COMMIT", type: 'boolean' }
});
const awsConfig = (0, index_1.readFromEnvironment)({
    region: { key: "AWS_REGION", type: 'string' },
    secret: { key: "AWS_SECRET", type: 'string' },
    services: { key: "AWS_ENABLED_SERVICES", type: 'list' }
});
const appConfig = (0, index_1.getConfigUnsafe)({
    databaseConfig,
    awsConfig
});
