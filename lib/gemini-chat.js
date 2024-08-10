'use babel'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

  try {
    const result = await model.generateContentStream(src, {
      generationConfig: params,
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

export { geminiChat, geminiChatAbort }
