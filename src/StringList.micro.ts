import { assertThat, match } from 'mismatched'
import { getConfigUnsafe, getStringList, readFromEnvironment } from '.'
import * as fc from 'fast-check'
import * as E from './Either'
import { compose } from './pipe'

describe('String list reader', () => {
  it('successfully reads', () => {
    fc.assert(
      fc.property(fc.array(fc.string({minLength: 1}), {minLength: 1}), (strs) => {


        process.env["TEST"] = strs.toString()
        const result = getStringList("TEST")
         assertThat(result.value).is(strs)
      })
    )
  })
})
