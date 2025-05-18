'use babel'

const path = require('path')

import TokenCountView from './token-count-view'
import BackendModeView from './backend-mode-view'
import { CompositeDisposable } from 'atom'
import GenerationService from './generation-service'
import { config } from './config'
import { ollamaModels } from './ollama-api.js'

const runningClass = 'assisted-writing-running'

export default {
  backendMode: 'local',
  backendModeView: null,
  config: config,
  generationService: null,
  subscriptions: null,
  ollamaCommands: null,
  modalPanel: null,
  tokenCountView: null,

  activate(state) {
    console.log('assisted-writing:activated')
    this.tokenCountView = new TokenCountView(state.tokenCountViewState)
    this.backendModeView = new BackendModeView(state.backendModeViewState)

    // backendMode を state から読み込み、存在しない場合は初期値を最初に有効なバックエンドに設定
    var backendMode =
      (state.assistedWritingState && state.assistedWritingState.backendMode) ||
      this.enabledBackends()[0]
    if (this.enabledBackends().indexOf(backendMode) > -1) {
      this.backendMode = backendMode
    } else {
      this.backendMode = this.enabledBackends()[0]
    }

    var ollamaModel =
      (state.assistedWritingState && state.assistedWritingState.ollamaModel) ||
      null
    if (this.enabledModels().indexOf(ollamaModel) > -1) {
      this.ollamaModel = ollamaModel
    } else {
      this.ollamaModel = null
    }

    this.backendModeView.update(this.backendMode)
    // パネルクリックでbackendModeをトグルさせる
    this.backendModeView.getPanel().addEventListener('click', (e) => {
      this.setBackend(this.flipBackend(this.backendMode))
    })

    // 使用可能なバックエンドがない場合警告を出す
    if (this.enabledBackends().length == 0) {
      atom.notifications.addError('No enabled LLM backends', {
        dismissable: true,
      })
    }

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.ollamaCommands = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'assisted-writing:run': () => this.run(),
        'assisted-writing:abort': () => this.abort(),
        'assisted-writing:use-local-llm': () => this.setBackend('local'),
        'assisted-writing:use-google-ai-studio-gemini-api': () =>
          this.setBackend('gemini'),
      })
    )

    this.setOllamaModelCommands()
    atom.config.observe('assisted-writing.ollama.enable', () =>
      this.setOllamaModelCommands()
    )

    // init token count worker
    var tokenCountWorker = new Worker(
      path.resolve(__dirname, 'token-count-worker.js')
    )
    tokenCountWorker.addEventListener('message', (e) => {
      this.tokenCountView.update(e.data)
    })

    // cursor observer
    atom.workspace.observeTextEditors((editor) => {
      editor.observeCursors((cursor) => {
        cursor.onDidChangePosition((event) => {
          var cursor = event.cursor
          var editor = cursor.editor
          var text = this.textToCursor(editor, event.newBufferPosition)
          // put current text to count worker
          tokenCountWorker.postMessage({
            text,
            model: atom.config.get('assisted-writing.tokenCounter.tokenizer'),
            apiUrl: atom.config.get(
              'assisted-writing.tokenCounter.tokenizerEndpoint'
            ),
          })
        })
      })
    })
  },

  deactivate() {
    this.subscriptions.dispose()
    this.ollamaCommands.dispose()
    this.tokenCountView.destroy()
    this.backendModeView.destroy()
  },

  serialize() {
    return {
      tokenCountViewState: this.tokenCountView.serialize(),
      backendModeViewState: this.backendModeView.serialize(),
      assistedWritingState: { 
        backendMode: this.backendMode, 
        ollamaModel: this.ollamaModel // ollamaModel を state に追加
      }, 
    }
  },

  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({
      item: this.tokenCountView.getPanel(),
    })

    statusBar.addRightTile({
      item: this.backendModeView.getPanel(),
    })
  },

  consumeSignal(registry) {
    const provider = registry.create()
    this.subscriptions.add(provider)
    this.signalProvider = provider
  },

  async run() {
    // 再入防止
    if (atom.workspace.getElement().classList.contains(runningClass)) {
      return
    }

    var editor = atom.workspace.getActiveTextEditor()
    var cursorPosition = editor.getCursorBufferPosition()
    var text = this.textToCursor(editor, cursorPosition)

    this.setRunningStatus(editor)

    this.generationService = new GenerationService(
      this.backendMode,
      this.ollamaModel
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
        if (error.message == 'Failed to fetch') {
          atom.notifications.addError(
            'Completion API call error: Is the API running?'
          )
        } else if (error.message != 'The user aborted a request.') {
          atom.notifications.addError(error.message)
          console.log(error)
        }
      }
    )

    this.cancelRunningStatus(editor)
  },

  abort() {
    try {
      var editor = atom.workspace.getActiveTextEditor()
      this.cancelRunningStatus(editor)
      this.generationService.abort()
    } catch (e) {}
  },

  setBackend(mode, model = null) {
    if (this.enabledBackends().indexOf(mode) >= 0) {
      this.backendMode = mode
      if (model != null && this.enabledModels().includes(model)) {
        this.ollamaModel = model
      } else {
        this.ollamaModel = null
      }
      if (model == null) {
        this.backendModeView.update(mode)
      } else {
        this.backendModeView.update(mode, model)
      }
    }
  },

  textToCursor(editor, cursorPosition) {
    return editor.getTextInRange([
      [0, 0],
      [cursorPosition.row, cursorPosition.column],
    ])
  },

  setRunningStatus(editor) {
    // abortはこのクラス名がついている時のみ発動可能
    editor.getElement().classList.add(runningClass)
    atom.workspace.getElement().classList.add(runningClass)
    this.signalProvider.add('Assisted Writing: running')
  },

  cancelRunningStatus(editor) {
    // 実行終了なのでクラス名を外す
    editor.getElement().classList.remove(runningClass)
    atom.workspace.getElement().classList.remove(runningClass)
    this.signalProvider.clear()
  },

  flipBackend(current) {
    var available = this.enabledBackends()
    if (available.length === 0) {
      return current // No enabled backends, return current
    }

    var currentIndex = available.indexOf(current)
    if (currentIndex === -1) {
      // Current backend not in available list (shouldn't happen, but handle it)
      return available[0] // Return the first available backend
    }

    var nextIndex = (currentIndex + 1) % available.length // Cycle through available backends
    return available[nextIndex]
  },

  // 利用可能なバックエンド
  enabledBackends() {
    var ret = []

    if (atom.config.get('assisted-writing.local.enable')) {
      ret.push('local')
    }

    if (atom.config.get('assisted-writing.gemini.enable')) {
      ret.push('gemini')
    }
    if (atom.config.get('assisted-writing.ollama.enable')) {
      // Add Ollama check
      ret.push('ollama')
    }

    return ret
  },

  enabledModels() {
    var ret = []

    if (this.backendMode === 'ollama') {
      const endpointBase = atom.config.get(
        'assisted-writing.ollama.endpointBase'
      )
      const models = await ollamaModels(endpointBase, () => {})
      ret.push(...models)
    }

    return ret
  },

  // Ollamaモデル選択コマンドの登録
  setOllamaModelCommands(models) {
    this.ollamaCommands.dispose()
    this.ollamaCommands = new CompositeDisposable()

    if (atom.config.get('assisted-writing.ollama.enable')) {
      const commands = {}
      models.forEach((m) => {
        commands[`assisted-writing:ollama-${m}`] = () =>
          this.setBackend('ollama', m)
      })

      this.ollamaCommands.add(atom.commands.add('atom-text-editor', commands))
    }
  },
}
