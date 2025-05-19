'use babel'

//Ollama用のfetch処理, abort処理
let ollamaAbortController = null

const ollamaApi = async (params, endpointBase, onChunkReceived, onError) => {
  const endpoint = `${endpointBase}/api/generate`
  ollamaAbortController = new AbortController()
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params), // No need to add stream: true, it's default in Ollama
    signal: ollamaAbortController.signal,
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
      //Ollamaは改行で区切られたJSONを返却する
      const jsons = lines
        .split('\n')
        .map((line) => line.trim())
        .filter((s) => s)

      for (const json of jsons) {
        try {
          const chunk = JSON.parse(json)
          const ret = chunk.response || '' // Ollama uses 'response' field
          onChunkReceived(ret)
        } catch (error) {
          console.error('Error parsing JSON:', error)
          onError(error) // Propagate parsing errors
          return
        }
      }
    }
  } catch (error) {
    onError(error)
  }
}

const ollamaAbort = () => {
  if (ollamaAbortController) {
    ollamaAbortController.abort()
  }
}

const ollamaModels = async (endpointBase, onError) => {
  const endpoint = endpointBase + '/api/tags'
  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    const modelNames = data.models.map((model) => model.name)
    return modelNames
  } catch (error) {
    onError(error)
    return []
  }
}

export { ollamaApi, ollamaAbort, ollamaModels }
