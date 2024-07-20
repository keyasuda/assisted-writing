'use babel'

let abortController = null

const completion = async (params, endpoint, onChunkReceived, onError) => {
  abortController = new AbortController()

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...params, ...{ stream: true } }), // streamは常に有効
    signal: abortController.signal,
  }

  try {
    const response = await fetch(endpoint, options)
    const reader = response.body?.getReader()
    if (!reader) return

    let decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      const lines = decoder.decode(value)
      const jsons = lines
        .split('data: ')
        .map((line) => line.trim())
        .filter((s) => s)

      for (const json of jsons) {
        try {
          if (json === '[DONE]') {
            return
          }

          try {
            const chunk = JSON.parse(json)
            const ret = chunk.choices
              ? chunk.choices[0].text // text-generation webui
              : chunk.content || '' // llama-server

            onChunkReceived(ret)
          } catch (e) {
            console.log('unknown chunk', json, e)
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
  } catch (error) {
    onError(error)
  }
}

const abort = () => {
  abortController.abort()
}

export { completion, abort }
