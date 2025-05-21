'use babel'

import ConfigManager from '../lib/config-manager'
import { config } from '../lib/config'

describe('ConfigManager', () => {
  let configManager
  
  beforeEach(() => {
    configManager = new ConfigManager()
    
    // Mock atom.config methods
    spyOn(atom.config, 'get').and.callFake((key) => {
      if (key === 'assisted-writing.local.enable') return true
      if (key === 'assisted-writing.local.endpoint') return 'http://localhost:8080'
      if (key === 'assisted-writing.local.params') return '{"temperature": 0.8}'
      
      if (key === 'assisted-writing.gemini.enable') return false
      if (key === 'assisted-writing.gemini.apiKey') return 'test-api-key'
      if (key === 'assisted-writing.gemini.modelName') return 'gemini-pro'
      if (key === 'assisted-writing.gemini.params') return '{"temperature": 0.7}'
      if (key === 'assisted-writing.gemini.blockedWords') return 'blocked word1 word2'
      
      if (key === 'assisted-writing.ollama.enable') return true
      if (key === 'assisted-writing.ollama.endpointBase') return 'http://localhost:11434'
      if (key === 'assisted-writing.ollama.params') return '{"temperature": 0.9}'
      
      if (key === 'assisted-writing.tokenCounter.tokenizer') return 'gpt4o'
      if (key === 'assisted-writing.tokenCounter.tokenizerEndpoint') return 'http://localhost:8080/tokenize'
      
      return null
    })
    
    spyOn(atom.config, 'set')
    spyOn(atom.config, 'observe')
  })
  
  describe('getConfigSchema()', () => {
    it('returns the config schema', () => {
      expect(configManager.getConfigSchema()).toBe(config)
    })
  })
  
  describe('get()', () => {
    it('gets configuration values from atom.config', () => {
      expect(configManager.get('local.enable')).toBe(true)
      expect(configManager.get('gemini.apiKey')).toBe('test-api-key')
      expect(configManager.get('ollama.endpointBase')).toBe('http://localhost:11434')
      expect(configManager.get('tokenCounter.tokenizer')).toBe('gpt4o')
      
      expect(atom.config.get).toHaveBeenCalledWith('assisted-writing.local.enable')
      expect(atom.config.get).toHaveBeenCalledWith('assisted-writing.gemini.apiKey')
      expect(atom.config.get).toHaveBeenCalledWith('assisted-writing.ollama.endpointBase')
      expect(atom.config.get).toHaveBeenCalledWith('assisted-writing.tokenCounter.tokenizer')
    })
  })
  
  describe('set()', () => {
    it('sets configuration values in atom.config', () => {
      configManager.set('local.enable', false)
      configManager.set('gemini.apiKey', 'new-api-key')
      
      expect(atom.config.set).toHaveBeenCalledWith('assisted-writing.local.enable', false)
      expect(atom.config.set).toHaveBeenCalledWith('assisted-writing.gemini.apiKey', 'new-api-key')
    })
  })
  
  describe('observe()', () => {
    it('observes configuration changes', () => {
      const callback = jasmine.createSpy('callback')
      configManager.observe('local.enable', callback)
      
      expect(atom.config.observe).toHaveBeenCalledWith('assisted-writing.local.enable', callback)
    })
  })
  
  describe('getTokenCounterConfig()', () => {
    it('returns token counter configuration', () => {
      const config = configManager.getTokenCounterConfig()
      
      expect(config).toEqual({
        tokenizer: 'gpt4o',
        endpoint: 'http://localhost:8080/tokenize'
      })
    })
  })
  
  describe('getLocalConfig()', () => {
    it('returns local LLM configuration', () => {
      const config = configManager.getLocalConfig()
      
      expect(config).toEqual({
        enabled: true,
        endpoint: 'http://localhost:8080',
        params: {temperature: 0.8}
      })
    })
  })
  
  describe('getGeminiConfig()', () => {
    it('returns Gemini API configuration', () => {
      const config = configManager.getGeminiConfig()
      
      expect(config).toEqual({
        enabled: false,
        apiKey: 'test-api-key',
        modelName: 'gemini-pro',
        params: {temperature: 0.7},
        blockedWords: 'blocked word1 word2'
      })
    })
  })
  
  describe('getOllamaConfig()', () => {
    it('returns Ollama configuration', () => {
      const config = configManager.getOllamaConfig()
      
      expect(config).toEqual({
        enabled: true,
        endpointBase: 'http://localhost:11434',
        params: {temperature: 0.9}
      })
    })
  })
})