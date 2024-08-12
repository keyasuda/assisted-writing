'use babel'

export default class TokenCountView {
  constructor(serializedState) {
    // the tile to display token count on the status-bar
    this.tokenCountTile = document.createElement('div')
    this.tokenCountTile.classList.add('assisted-writing')
    this.tokenCountTile.classList.add('token-count')
    this.tokenCountTile.classList.add('inline-block')

    this.tokenCountTileContent = document.createElement('span')
    this.tokenCountTileContent.textContent = '-'
    this.tokenCountTile.appendChild(this.tokenCountTileContent)

    var label = document.createElement('span')
    label.textContent = ' tokens'
    this.tokenCountTile.appendChild(label)
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.tokenCountTile.remove()
  }

  getPanel() {
    return this.tokenCountTile
  }

  update(count) {
    this.tokenCountTileContent.textContent = count
  }
}
