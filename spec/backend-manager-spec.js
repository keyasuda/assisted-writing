'use babel'

import BackendManager from '../lib/backend-manager'

describe('BackendManager', () => {
  let backendManager
  
  beforeEach(() => {
    backendManager = new BackendManager()
    // Mock atom.config.get for testing
    spyOn(atom.config, 'get').and.callFake((key) => {
      if (key === 'assisted-writing.local.enable') return true
      if (key === 'assisted-writing.gemini.enable') return false
      if (key === 'assisted-writing.ollama.enable') return false
      return null
    })
  })
  
  describe('enabledBackends()', () => {
    it('returns an array of enabled backends', () => {
      // local API enabled, Gemini API disabled
      expect(backendManager.enabledBackends()).toEqual(['local'])
      
      // Change the mock to test different configurations
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return false
        if (key === 'assisted-writing.gemini.enable') return true
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      expect(backendManager.enabledBackends()).toEqual(['gemini'])
      
      // Both local API and Gemini API enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return true
        if (key === 'assisted-writing.gemini.enable') return true
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      expect(backendManager.enabledBackends()).toEqual(['local', 'gemini'])
      
      // All backends enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return true
        if (key === 'assisted-writing.gemini.enable') return true
        if (key === 'assisted-writing.ollama.enable') return true
        return null
      })
      expect(backendManager.enabledBackends()).toEqual(['local', 'gemini', 'ollama'])
      
      // All backends disabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return false
        if (key === 'assisted-writing.gemini.enable') return false
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      expect(backendManager.enabledBackends()).toEqual([])
    })
  })
  
  describe('flipBackend()', () => {
    it('returns current backend if no backend is enabled', () => {
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return false
        if (key === 'assisted-writing.gemini.enable') return false
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      expect(backendManager.flipBackend('local')).toEqual('local')
    })
    
    it('returns the only enabled backend if only one backend is enabled', () => {
      // local API only enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return true
        if (key === 'assisted-writing.gemini.enable') return false
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      expect(backendManager.flipBackend('gemini')).toEqual('local')
      
      // gemini API only enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return false
        if (key === 'assisted-writing.gemini.enable') return true
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      expect(backendManager.flipBackend('local')).toEqual('gemini')
    })
    
    it('returns the next enabled backend if multiple backends are enabled', () => {
      // Both local and gemini enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return true
        if (key === 'assisted-writing.gemini.enable') return true
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      expect(backendManager.flipBackend('local')).toEqual('gemini')
      expect(backendManager.flipBackend('gemini')).toEqual('local')
      
      // All three backends enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return true
        if (key === 'assisted-writing.gemini.enable') return true
        if (key === 'assisted-writing.ollama.enable') return true
        return null
      })
      expect(backendManager.flipBackend('local')).toEqual('gemini')
      expect(backendManager.flipBackend('gemini')).toEqual('ollama')
      expect(backendManager.flipBackend('ollama')).toEqual('local')
    })
  })
  
  describe('setBackend()', () => {
    it('sets the backend if it is enabled', () => {
      // Both local and gemini enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return true
        if (key === 'assisted-writing.gemini.enable') return true
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      
      expect(backendManager.setBackend('gemini')).toBe(true)
      expect(backendManager.getCurrentBackend()).toEqual('gemini')
      
      expect(backendManager.setBackend('local')).toBe(true)
      expect(backendManager.getCurrentBackend()).toEqual('local')
    })
    
    it('does not set the backend if it is disabled', () => {
      // Only local enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return true
        if (key === 'assisted-writing.gemini.enable') return false
        if (key === 'assisted-writing.ollama.enable') return false
        return null
      })
      
      backendManager.setBackend('local') // Set to a known state
      expect(backendManager.getCurrentBackend()).toEqual('local')
      
      expect(backendManager.setBackend('gemini')).toBe(false)
      expect(backendManager.getCurrentBackend()).toEqual('local') // Should not change
    })
    
    it('sets the Ollama model when provided', () => {
      // Ollama enabled
      atom.config.get.and.callFake((key) => {
        if (key === 'assisted-writing.local.enable') return false
        if (key === 'assisted-writing.gemini.enable') return false
        if (key === 'assisted-writing.ollama.enable') return true
        return null
      })
      
      expect(backendManager.setBackend('ollama', 'llama3')).toBe(true)
      expect(backendManager.getCurrentBackend()).toEqual('ollama')
      expect(backendManager.getCurrentOllamaModel()).toEqual('llama3')
    })
  })
  
  describe('serialize()', () => {
    it('returns the current state', () => {
      backendManager.setBackend('local')
      expect(backendManager.serialize()).toEqual({
        backendMode: 'local',
        ollamaModel: null
      })
      
      // Set Ollama model
      backendManager.setBackend('ollama', 'llama3')
      expect(backendManager.serialize()).toEqual({
        backendMode: 'ollama',
        ollamaModel: 'llama3'
      })
    })
  })
})