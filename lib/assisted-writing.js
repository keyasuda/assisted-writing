'use babel'

const path = require('path')

import { CompositeDisposable } from 'atom'
import GenerationService from './generation-service'
import { config } from './config'
import BackendManager from './backend-manager'
import EditorManager from './editor-manager'
import UIManager from './ui-manager'
import ConfigManager from './config-manager'

export default {
  config: config,
  generationService: null,
  subscriptions: null,
  backendManager: null,
  editorManager: null,
  uiManager: null,
  configManager: null,
  tokenCountWorker: null,

  async activate(state) {
    console.log('assisted-writing:activated')
    
    // Initialize managers
    this.configManager = new ConfigManager()
    this.backendManager = new BackendManager(state.assistedWritingState || {})
    this.uiManager = new UIManager(state)
    
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    
    // Register commands
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'assisted-writing:run': () => this.run(),
        'assisted-writing:abort': () => this.abort(),
        'assisted-writing:use-local-llm': () => this.setBackend('local'),
        'assisted-writing:use-google-ai-studio-gemini-api': () =>
          this.setBackend('gemini'),
      })
    )
    
    // Initialize backend manager
    await this.backendManager.initialize()
    
    // Update UI with current backend
    this.uiManager.updateBackendMode(
      this.backendManager.getCurrentBackend(),
      this.backendManager.getCurrentOllamaModel()
    )
    
    // Set up panel click handler to toggle backend
    this.uiManager.getBackendModePanel().addEventListener('click', (e) => {
      const currentBackend = this.backendManager.getCurrentBackend()
      const nextBackend = this.backendManager.flipBackend(currentBackend)
      this.setBackend(nextBackend)
    })
    
    // Initialize token count worker
    this.tokenCountWorker = new Worker(
      path.resolve(__dirname, 'token-count-worker.js')
    )
    this.tokenCountWorker.addEventListener('message', (e) => {
      this.uiManager.updateTokenCount(e.data)
    })
    
    // Set up cursor observer for token counting
    atom.workspace.observeTextEditors((editor) => {
      editor.observeCursors((cursor) => {
        cursor.onDidChangePosition((event) => {
          if (!this.editorManager) {
            this.editorManager = new EditorManager(this.signalProvider)
          }
          
          const cursor = event.cursor
          const editor = cursor.editor
          const text = this.editorManager.textToCursor(editor, event.newBufferPosition)
          
          // Send text to token count worker
          this.tokenCountWorker.postMessage({
            text,
            model: this.configManager.get('tokenCounter.tokenizer'),
            apiUrl: this.configManager.get('tokenCounter.tokenizerEndpoint'),
          })
        })
      })
    })
  },

  deactivate() {
    this.subscriptions.dispose()
    this.backendManager.dispose()
    this.uiManager.dispose()
    
    if (this.tokenCountWorker) {
      this.tokenCountWorker.terminate()
      this.tokenCountWorker = null
    }
  },

  serialize() {
    return {
      ...this.uiManager.serialize(),
      assistedWritingState: this.backendManager.serialize(),
    }
  },

  consumeStatusBar(statusBar) {
    this.uiManager.addToStatusBar(statusBar)
  },

  consumeSignal(registry) {
    const provider = registry.create()
    this.subscriptions.add(provider)
    this.signalProvider = provider
    
    // Initialize editor manager with signal provider if not already done
    if (!this.editorManager) {
      this.editorManager = new EditorManager(this.signalProvider)
    }
  },

  async run() {
    // Initialize editor manager if not already done
    if (!this.editorManager) {
      this.editorManager = new EditorManager(this.signalProvider)
    }
    
    // Prevent re-entry if already running
    if (this.editorManager.isRunning()) {
      return
    }
    
    const editor = this.editorManager.getActiveEditor()
    if (!editor) return
    
    const cursorPosition = editor.getCursorBufferPosition()
    const text = this.editorManager.textToCursor(editor, cursorPosition)
    
    this.editorManager.setRunningStatus(editor)
    
    this.generationService = new GenerationService(
      this.backendManager.getCurrentBackend(),
      this.backendManager.getCurrentOllamaModel()
    )
    
    await this.generationService.completion(
      text,
      (chunk) => {
        editor.insertText(chunk, {
          autoIndent: false,
          autoIndentNewline: false,
          autoDecreaseIndent: false,
        })
      },
      (error) => {
        if (error.message === 'Failed to fetch') {
          atom.notifications.addError(
            'Completion API call error: Is the API running?'
          )
        } else if (error.message !== 'The user aborted a request.') {
          atom.notifications.addError(error.message)
          console.log(error)
        }
      }
    )
    
    this.editorManager.cancelRunningStatus(editor)
  },

  abort() {
    try {
      if (!this.editorManager) {
        this.editorManager = new EditorManager(this.signalProvider)
      }
      
      const editor = this.editorManager.getActiveEditor()
      if (editor) {
        this.editorManager.cancelRunningStatus(editor)
      }
      
      if (this.generationService) {
        this.generationService.abort()
      }
    } catch (e) {
      console.error('Error during abort:', e)
    }
  },

  setBackend(mode, model = null) {
    if (this.backendManager.setBackend(mode, model)) {
      this.uiManager.updateBackendMode(
        this.backendManager.getCurrentBackend(),
        this.backendManager.getCurrentOllamaModel()
      )
    }
  },
  
  // Methods kept for backward compatibility with tests
  enabledBackends() {
    return this.backendManager ? this.backendManager.enabledBackends() : []
  },
  
  flipBackend(current) {
    return this.backendManager ? this.backendManager.flipBackend(current) : current
  }
}