import { assertThat, match } from 'mismatched'
import { getConfigUnsafe, readFromEnvironment } from "."
import * as fc from 'fast-check'


describe("Config Reader", () => {


  it("successfully reads from the environment", () => {
    fc.assert(
      fc.property(
        fc.string(), fc.integer(), fc.boolean(), (str, int, bool) => {
          process.env["FOO"] = str
          process.env["BAR"] = `${int}`
          process.env["BLAH"] = `${bool}`

          const config = readFromEnvironment({
            foo: { key: "FOO", type: 'string' },
            bar: { key: "BAR", type: 'number' },
            blah: { key: "BLAH", type: 'boolean' }
          })

          config.bimap({
            Left: fail,
            Right: cfg => assertThat(cfg).is({ foo: str, bar: int, blah: bool })
          })

        }
      )
    )
  })

  it("accumulates errors reading from the environment", () => {

    delete process.env["FOO"]
    delete process.env["BAR"]
    delete process.env["BLAH"]

    const config = readFromEnvironment({
      foo: { key: "FOO", type: 'string' },
      bar: { key: "BAR", type: 'number' },
      blah: { key: "BLAH", type: 'boolean' }
    })

    config.bimap({
      Left: errs => assertThat(errs).is(match.array.unordered([
        "Couldn't read FOO from environment",
        "Couldn't read BAR from environment",
        "Couldn't read BLAH from environment"
      ])),
      Right: fail
    })
  })

  it("getConfigUnsafe returns a config object", () => {
    fc.assert(
      fc.property(
        fc.string(), fc.integer(), fc.boolean(), (str, int, bool) => {
          process.env["FOO"] = str
          process.env["BAR"] = `${int}`
          process.env["BLAH"] = `${bool}`

          const config = readFromEnvironment({
            foo: { key: "FOO", type: 'string' },
            bar: { key: "BAR", type: 'number' },
            blah: { key: "BLAH", type: 'boolean' }
          })

          assertThat(getConfigUnsafe({ config })).is({ config: { foo: str, bar: int, blah: bool } })

        }
      )
    )
  })

  it("getConfigUnsafe throws an exception", () => {

    delete process.env["FOO"]
    delete process.env["BAR"]
    delete process.env["BLAH"]

    const config = readFromEnvironment({
      foo: { key: "FOO", type: 'string' },
      bar: { key: "BAR", type: 'number' },
      blah: { key: "BLAH", type: 'boolean' }
    })

    assertThat(() => getConfigUnsafe({ config })).throwsError(
      match.string.startsWith("Missing config keys at startup")
    )
  })
})
