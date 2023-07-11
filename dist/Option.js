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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEither = exports.flatMap = exports.orElse = exports.map = exports.isNone = exports.isSome = exports.of = exports.some = exports.none = void 0;
const E = __importStar(require("./Either"));
const none = () => ({ _tag: 'none' });
exports.none = none;
const some = (a) => ({
    _tag: 'some',
    value: a
});
exports.some = some;
const of = (a) => (a === undefined || a === null ? (0, exports.none)() : (0, exports.some)(a));
exports.of = of;
const isSome = (fa) => fa._tag === 'some';
exports.isSome = isSome;
const isNone = (fa) => fa._tag === 'none';
exports.isNone = isNone;
const map = (f) => (fa) => (0, exports.isSome)(fa) ? (0, exports.some)(f(fa.value)) : fa;
exports.map = map;
const orElse = (a) => (fa) => (0, exports.isSome)(fa) ? fa.value : a;
exports.orElse = orElse;
const flatMap = (f) => (fa) => (0, exports.isSome)(fa) ? f(fa.value) : fa;
exports.flatMap = flatMap;
const toEither = (e) => (fa) => (0, exports.isSome)(fa) ? E.right(fa.value) : E.left(e);
exports.toEither = toEither;
