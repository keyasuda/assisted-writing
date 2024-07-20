'use babel'

const path = require('path')

import AssistedWritingView from './assisted-writing-view'
import { CompositeDisposable } from 'atom'

export default {
  assistedWritingView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log('assisted-writing:activated')
    this.assistedWritingView = new AssistedWritingView(
      state.assistedWritingViewState
    )

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'assisted-writing:run': () => this.run(),
        'assisted-writing:abort': () => this.abort(),
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
          tokenCountWorker.postMessage(text)
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
    }
  },

  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({
      item: this.assistedWritingView.getTokenCountPanel(),
    })
  },

  async run() {
    var editor = atom.workspace.getActiveTextEditor()
    var cursorPosition = editor.getCursorBufferPosition()
    var text = this.textToCursor(editor, cursorPosition)

    this.abortController = new AbortController()

    const url = 'http://127.0.0.1:5000/v1/completions'
    // const url = 'http://127.0.0.1:8080/completions'
    const body = {
      prompt: text,
      max_tokens: 4096,
      stream: true,
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: this.abortController.signal,
    }

    try {
      const response = await fetch(url, options)
      // 実行中を示すクラス名を付与する
      atom.workspace.getElement().classList.add('assisted-writing-running')

      const reader = response.body?.getReader()
      if (!reader) return

      let decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue
        const lines = decoder.decode(value)
        const jsons = lines
          .split('data: ') // 各行は data: というキーワードで始まる
          .map((line) => line.trim())
          .filter((s) => s) // 余計な空行を取り除く
        for (const json of jsons) {
          try {
            if (json === '[DONE]') {
              return // 終端記号
            }
            try {
              const chunk = JSON.parse(json)
              const ret = chunk.choices
                ? chunk.choices[0].text // text-generation webui
                : chunk.content || '' // llama-server
              editor.insertText(ret, {
                autoIndent: false,
                autoIndentNewline: false,
                autoDecreaseIndent: false,
              })
            } catch (e) {
              console.log('unknown chunk', json, e)
            }
          } catch (error) {
            console.error(error)
          }
        }
      }

      // 実行終了なのでクラス名を外す
      atom.workspace.getElement().classList.remove('assisted-writing-running')
    } catch (error) {
      console.error(error)
    }
  },

  abort() {
    try {
      atom.workspace.getElement().classList.remove('assisted-writing-running')
      this.abortController.abort()
    } catch (e) {}
  },

  textToCursor(editor, cursorPosition) {
    return editor.getTextInRange([
      [0, 0],
      [cursorPosition.row, cursorPosition.column],
    ])
  },

  toggle() {
    console.log('AssistedWriting was toggled!')
    return this.modalPanel.isVisible()
      ? this.modalPanel.hide()
      : this.modalPanel.show()
  },
}
