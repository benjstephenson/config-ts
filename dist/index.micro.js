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
const mismatched_1 = require("mismatched");
const _1 = require(".");
const fc = __importStar(require("fast-check"));
const E = __importStar(require("./Either"));
const pipe_1 = require("./pipe");
describe('Config Reader', () => {
    it('successfully reads from the environment', () => __awaiter(void 0, void 0, void 0, function* () {
        fc.assert(fc.asyncProperty(fc.string(), fc.integer(), fc.boolean(), (str, int, bool) => __awaiter(void 0, void 0, void 0, function* () {
            process.env['FOO'] = str;
            process.env['BAR'] = `${int}`;
            const config = yield (0, _1.readFromEnvironment)({
                foo: { key: 'FOO', type: 'string' },
                bar: { key: 'BAR', type: 'number' },
                blah: { key: 'BLAH', type: 'boolean', default: bool },
                boo: { key: 'BOO', type: 'string', override: (key) => Promise.resolve('overidden') }
            });
            (0, pipe_1.compose)(config, E.match({
                Left: _errs => (0, mismatched_1.assertThat)(false).withMessage('Unexpected left value').is(true),
                Right: cfg => (0, mismatched_1.assertThat)(cfg).is({ foo: str, bar: int, blah: bool, boo: 'overidden' })
            }));
        })));
    }));
    it('accumulates errors reading from the environment', () => __awaiter(void 0, void 0, void 0, function* () {
        delete process.env['FOO'];
        delete process.env['BAR'];
        delete process.env['BLAH'];
        const config = yield (0, _1.readFromEnvironment)({
            foo: { key: 'FOO', type: 'string' },
            bar: { key: 'BAR', type: 'number' },
            blah: { key: 'BLAH', type: 'boolean' }
        });
        (0, pipe_1.compose)(config, E.match({
            Left: errs => (0, mismatched_1.assertThat)(errs).is(mismatched_1.match.array.unordered(["Couldn't read FOO from environment", "Couldn't read BAR from environment", "Couldn't read BLAH from environment"])),
            Right: _ => (0, mismatched_1.assertThat)(false).withMessage('Unexpected right value').is(true)
        }));
    }));
    it('getConfigUnsafe returns a config object', () => {
        fc.assert(fc.asyncProperty(fc.string(), fc.integer(), fc.boolean(), fc.array(fc.string()), (str, int, bool, list) => __awaiter(void 0, void 0, void 0, function* () {
            fc.pre(list.every(s => !s.includes(',')));
            process.env['FOO'] = str;
            process.env['BAR'] = `${int}`;
            process.env['BLAH'] = `${bool}`;
            process.env['BAZZ'] = list.toString();
            const config = yield (0, _1.readFromEnvironment)({
                foo: { key: 'FOO', type: 'string' },
                bar: { key: 'BAR', type: 'number' },
                blah: { key: 'BLAH', type: 'boolean' },
                bazz: { key: 'BAZZ', type: 'list' }
            });
            (0, mismatched_1.assertThat)((0, _1.getConfigUnsafe)({ config })).is({
                config: {
                    foo: str,
                    bar: int,
                    blah: bool,
                    bazz: list.map(i => i.trim()).filter(i => i.length > 0)
                }
            });
        })));
    });
    it('getConfigUnsafe returns a config object from default values', () => {
        fc.assert(fc.asyncProperty(fc.string(), fc.integer(), fc.boolean(), fc.array(fc.string()), (str, int, bool, list) => __awaiter(void 0, void 0, void 0, function* () {
            fc.pre(list.every(s => !s.includes(',')));
            const sanitisedList = list.map(i => i.trim()).filter(i => i.length > 0);
            delete process.env['FOO'];
            delete process.env['BAR'];
            delete process.env['BLAH'];
            delete process.env['BAZZ'];
            const config = yield (0, _1.readFromEnvironment)({
                foo: { key: 'FOO', type: 'string', default: str },
                bar: { key: 'BAR', type: 'number', default: int },
                blah: { key: 'BLAH', type: 'boolean', default: bool },
                bazz: { key: 'BAZZ', type: 'list', default: sanitisedList }
            });
            (0, mismatched_1.assertThat)((0, _1.getConfigUnsafe)({ config })).is({
                config: {
                    foo: str,
                    bar: int,
                    blah: bool,
                    bazz: sanitisedList
                }
            });
        })));
    });
    it('getConfigUnsafe throws an exception', () => __awaiter(void 0, void 0, void 0, function* () {
        delete process.env['FOO'];
        delete process.env['BAR'];
        delete process.env['BLAH'];
        const config = yield (0, _1.readFromEnvironment)({
            foo: { key: 'FOO', type: 'string' },
            bar: { key: 'BAR', type: 'number' },
            blah: { key: 'BLAH', type: 'boolean' }
        });
        (0, mismatched_1.assertThat)(() => (0, _1.getConfigUnsafe)({ config })).throwsError(mismatched_1.match.string.startsWith('Missing config keys at startup'));
    }));
});
