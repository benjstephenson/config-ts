import { assertThat, match } from 'mismatched'
import { getConfigUnsafe, readFromEnvironment } from '.'
import * as fc from 'fast-check'
import * as E from './Either'
import { compose } from './pipe'

describe('Config Reader', () => {
  it('successfully reads from the environment', () => {
    fc.assert(
      fc.property(fc.string(), fc.integer(), fc.boolean(), (str, int, bool) => {
        process.env['FOO'] = str
        process.env['BAR'] = `${int}`

        const config = readFromEnvironment({
          foo: { key: 'FOO', type: 'string' },
          bar: { key: 'BAR', type: 'number' },
          blah: { key: 'BLAH', type: 'boolean', default: bool }
        })

        compose(
          config,
          E.match({
            Left: _errs => assertThat(false).withMessage('Unexpected left value').is(true),
            Right: cfg => assertThat(cfg).is({ foo: str, bar: int, blah: bool })
          })
        )
      })
    )
  })

  it('accumulates errors reading from the environment', () => {
    delete process.env['FOO']
    delete process.env['BAR']
    delete process.env['BLAH']

    const config = readFromEnvironment({
      foo: { key: 'FOO', type: 'string' },
      bar: { key: 'BAR', type: 'number' },
      blah: { key: 'BLAH', type: 'boolean' }
    })

    compose(
      config,
      E.match({
        Left: errs => assertThat(errs).is(match.array.unordered(['Couldn\'t read FOO from environment', 'Couldn\'t read BAR from environment', 'Couldn\'t read BLAH from environment'])),
        Right: _ => assertThat(false).withMessage('Unexpected right value').is(true)
      })
    )
  })

  it('getConfigUnsafe returns a config object', () => {
    fc.assert(
      fc.property(fc.string(), fc.integer(), fc.boolean(), fc.array(fc.integer()), fc.array(fc.string()), (str, int, bool, nums, list) => {

        fc.pre(list.every(s => !s.includes(',')))

        process.env['FOO'] = str
        process.env['BAR'] = `${int}`
        process.env['BLAH'] = `${bool}`
        process.env['BOO'] = nums.toString()
        process.env['BAZZ'] = list.toString()

        const config = readFromEnvironment({
          foo: { key: 'FOO', type: 'string' },
          bar: { key: 'BAR', type: 'number' },
          blah: { key: 'BLAH', type: 'boolean' },
          boo: { key: 'BOO', type: 'number[]' },
          bazz: { key: 'BAZZ', type: 'string[]' }
        })


        assertThat(getConfigUnsafe({ config })).is({
          config: {
            foo: str,
            bar: int,
            blah: bool,
            boo: nums,
            bazz: list.map(i => i.trim()).filter(i => i.length > 0)
          }
        })
      })
      , { verbose: true })
  })


  it('getConfigUnsafe returns a config object from default values', () => {
    fc.assert(
      fc.property(fc.string(), fc.integer(), fc.boolean(), fc.array(fc.string()), (str, int, bool, list) => {

        fc.pre(list.every(s => !s.includes(',')))

        const sanitisedList = list.map(i => i.trim()).filter(i => i.length > 0)

        delete process.env['FOO']
        delete process.env['BAR']
        delete process.env['BLAH']
        delete process.env['BAZZ']

        const config = readFromEnvironment({
          foo: { key: 'FOO', type: 'string', default: str },
          bar: { key: 'BAR', type: 'number', default: int },
          blah: { key: 'BLAH', type: 'boolean', default: bool },
          bazz: { key: 'BAZZ', type: 'string[]', default: sanitisedList }
        })

        assertThat(getConfigUnsafe({ config })).is({
          config: {
            foo: str,
            bar: int,
            blah: bool,
            bazz: sanitisedList
          }
        })
      })
    )
  })

  it('getConfigUnsafe throws an exception', () => {
    delete process.env['FOO']
    delete process.env['BAR']
    delete process.env['BLAH']

    const config = readFromEnvironment({
      foo: { key: 'FOO', type: 'string' },
      bar: { key: 'BAR', type: 'number' },
      blah: { key: 'BLAH', type: 'boolean' }
    })

    assertThat(() => getConfigUnsafe({ config })).throwsError(match.string.startsWith('Missing config keys at startup'))
  })
})
