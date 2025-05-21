'use babel'

const runningClass = 'assisted-writing-running'

export default class EditorManager {
  constructor(signalProvider) {
    this.signalProvider = signalProvider
  }
  
  // Extract text from the beginning of the document to the cursor position
  textToCursor(editor, cursorPosition) {
    return editor.getTextInRange([
      [0, 0],
      [cursorPosition.row, cursorPosition.column],
    ])
  }
  
  // Set the running status on the editor and workspace
  setRunningStatus(editor) {
    editor.getElement().classList.add(runningClass)
    atom.workspace.getElement().classList.add(runningClass)
    if (this.signalProvider) {
      this.signalProvider.add('Assisted Writing: running')
    }
  }
  
  // Clear the running status from the editor and workspace
  cancelRunningStatus(editor) {
    editor.getElement().classList.remove(runningClass)
    atom.workspace.getElement().classList.remove(runningClass)
    if (this.signalProvider) {
      this.signalProvider.clear()
    }
  }
  
  // Check if the editor is currently in running status
  isRunning() {
    return atom.workspace.getElement().classList.contains(runningClass)
  }
  
  // Get the active text editor
  getActiveEditor() {
    return atom.workspace.getActiveTextEditor()
  }
  
  // Get the current cursor position in the active editor
  getCurrentCursorPosition() {
    const editor = this.getActiveEditor()
    return editor ? editor.getCursorBufferPosition() : null
  }
}