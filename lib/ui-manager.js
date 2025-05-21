'use babel'

import TokenCountView from './token-count-view'
import BackendModeView from './backend-mode-view'

export default class UIManager {
  constructor(state = {}) {
    // Initialize UI components
    this.tokenCountView = new TokenCountView(state.tokenCountViewState)
    this.backendModeView = new BackendModeView(state.backendModeViewState)
    this.statusBarTiles = { left: null, right: null }
  }
  
  // Update the backend mode display
  updateBackendMode(mode, model = null) {
    this.backendModeView.update(mode, model)
  }
  
  // Update the token count display
  updateTokenCount(count) {
    this.tokenCountView.update(count)
  }
  
  // Get the backend mode panel element
  getBackendModePanel() {
    return this.backendModeView.getPanel()
  }
  
  // Get the token count panel element
  getTokenCountPanel() {
    return this.tokenCountView.getPanel()
  }
  
  // Add UI components to the status bar
  addToStatusBar(statusBar) {
    if (statusBar) {
      this.statusBarTiles.left = statusBar.addLeftTile({
        item: this.tokenCountView.getPanel(),
      })
      
      this.statusBarTiles.right = statusBar.addRightTile({
        item: this.backendModeView.getPanel(),
      })
    }
  }
  
  // Clean up UI components
  dispose() {
    if (this.tokenCountView) {
      this.tokenCountView.destroy()
    }
    
    if (this.backendModeView) {
      this.backendModeView.destroy()
    }
    
    // Remove status bar tiles if they exist
    if (this.statusBarTiles.left) {
      this.statusBarTiles.left.destroy()
    }
    
    if (this.statusBarTiles.right) {
      this.statusBarTiles.right.destroy()
    }
  }
  
  // Serialize UI component state
  serialize() {
    return {
      tokenCountViewState: this.tokenCountView.serialize(),
      backendModeViewState: this.backendModeView.serialize(),
    }
  }
}