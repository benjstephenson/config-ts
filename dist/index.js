"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigUnsafe = exports.readFromEnvironment = exports.getStringList = exports.getBoolean = exports.getString = exports.getInt = void 0;
const kittens_ts_1 = require("@benjstephenson/kittens-ts");
const Validation_1 = require("@benjstephenson/kittens-ts/dist/src/Validation");
const getVariable = (key) => kittens_ts_1.O.of(process.env[key]);
const get = (key, fn) => kittens_ts_1.functions.pipe(getVariable(key), kittens_ts_1.O.flatMap_(fn)).toEither(`Couldn't read ${key} from environment`);
const getInt = (key) => get(key, (v) => {
    const attempt = parseInt(v);
    return isNaN(attempt) ? kittens_ts_1.O.none() : kittens_ts_1.O.of(attempt);
});
exports.getInt = getInt;
const getString = (key) => get(key, kittens_ts_1.O.of);
exports.getString = getString;
const getBoolean = (key) => get(key, (v) => {
    const cased = v.toLowerCase();
    return cased === 'true'
        ? kittens_ts_1.O.of(true)
        : cased === 'false'
            ? kittens_ts_1.O.of(false)
            : kittens_ts_1.O.none();
});
exports.getBoolean = getBoolean;
const getStringList = (key, delim = ',') => get(key, (v) => kittens_ts_1.O.of(v.split(delim).map(x => x.trim())));
exports.getStringList = getStringList;
const getTypeReader = (type) => {
    switch (type) {
        case 'string': return exports.getString;
        case 'number': return exports.getInt;
        case 'boolean': return exports.getBoolean;
        case 'list': return exports.getStringList;
    }
};
const validateConfig = (0, Validation_1.getRecordValidation)();
function readFromEnvironment(desc) {
    const objectKeys = Object.keys(desc);
    const readConfig = objectKeys.reduce((acc, k) => {
        const { key, type } = desc[k];
        const value = getTypeReader(type)(key).mapLeft(e => [e]);
        return Object.assign(Object.assign({}, acc), { [k]: value });
    }, {});
    return validateConfig(readConfig);
}
exports.readFromEnvironment = readFromEnvironment;
function getConfigUnsafe(validated) {
    return kittens_ts_1.E.match({
        Left: errs => { throw new Error(`Missing config keys at startup: ${errs.join(', ')}`); },
        Right: cfg => cfg
    }, validateConfig(validated));
}
exports.getConfigUnsafe = getConfigUnsafe;
