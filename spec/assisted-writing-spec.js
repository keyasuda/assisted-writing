'use babel'

import AssistedWriting from '../lib/assisted-writing'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AssistedWriting', () => {
  let workspaceElement, activationPromise

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('assisted-writing')
  })

  describe('enabledBackends()', () => {
    it('returns an array of enabled backends', () => {
      // local APIが有効、Gemini APIが無効の場合
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', false)
      expect(AssistedWriting.enabledBackends()).toEqual(['local'])

      // local APIが無効、Gemini APIが有効の場合
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', true)
      expect(AssistedWriting.enabledBackends()).toEqual(['gemini'])

      // local APIとGemini APIが両方有効の場合
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', true)
      expect(AssistedWriting.enabledBackends()).toEqual(['local', 'gemini'])

      // local APIとGemini APIが両方無効の場合
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', false)
      expect(AssistedWriting.enabledBackends()).toEqual([])
    })
  })

  describe('flipBackend()', () => {
    it('returns current backend if no backend is enabled', () => {
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', false)
      expect(AssistedWriting.flipBackend('local')).toEqual('local')
    })

    it('returns the only enabled backend if only one backend is enabled', () => {
      // local API only enabled
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', false)
      expect(AssistedWriting.flipBackend('gemini')).toEqual('local')

      // gemini API only enabled
      atom.config.set('assisted-writing.local.enable', false)
      atom.config.set('assisted-writing.gemini.enable', true)
      expect(AssistedWriting.flipBackend('local')).toEqual('gemini')
    })

    it('returns the other enabled backend if two backends are enabled', () => {
      atom.config.set('assisted-writing.local.enable', true)
      atom.config.set('assisted-writing.gemini.enable', true)
      expect(AssistedWriting.flipBackend('local')).toEqual('gemini')
      expect(AssistedWriting.flipBackend('gemini')).toEqual('local')
    })
  })
})
