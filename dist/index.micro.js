"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
const mismatched_1 = require("mismatched");
const _1 = require(".");
const fc = __importStar(require("fast-check"));
describe("Config Reader", () => {
    it("successfully reads from the environment", () => {
        fc.assert(fc.property(fc.string(), fc.integer(), fc.boolean(), (str, int, bool) => {
            process.env["FOO"] = str;
            process.env["BAR"] = `${int}`;
            process.env["BLAH"] = `${bool}`;
            const config = (0, _1.readFromEnvironment)({
                foo: { key: "FOO", type: 'string' },
                bar: { key: "BAR", type: 'number' },
                blah: { key: "BLAH", type: 'boolean' }
            });
            config.bimap({
                Left: fail,
                Right: cfg => (0, mismatched_1.assertThat)(cfg).is({ foo: str, bar: int, blah: bool })
            });
        }));
    });
    it("accumulates errors reading from the environment", () => {
        delete process.env["FOO"];
        delete process.env["BAR"];
        delete process.env["BLAH"];
        const config = (0, _1.readFromEnvironment)({
            foo: { key: "FOO", type: 'string' },
            bar: { key: "BAR", type: 'number' },
            blah: { key: "BLAH", type: 'boolean' }
        });
        config.bimap({
            Left: errs => (0, mismatched_1.assertThat)(errs).is(mismatched_1.match.array.unordered([
                "Couldn't read FOO from environment",
                "Couldn't read BAR from environment",
                "Couldn't read BLAH from environment"
            ])),
            Right: fail
        });
    });
    it("getConfigUnsafe returns a config object", () => {
        fc.assert(fc.property(fc.string(), fc.integer(), fc.boolean(), (str, int, bool) => {
            process.env["FOO"] = str;
            process.env["BAR"] = `${int}`;
            process.env["BLAH"] = `${bool}`;
            const config = (0, _1.readFromEnvironment)({
                foo: { key: "FOO", type: 'string' },
                bar: { key: "BAR", type: 'number' },
                blah: { key: "BLAH", type: 'boolean' }
            });
            (0, mismatched_1.assertThat)((0, _1.getConfigUnsafe)({ config })).is({ config: { foo: str, bar: int, blah: bool } });
        }));
    });
    it("getConfigUnsafe throws an exception", () => {
        delete process.env["FOO"];
        delete process.env["BAR"];
        delete process.env["BLAH"];
        const config = (0, _1.readFromEnvironment)({
            foo: { key: "FOO", type: 'string' },
            bar: { key: "BAR", type: 'number' },
            blah: { key: "BLAH", type: 'boolean' }
        });
        (0, mismatched_1.assertThat)(() => (0, _1.getConfigUnsafe)({ config })).throwsError(mismatched_1.match.string.startsWith("Missing config keys at startup"));
    });
});
