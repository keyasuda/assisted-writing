'use babel'

import UIManager from '../lib/ui-manager'
import TokenCountView from '../lib/token-count-view'
import BackendModeView from '../lib/backend-mode-view'

describe('UIManager', () => {
  let uiManager, mockTokenCountView, mockBackendModeView, mockStatusBar
  
  beforeEach(() => {
    // Mock TokenCountView
    mockTokenCountView = jasmine.createSpyObj('TokenCountView', ['update', 'getPanel', 'destroy', 'serialize'])
    mockTokenCountView.getPanel.and.returnValue({id: 'token-count-panel'})
    mockTokenCountView.serialize.and.returnValue({tokenCountState: 'serialized'})
    
    // Mock BackendModeView
    mockBackendModeView = jasmine.createSpyObj('BackendModeView', ['update', 'getPanel', 'destroy', 'serialize'])
    mockBackendModeView.getPanel.and.returnValue({id: 'backend-mode-panel'})
    mockBackendModeView.serialize.and.returnValue({backendModeState: 'serialized'})
    
    // Mock constructors
    const originalTokenCountView = window.TokenCountView
    const originalBackendModeView = window.BackendModeView
    window.TokenCountView = jasmine.createSpy('TokenCountView').and.returnValue(mockTokenCountView)
    window.BackendModeView = jasmine.createSpy('BackendModeView').and.returnValue(mockBackendModeView)

    // Restore original constructors after each test
    afterEach(() => {
      window.TokenCountView = originalTokenCountView
      window.BackendModeView = originalBackendModeView
    })
    
    // Create UIManager
    uiManager = new UIManager({
      tokenCountViewState: {state: 'initial'},
      backendModeViewState: {state: 'initial'}
    })
    
    // Mock status bar
    mockStatusBar = {
      addLeftTile: jasmine.createSpy('addLeftTile').and.returnValue({destroy: () => {}}),
      addRightTile: jasmine.createSpy('addRightTile').and.returnValue({destroy: () => {}})
    }
  })
  
  describe('constructor', () => {
    it('initializes UI components with state', () => {
      expect(TokenCountView).toHaveBeenCalledWith({state: 'initial'})
      expect(BackendModeView).toHaveBeenCalledWith({state: 'initial'})
    })
  })
  
  describe('updateBackendMode()', () => {
    it('updates the backend mode view', () => {
      uiManager.updateBackendMode('local')
      expect(mockBackendModeView.update).toHaveBeenCalledWith('local', null)
      
      uiManager.updateBackendMode('ollama', 'llama3')
      expect(mockBackendModeView.update).toHaveBeenCalledWith('ollama', 'llama3')
    })
  })
  
  describe('updateTokenCount()', () => {
    it('updates the token count view', () => {
      uiManager.updateTokenCount(42)
      expect(mockTokenCountView.update).toHaveBeenCalledWith(42)
    })
  })
  
  describe('getBackendModePanel()', () => {
    it('returns the backend mode panel', () => {
      const panel = uiManager.getBackendModePanel()
      expect(panel).toEqual({id: 'backend-mode-panel'})
      expect(mockBackendModeView.getPanel).toHaveBeenCalled()
    })
  })
  
  describe('getTokenCountPanel()', () => {
    it('returns the token count panel', () => {
      const panel = uiManager.getTokenCountPanel()
      expect(panel).toEqual({id: 'token-count-panel'})
      expect(mockTokenCountView.getPanel).toHaveBeenCalled()
    })
  })
  
  describe('addToStatusBar()', () => {
    it('adds UI components to the status bar', () => {
      uiManager.addToStatusBar(mockStatusBar)
      
      expect(mockStatusBar.addLeftTile).toHaveBeenCalledWith({
        item: {id: 'token-count-panel'}
      })
      
      expect(mockStatusBar.addRightTile).toHaveBeenCalledWith({
        item: {id: 'backend-mode-panel'}
      })
    })
    
    it('does nothing if status bar is not provided', () => {
      uiManager.addToStatusBar(null)
      
      expect(mockStatusBar.addLeftTile).not.toHaveBeenCalled()
      expect(mockStatusBar.addRightTile).not.toHaveBeenCalled()
    })
  })
  
  describe('dispose()', () => {
    it('destroys UI components', () => {
      uiManager.dispose()
      
      expect(mockTokenCountView.destroy).toHaveBeenCalled()
      expect(mockBackendModeView.destroy).toHaveBeenCalled()
    })
    
    it('handles status bar tile disposal', () => {
      // Add spy for tile destroy
      const leftTileDestroySpy = jasmine.createSpy('leftTileDestroy')
      const rightTileDestroySpy = jasmine.createSpy('rightTileDestroy')
      
      mockStatusBar.addLeftTile.and.returnValue({destroy: leftTileDestroySpy})
      mockStatusBar.addRightTile.and.returnValue({destroy: rightTileDestroySpy})
      
      uiManager.addToStatusBar(mockStatusBar)
      uiManager.dispose()
      
      expect(leftTileDestroySpy).toHaveBeenCalled()
      expect(rightTileDestroySpy).toHaveBeenCalled()
    })
  })
  
  describe('serialize()', () => {
    it('returns serialized state of UI components', () => {
      const state = uiManager.serialize()
      
      expect(state).toEqual({
        tokenCountViewState: {tokenCountState: 'serialized'},
        backendModeViewState: {backendModeState: 'serialized'}
      })
      
      expect(mockTokenCountView.serialize).toHaveBeenCalled()
      expect(mockBackendModeView.serialize).toHaveBeenCalled()
    })
  })
})