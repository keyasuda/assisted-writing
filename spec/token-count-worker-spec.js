const path = require('path')

describe('Web Worker コード', () => {
  it('トークン数を正しくカウントする', async () => {
    const worker = new Worker(
      path.resolve(__dirname, '../lib/token-count-worker.js')
    )

    await new Promise((resolve) => {
      worker.addEventListener('message', (event) => {
        const count = event.data

        expect(count).toBe(2) // テスト対象のテキストのトークン数
        resolve()
      })

      worker.postMessage({
        text: 'こんにちは！', // テスト対象のテキスト
        model: 'gpt4o',
      })
    })
  })
})
