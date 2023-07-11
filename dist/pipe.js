"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipe = exports.compose = void 0;
function compose(a, ab, bc, cd) {
    switch (arguments.length) {
        case 1:
            return a;
        case 2:
            return ab(a);
        case 3:
            return bc(ab(a));
        case 4:
            return cd(bc(ab(a)));
        default:
            const [head, ...rest] = arguments;
            return rest.reduce((result, fn) => fn(result), head);
    }
}
exports.compose = compose;
function pipe(fa, ab, bc, cd, de) {
    switch (arguments.length) {
        case 1:
            return fa;
        case 2:
            return (args) => ab(fa(args));
        case 3:
            return (args) => bc(ab(fa(args)));
        case 4:
            return (args) => cd(bc(ab(fa(args))));
        case 5:
            return (args) => de(cd(bc(ab(fa(args)))));
    }
    return;
}
exports.pipe = pipe;
