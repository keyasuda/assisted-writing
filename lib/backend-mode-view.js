'use babel'

export default class BackendModeView {
  constructor(serializedState) {
    // backendModeTileを追加
    this.backendModeTile = document.createElement('div')
    this.backendModeTile.classList.add('assisted-writing')
    this.backendModeTile.classList.add('backend-mode')
    this.backendModeTile.classList.add('inline-block')

    var modeIcon = document.createElement('span')
    modeIcon.classList.add('icon')
    modeIcon.classList.add('icon-file-text')
    this.backendModeTile.appendChild(modeIcon)

    this.backendModeTileContent = document.createElement('span')
    this.backendModeTileContent.textContent = ''
    this.backendModeTile.appendChild(this.backendModeTileContent)
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.backendModeTile.remove()
  }

  getPanel() {
    return this.backendModeTile
  }

  update(mode) {
    switch (mode) {
      case 'local':
        this.backendModeTileContent.textContent = 'Local LLM'
        break
      case 'gemini':
        this.backendModeTileContent.textContent = 'Google AI Studio Gemini API'
        break
      default:
        // その他のモードの場合、デフォルトの値を設定する（必要に応じて変更）
        this.backendModeTileContent.textContent = 'Unknown'
    }
  }
}