'use babel'

import {
  localCompletion,
  localAbort,
  ollamaApi,
  ollamaAbort,
} from './api-client.js'
import { geminiApi, geminiApiAbort } from './gemini-api.js'

export default class GenerationService {
  constructor(type) {
    this.type = type
  }

  async completion(text, onChunkReceived, onError) {
    if (this.type === 'local') {
      // local LLMが無効の場合エラーを投げて終わる
      if (!atom.config.get('assisted-writing.local.enable')) {
        onError({
          message: 'llama.cpp or text-generation webui is not enabled!',
        })
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

      if (this.containsBlockedWord(text)) {
        onError({ message: 'This text contains blocked words!' })
        return false
      }

      await geminiApi(text, apiKey, modelName, params, onChunkReceived, onError)
    } else if (this.type === 'ollama') {
      // Add Ollama case
      if (!atom.config.get('assisted-writing.ollama.enable')) {
        onError({ message: 'Ollama backend is not enabled!' })
        return false
      }

      const endpoint = atom.config.get('assisted-writing.ollama.endpoint')
      const model = atom.config.get('assisted-writing.ollama.model')
      const params = {
        ...JSON.parse(atom.config.get('assisted-writing.ollama.params')),
        ...{ prompt: text, model: model }, // Include prompt and model
        stream: true,
        raw: true,
      }
      await ollamaApi(params, endpoint, onChunkReceived, onError)
    }
  }

  abort() {
    if (this.type === 'local') {
      localAbort()
    } else if (this.type === 'gemini') {
      geminiApiAbort()
    } else if (this.type === 'ollama') {
      ollamaAbort()
    }
  }

  containsBlockedWord(src) {
    const blockedWords = atom.config
      .get('assisted-writing.gemini.blockedWords')
      .split(' ')
      .filter((w) => w.length > 0)
    return blockedWords.some((word) => src.includes(word))
  }
}
