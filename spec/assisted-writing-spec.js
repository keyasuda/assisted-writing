'use babel'

import AssistedWriting from '../lib/assisted-writing'
import BackendManager from '../lib/backend-manager'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AssistedWriting', () => {
  let workspaceElement, activationPromise

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('assisted-writing')
    
    // Initialize backendManager for the main module
    AssistedWriting.backendManager = new BackendManager()
  })

  describe('enabledBackends()', () => {
    it('returns an array of enabled backends', () => {
      // local API enabled, Gemini API disabled
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', false)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.enabledBackends()).toEqual(['local'])

      // local API disabled, Gemini API enabled
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', true)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.enabledBackends()).toEqual(['gemini'])

      // local API and Gemini API both enabled
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', true)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.enabledBackends()).toEqual(['local', 'gemini'])

      // All backends enabled
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', true)
      atom.config.set('assisted-writing.ollama.enable', true)
      expect(AssistedWriting.enabledBackends()).toEqual(['local', 'gemini', 'ollama'])

      // All backends disabled
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', false)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.enabledBackends()).toEqual([])
    })
  })

  describe('flipBackend()', () => {
    it('returns current backend if no backend is enabled', () => {
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', false)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.flipBackend('local')).toEqual('local')
    })

    it('returns the only enabled backend if only one backend is enabled', () => {
      // local API only enabled
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', false)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.flipBackend('gemini')).toEqual('local')

      // gemini API only enabled
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', true)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.flipBackend('local')).toEqual('gemini')
    })

    it('returns the next enabled backend if multiple backends are enabled', () => {
      // Both local and gemini enabled
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', true)
      atom.config.set('assisted-writing.ollama.enable', false)
      expect(AssistedWriting.flipBackend('local')).toEqual('gemini')
      expect(AssistedWriting.flipBackend('gemini')).toEqual('local')
      
      // All three backends enabled
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', true)
      atom.config.set('assisted-writing.ollama.enable', true)
      expect(AssistedWriting.flipBackend('local')).toEqual('gemini')
      expect(AssistedWriting.flipBackend('gemini')).toEqual('ollama')
      expect(AssistedWriting.flipBackend('ollama')).toEqual('local')
    })
  })
  
  describe('setBackend()', () => {
    beforeEach(() => {
      // Create spy for UI manager
      AssistedWriting.uiManager = {
        updateBackendMode: jasmine.createSpy('updateBackendMode')
      }
    })
    
    it('sets the backend and updates UI', () => {
      // Mock enabledBackends to return all backends as enabled
      spyOn(AssistedWriting.backendManager, 'setBackend').and.returnValue(true)
      spyOn(AssistedWriting.backendManager, 'getCurrentBackend').and.returnValue('gemini')
      spyOn(AssistedWriting.backendManager, 'getCurrentOllamaModel').and.returnValue(null)
      
      AssistedWriting.setBackend('gemini')
      
      expect(AssistedWriting.backendManager.setBackend).toHaveBeenCalledWith('gemini', null)
      expect(AssistedWriting.uiManager.updateBackendMode).toHaveBeenCalledWith('gemini', null)
    })
    
    it('sets the backend with Ollama model', () => {
      spyOn(AssistedWriting.backendManager, 'setBackend').and.returnValue(true)
      spyOn(AssistedWriting.backendManager, 'getCurrentBackend').and.returnValue('ollama')
      spyOn(AssistedWriting.backendManager, 'getCurrentOllamaModel').and.returnValue('llama3')
      
      AssistedWriting.setBackend('ollama', 'llama3')
      
      expect(AssistedWriting.backendManager.setBackend).toHaveBeenCalledWith('ollama', 'llama3')
      expect(AssistedWriting.uiManager.updateBackendMode).toHaveBeenCalledWith('ollama', 'llama3')
    })
  })
})
