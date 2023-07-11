"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getConfigUnsafe = exports.readFromEnvironment = exports.describe = exports.getConfig = exports.getStringList = exports.getBoolean = exports.getString = exports.getInt = void 0;
const E = __importStar(require("./Either"));
const O = __importStar(require("./Option"));
const pipe_1 = require("./pipe");
const getVariable = (key) => O.of(process.env[key]);
const get = (key, fn) => (0, pipe_1.compose)(getVariable(key), O.flatMap(fn), O.toEither(`Couldn't read ${key} from environment`));
/*
 * Read a `number` value from the environment, safely returning an `Either<string, number>`
 */
const readInt = v => {
    const attempt = parseInt(v);
    return isNaN(attempt) ? O.none() : O.of(attempt);
};
const getInt = (key) => get(key, readInt);
exports.getInt = getInt;
/*
 * Read a `string` value from the environment, safely returning an `Either<string, string>`
 */
const getString = (key) => get(key, O.of);
exports.getString = getString;
/*
 * Read a `boolean` value from the environment, safely returning an `Either<string, boolean>`
 */
const readBoolean = v => {
    const cased = v.toLowerCase();
    return cased === 'true' ? O.of(true) : cased === 'false' ? O.of(false) : O.none();
};
const getBoolean = (key) => get(key, readBoolean);
exports.getBoolean = getBoolean;
/*
 * Read a `string[]` value from the environment, safely returning an `Either<string, string[]>`
 */
const getStringList = (key, delim = ',') => get(key, v => {
    const array = v.length < 1 ? [] : v.split(delim).map(x => x.trim());
    return O.of(array.filter(i => i.length > 0));
});
exports.getStringList = getStringList;
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
const getTypeReader = (type) => {
    switch (type) {
        case 'string':
            return exports.getString;
        case 'number':
            return exports.getInt;
        case 'boolean':
            return exports.getBoolean;
        case 'list':
            return exports.getStringList;
    }
};
exports.getConfig = E.sequenceR;
function describe(desc) {
    return desc;
}
exports.describe = describe;
function readFromEnvironment(desc) {
    return __awaiter(this, void 0, void 0, function* () {
        const objectKeys = Object.keys(desc);
        const readConfig = objectKeys.reduce((acc, k) => __awaiter(this, void 0, void 0, function* () {
            const { key, type } = desc[k];
            const alt = O.of(desc[k].default);
            const override = O.of(desc[k].override);
            const value = yield (0, pipe_1.compose)(getTypeReader(type)(key), E.flatMapLeft(e => (0, pipe_1.compose)(alt, O.toEither([e]))), E.map(val => (0, pipe_1.compose)(override, O.map((fn) => __awaiter(this, void 0, void 0, function* () { return yield fn(key); })), O.orElse(Promise.resolve(val)))), E.match({
                Left: l => Promise.resolve(E.left(l)),
                Right: r => r.then(E.right)
            }));
            return Object.assign(Object.assign({}, (yield acc)), { [k]: value });
        }), Promise.resolve({}));
        return (0, exports.getConfig)(yield readConfig);
    });
}
exports.readFromEnvironment = readFromEnvironment;
function getConfigUnsafe(validated) {
    return (0, pipe_1.compose)((0, exports.getConfig)(validated), E.match({
        Left: errs => {
            throw new Error(`Missing config keys at startup: ${errs.join(', ')}`);
        },
        Right: cfg => cfg
    }));
}
exports.getConfigUnsafe = getConfigUnsafe;
