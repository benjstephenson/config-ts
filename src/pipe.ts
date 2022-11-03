export function compose<A>(a: A): A
export function compose<A, B>(a: A, ab: (a: A) => B): B
export function compose<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
export function compose<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D
export function compose<A, B, C, D, E>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: E) => E): D
export function compose<A, B, C, D, E, F>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: E) => E, ef: (e: E) => F): D
export function compose(a: unknown, ab?: Function, bc?: Function, cd?: Function): unknown {
  switch (arguments.length) {
    case 1:
      return a
    case 2:
      return ab!(a)
    case 3:
      return bc!(ab!(a))
    case 4:
      return cd!(bc!(ab!(a)))
    default:
      const [head, ...rest] = arguments
      return rest.reduce((result, fn) => fn(result), head)
  }
}

export function pipe<Args extends ReadonlyArray<any>, A>(fa: (...a: Args) => A): (...a: Args) => A
export function pipe<Args extends ReadonlyArray<any>, A, B>(fa: (...a: Args) => A, ab: (a: A) => B): (...a: Args) => B
export function pipe<Args extends ReadonlyArray<any>, A, B, C>(
  fa: (...a: Args) => A,
  ab: (a: A) => B,
  bc: (b: B) => C
): (...a: Args) => C
export function pipe<Args extends ReadonlyArray<any>, A, B, C, D>(
  fa: (...a: Args) => A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D
): (...a: Args) => D
export function pipe<Args extends ReadonlyArray<any>, A, B, C, D, E>(
  fa: (...a: Args) => A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E
): (...a: Args) => E
export function pipe(fa: Function, ab?: Function, bc?: Function, cd?: Function, de?: Function): unknown {
  switch (arguments.length) {
    case 1:
      return fa;
    case 2:
      return (args: unknown) => ab!(fa(args))
    case 3:
      return (args: unknown) => bc!(ab!(fa(args)))
    case 4:
      return (args: unknown) => cd!(bc!(ab!(fa(args))))
    case 5:
      return (args: unknown) => de!(cd!(bc!(ab!(fa(args)))))
  }

  return
}

