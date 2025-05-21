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
    return {
      enabled: this.get('local.enable'),
      endpoint: this.get('local.endpoint'),
      params: JSON.parse(this.get('local.params'))
    }
  }
  
  // Get the Gemini API configuration
  getGeminiConfig() {
    return {
      enabled: this.get('gemini.enable'),
      apiKey: this.get('gemini.apiKey'),
      modelName: this.get('gemini.modelName'),
      params: JSON.parse(this.get('gemini.params')),
      blockedWords: this.get('gemini.blockedWords')
    }
  }
  
  // Get the Ollama configuration
  getOllamaConfig() {
    return {
      enabled: this.get('ollama.enable'),
      endpointBase: this.get('ollama.endpointBase'),
      params: JSON.parse(this.get('ollama.params'))
    }
  }
}