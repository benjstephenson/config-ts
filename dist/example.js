"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const appStartup = () => __awaiter(void 0, void 0, void 0, function* () {
    const databaseConfig = yield (0, index_1.readFromEnvironment)({
        dbName: { key: 'DATABASE_NAME', type: 'string' },
        connectionString: { key: 'DATABASE_CONN_STR', type: 'string' },
        autoCommit: { key: 'DATABASE_AUTO_COMMIT', type: 'boolean', default: false }
    });
    const awsConfig = yield (0, index_1.readFromEnvironment)({
        region: { key: 'AWS_REGION', type: 'string' },
        secret: { key: 'AWS_SECRET', type: 'string' },
        services: { key: 'AWS_ENABLED_SERVICES', type: 'list' }
    });
    const appConfig = (0, index_1.getConfigUnsafe)({
        databaseConfig,
        awsConfig
    });
});
const notSoGood = () => {
    const getString = (key) => {
        const value = process.env[key];
        if (value === undefined)
            throw new Error(`value for key ${key} is undefined`);
        return value;
    };
    const getBoolean = (key) => {
        const strValue = getString(key);
        return strValue.toLowerCase() === 'true';
    };
    const dbName = getString('DATABASE_NAME');
    const autoCommit = getBoolean('DATABASE_AUTO_COMMIT');
    // ...etc
};
