"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequenceR = exports.match = exports.flatMapLeft = exports.mapLeft = exports.flatMap = exports.map = exports.isRight = exports.isLeft = exports.right = exports.left = void 0;
const NonEmptyArray_1 = require("./NonEmptyArray");
const pipe_1 = require("./pipe");
const left = (e) => ({ _tag: 'left', value: e });
exports.left = left;
const right = (a) => ({ _tag: 'right', value: a });
exports.right = right;
const isLeft = (e) => e._tag === 'left';
exports.isLeft = isLeft;
const isRight = (e) => e._tag === 'right';
exports.isRight = isRight;
const map = (f) => (fa) => (0, exports.isRight)(fa) ? (0, exports.right)(f(fa.value)) : fa;
exports.map = map;
const flatMap = (f) => (fa) => (0, exports.isRight)(fa) ? f(fa.value) : fa;
exports.flatMap = flatMap;
const mapLeft = (f) => (fa) => (0, exports.isLeft)(fa) ? (0, exports.left)(f(fa.value)) : fa; //right(fa.value)
exports.mapLeft = mapLeft;
const flatMapLeft = (f) => (fa) => (0, exports.isLeft)(fa) ? f(fa.value) : fa; //right(fa.value)
exports.flatMapLeft = flatMapLeft;
const match = (o) => (fa) => (0, exports.isLeft)(fa) ? o.Left(fa.value) : o.Right(fa.value);
exports.match = match;
function sequenceR(record) {
    const [head, ...tail] = Object.keys(record);
    const initial = (0, pipe_1.compose)(record[head], (0, exports.mapLeft)(e => e), (0, exports.map)(v => ({ [head]: v })));
    return tail.reduce((acc, key) => (0, pipe_1.compose)(record[key], (0, exports.match)({
        Left: err => ((0, exports.isLeft)(acc) ? (0, exports.left)((0, NonEmptyArray_1.concat)(acc.value, err)) : (0, exports.left)(err)),
        Right: val => ((0, exports.isLeft)(acc) ? (0, exports.left)(acc.value) : (0, exports.right)(Object.assign(Object.assign({}, acc.value), { [key]: val })))
    })), initial);
}
exports.sequenceR = sequenceR;
