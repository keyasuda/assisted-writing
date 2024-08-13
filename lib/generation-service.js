'use babel'

import { localCompletion, localAbort } from './api-client.js'
import { geminiApi, geminiApiAbort } from './gemini-api.js'

export default class GenerationService {
  constructor(type) {
    this.type = type
  }

  async completion(text, onChunkReceived, onError) {
    if (this.type === 'local') {
      // local LLMが無効の場合エラーを投げて終わる
      if (!atom.config.get('assisted-writing.local.enable')) {
        onError({ message: 'Local LLM backend is not enabled!' })
        return false
      }

      const endpoint = atom.config.get('assisted-writing.local.endpoint')
      const params = {
        ...JSON.parse(atom.config.get('assisted-writing.local.params')),
        ...{ prompt: text },
      }

      await localCompletion(params, endpoint, onChunkReceived, onError)
    } else if (this.type === 'gemini') {
      if (!atom.config.get('assisted-writing.gemini.enable')) {
        onError({ message: 'Google AI Studio Gemini API is not enabled!' })
        return false
      }

      const apiKey = atom.config.get('assisted-writing.gemini.apiKey')
      const modelName = atom.config.get('assisted-writing.gemini.modelName')
      const params = JSON.parse(
        atom.config.get('assisted-writing.gemini.params')
      )

      if (apiKey == '') {
        onError({ message: 'API is not set!' })
        return false
      }

      await geminiApi(text, apiKey, modelName, params, onChunkReceived, onError)
    }
  }

  abort() {
    if (this.type === 'local') {
      localAbort()
    } else if (this.type === 'gemini') {
      geminiApiAbort()
    }
  }
}
