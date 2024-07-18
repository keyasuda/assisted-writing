'use babel';

const path = require('path');

import AssistedWritingView from './assisted-writing-view';
import { CompositeDisposable } from 'atom';

export default {

  assistedWritingView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log('assisted-writing:activated')
    this.assistedWritingView = new AssistedWritingView(state.assistedWritingViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'assisted-writing:run': () => this.run()
    }));

    // init token count worker
    var tokenCountWorker = new Worker(path.resolve(__dirname, 'token-count-worker.js'))
    tokenCountWorker.addEventListener('message', e => {
      this.assistedWritingView.updateTokenCountPanel(e.data);
    });

    // cursor observer
    atom.workspace.observeTextEditors(editor => {
      editor.observeCursors(cursor => {
        cursor.onDidChangePosition(event => {
          var cursor = event.cursor;
          var editor = cursor.editor;
          var text = this.textToCursor(editor, event.newBufferPosition);
          // put current text to count worker
          tokenCountWorker.postMessage(text);
        })
      })
    })
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.assistedWritingView.destroy();
  },

  serialize() {
    return {
      assistedWritingViewState: this.assistedWritingView.serialize()
    };
  },

  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({item: this.assistedWritingView.getTokenCountPanel()});
  },

  run(){
    var editor = atom.workspace.getActiveTextEditor();
    var cursorPosition = editor.getCursorBufferPosition();
    var text = this.textToCursor(editor, cursorPosition);
    console.log(text);
  },

  textToCursor(editor, cursorPosition){
    return editor.getTextInRange([[0, 0], [cursorPosition.row, cursorPosition.column]]);
  },

  toggle() {
    console.log('AssistedWriting was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
