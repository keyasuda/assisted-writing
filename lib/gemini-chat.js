'use babel'
import { GoogleGenerativeAI } from '@google/generative-ai'

const splitRoles = (src) => {
  return src
    .split('<end_of_turn>')
    .map((e) => {
      var r = /<start_of_turn>(.+)/
      var role = e.match(r)
      return { role: role[1], parts: [{ text: e.replace(r, '').trim() }] }
    })
    .filter((e) => e.parts[0].text.length > 0)
}

let abortController = null
const geminiChat = async (
  src,
  apiKey,
  modelName,
  params,
  onChunkReceived,
  onError
) => {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })
  abortController = new AbortController()

  const history = splitRoles(src)
  const latest = history.pop()

  const chat = model.startChat({
    history: history,
    generationConfig: params,
  })
  try {
    const result = await chat.sendMessageStream(latest.parts[0].text, {
      signal: abortController.signal,
    })

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      onChunkReceived(chunkText)
    }
  } catch (error) {
    onError(error)
  }
}

const geminiChatAbort = () => {
  abortController.abort()
}

export { splitRoles, geminiChat, geminiChatAbort }
