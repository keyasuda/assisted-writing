'use babel'

import { ollamaModels } from './ollama-api.js'
import { CompositeDisposable } from 'atom'

export default class BackendManager {
  constructor(state = {}) {
    this.backendMode = 'local'
    this.ollamaModel = null
    this.ollamaCommands = new CompositeDisposable()
    
    // Initialize from state if available
    if (state.backendMode && this.enabledBackends().indexOf(state.backendMode) > -1) {
      this.backendMode = state.backendMode
    } else {
      this.backendMode = this.enabledBackends()[0] || 'local'
    }
    
    if (state.ollamaModel) {
      this.ollamaModel = state.ollamaModel
    }
  }

  async initialize() {
    // Initialize Ollama models if Ollama is enabled
    if (atom.config.get('assisted-writing.ollama.enable')) {
      const endpointBase = atom.config.get('assisted-writing.ollama.endpointBase')
      const models = await this.fetchOllamaModels(endpointBase)
      
      if (models.indexOf(this.ollamaModel) === -1) {
        if (models.length > 0) {
          this.ollamaModel = models[0]
        } else {
          this.ollamaModel = null
          atom.notifications.addWarning(
            'No Ollama models found. Please check your Ollama setup or install a model.',
            { dismissable: true }
          )
        }
      }
      
      this.setOllamaModelCommands(models)
    }
    
    // Set up config observer for Ollama
    atom.config.observe('assisted-writing.ollama.enable', async (enabled) => {
      if (enabled) {
        const endpointBase = atom.config.get('assisted-writing.ollama.endpointBase')
        const models = await this.fetchOllamaModels(endpointBase)
        this.setOllamaModelCommands(models)
      } else {
        this.setOllamaModelCommands([])
      }
    })
    
    // Check if any backends are enabled
    if (this.enabledBackends().length === 0) {
      atom.notifications.addError('No enabled LLM backends', {
        dismissable: true,
      })
    }
  }
  
  async fetchOllamaModels(endpointBase) {
    return await ollamaModels(endpointBase, (e) => {
      atom.notifications.addError('Is Ollama running?', {
        dismissable: true,
      })
    })
  }
  
  setBackend(mode, model = null) {
    if (this.enabledBackends().indexOf(mode) >= 0) {
      this.backendMode = mode
      if (model !== null) {
        this.ollamaModel = model
      }
      return true
    }
    return false
  }
  
  getCurrentBackend() {
    return this.backendMode
  }
  
  getCurrentOllamaModel() {
    return this.ollamaModel
  }
  
  // Returns an array of enabled backends
  enabledBackends() {
    const ret = []
    
    if (atom.config.get('assisted-writing.local.enable')) {
      ret.push('local')
    }
    
    if (atom.config.get('assisted-writing.gemini.enable')) {
      ret.push('gemini')
    }
    
    if (atom.config.get('assisted-writing.ollama.enable')) {
      ret.push('ollama')
    }
    
    return ret
  }
  
  // Cycles to the next available backend
  flipBackend(current) {
    const available = this.enabledBackends()
    if (available.length === 0) {
      return current // No enabled backends, return current
    }
    
    const currentIndex = available.indexOf(current)
    if (currentIndex === -1) {
      // Current backend not in available list (shouldn't happen, but handle it)
      return available[0] // Return the first available backend
    }
    
    const nextIndex = (currentIndex + 1) % available.length // Cycle through available backends
    return available[nextIndex]
  }
  
  // Set up Ollama model commands
  setOllamaModelCommands(models) {
    this.ollamaCommands.dispose()
    this.ollamaCommands = new CompositeDisposable()
    
    if (atom.config.get('assisted-writing.ollama.enable')) {
      const commands = {}
      models.forEach((m) => {
        commands[`assisted-writing:ollama-${m.replace(':', '-')}`] = () =>
          this.setBackend('ollama', m)
      })
      
      this.ollamaCommands.add(atom.commands.add('atom-text-editor', commands))
    }
  }
  
  dispose() {
    this.ollamaCommands.dispose()
  }
  
  serialize() {
    return {
      backendMode: this.backendMode,
      ollamaModel: this.ollamaModel,
    }
  }
}