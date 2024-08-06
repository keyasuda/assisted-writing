// worker to count tokens
const { Tiktoken } = require('tiktoken/lite')
// tokenizer for GPT-4o
const o200k_base = require('tiktoken/encoders/o200k_base.json')

const encoder = new Tiktoken(
  o200k_base.bpe_ranks,
  o200k_base.special_tokens,
  o200k_base.pat_str
)

self.addEventListener(
  'message',
  async (e) => {
    const { text, model, apiUrl } = e.data

    if (model === 'gpt4o') {
      var count = encoder.encode(text).length
      postMessage(count)
    } else {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: text, add_special: false }),
        })

        const data = await response.json()
        postMessage(data.tokens.length)
      } catch (error) {
        console.error('API request failed:', error)
        postMessage(-1) // 例外の場合、-1などのエラー値を返す
      }
    }
  },
  false
)
