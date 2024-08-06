'use babel'

import { splitRoles } from '../lib/gemini-chat'

describe('geminiChat', () => {
  describe('splitRoles', () => {
    it('スコープごとに分割する', () => {
      const src = `<start_of_turn>user
user text1
<end_of_turn><start_of_turn>model
model text1<end_of_turn><start_of_turn>user
user text2
<end_of_turn><start_of_turn>model
model text2`
      const actual = splitRoles(src)

      expect(actual).toEqual([
        { role: 'user', parts: [{ text: 'user text1' }] },
        { role: 'model', parts: [{ text: 'model text1' }] },
        { role: 'user', parts: [{ text: 'user text2' }] },
        { role: 'model', parts: [{ text: 'model text2' }] },
      ])
    })

    it('末尾が空のスコープは保持しない', () => {
      const src = `<start_of_turn>user
user text1
<end_of_turn><start_of_turn>model
model text1<end_of_turn><start_of_turn>user
user text2
<end_of_turn><start_of_turn>model
`
      const actual = splitRoles(src)

      expect(actual).toEqual([
        { role: 'user', parts: [{ text: 'user text1' }] },
        { role: 'model', parts: [{ text: 'model text1' }] },
        { role: 'user', parts: [{ text: 'user text2' }] },
      ])
    })
  })
})
