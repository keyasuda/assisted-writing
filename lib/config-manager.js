'use babel'

import { config } from './config'

export default class ConfigManager {
  constructor() {
    this.config = config
  }
  
  // Get the configuration schema
  getConfigSchema() {
    return this.config
  }
  
  // Get a configuration value
  get(key) {
    return atom.config.get(`assisted-writing.${key}`)
  }
  
  // Set a configuration value
  set(key, value) {
    return atom.config.set(`assisted-writing.${key}`, value)
  }
  
  // Observe changes to a configuration value
  observe(key, callback) {
    return atom.config.observe(`assisted-writing.${key}`, callback)
  }
  
  // Get the token counter configuration
  getTokenCounterConfig() {
    return {
      tokenizer: this.get('tokenCounter.tokenizer'),
      endpoint: this.get('tokenCounter.tokenizerEndpoint')
    }
  }
  
  // Get the local LLM configuration
  getLocalConfig() {
    const params = this.get('local.params')
    return {
      enabled: this.get('local.enable'),
      endpoint: this.get('local.endpoint'),
      params: params ? JSON.parse(params) : {}
    }
  }
  
  // Get the Gemini API configuration
  getGeminiConfig() {
    const params = this.get('gemini.params')
    return {
      enabled: this.get('gemini.enable'),
      apiKey: this.get('gemini.apiKey'),
      modelName: this.get('gemini.modelName'),
      params: params ? JSON.parse(params) : {},
      blockedWords: this.get('gemini.blockedWords')
    }
  }
  
  // Get the Ollama configuration
  getOllamaConfig() {
    const params = this.get('ollama.params')
    return {
      enabled: this.get('ollama.enable'),
      endpointBase: this.get('ollama.endpointBase'),
      params: params ? JSON.parse(params) : {}
    }
  }
}