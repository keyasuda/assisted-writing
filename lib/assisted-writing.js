'use babel'

const path = require('path')

import AssistedWritingView from './assisted-writing-view'
import { CompositeDisposable } from 'atom'
import { localCompletion, localAbort } from './api-client'
import { geminiApi, geminiApiAbort } from './gemini-api'
import { config } from './config'

const runningClass = 'assisted-writing-running'

export default {
  assistedWritingView: null,
  modalPanel: null,
  subscriptions: null,
  config: config,
  backendMode: 'local', // 追加

  activate(state) {
    console.log('assisted-writing:activated')
    this.assistedWritingView = new AssistedWritingView(
      state.assistedWritingViewState
    )

    // backendMode を state から読み込み、存在しない場合は初期値を 'local' に設定
    this.backendMode =
      (state.assistedWritingState && state.assistedWritingState.backendMode) ||
      'local'
    this.assistedWritingView.updateBackendModePanel(this.backendMode)
    // パネルクリックでbackendModeをトグルさせる
    this.assistedWritingView
      .getBackendModePanel()
      .addEventListener('click', (e) => {
        if (this.backendMode == 'local') {
          this.setBackend('gemini')
        } else {
          this.setBackend('local')
        }
      })

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

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

    // init token count worker
    var tokenCountWorker = new Worker(
      path.resolve(__dirname, 'token-count-worker.js')
    )
    tokenCountWorker.addEventListener('message', (e) => {
      this.assistedWritingView.updateTokenCountPanel(e.data)
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
    this.modalPanel.destroy()
    this.subscriptions.dispose()
    this.assistedWritingView.destroy()
  },

  serialize() {
    return {
      assistedWritingViewState: this.assistedWritingView.serialize(),
      assistedWritingState: { backendMode: this.backendMode }, // backendMode を state に追加
    }
  },

  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({
      item: this.assistedWritingView.getTokenCountPanel(),
    })

    statusBar.addRightTile({
      item: this.assistedWritingView.getBackendModePanel(),
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

    if (this.backendMode === 'local') {
      // use local API
      const url = atom.config.get('assisted-writing.local.endpoint')
      const params = {
        ...JSON.parse(atom.config.get('assisted-writing.local.params')),
        ...{ prompt: text },
      }
      await localCompletion(
        params,
        url,
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
          } else {
            console.log(error)
          }
        }
      )
    } else {
      // use Gemini API
      const apiKey = atom.config.get('assisted-writing.gemini.apiKey')
      const modelName = atom.config.get('assisted-writing.gemini.modelName')
      if (apiKey == '') {
        atom.notifications.addError('set API key')
        return false
      }

      await geminiApi(
        text,
        apiKey,
        modelName,
        JSON.parse(atom.config.get('assisted-writing.gemini.params')),
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
          } else {
            console.log(error)
          }
        }
      )
    }

    this.cancelRunningStatus(editor)
  },

  abort() {
    try {
      var editor = atom.workspace.getActiveTextEditor()
      this.cancelRunningStatus(editor)
      if (this.backendMode === 'local') {
        localAbort()
      } else {
        geminiApiAbort()
      }
    } catch (e) {}
  },

  setBackend(mode) {
    this.backendMode = mode
    this.assistedWritingView.updateBackendModePanel(mode)
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
}
