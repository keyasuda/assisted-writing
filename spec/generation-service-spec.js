'use babel'

import GenerationService from '../lib/generation-service'

describe('GenerationService', () => {
  let service

  beforeEach(() => {
    service = new GenerationService('gemini')
  })

  describe('containsBlockedWord', () => {
    it('should return true if the text contains a blocked word', () => {
      atom.config.set('assisted-writing.gemini.blockedWords', 'test blocked')
      expect(service.containsBlockedWord('This is a test.')).toBe(true)
    })

    it('should return false if the text does not contain a blocked word', () => {
      atom.config.set('assisted-writing.gemini.blockedWords', 'test1 blocked')
      expect(service.containsBlockedWord('This is not a test.')).toBe(false)
    })

    it('should handle multiple blocked words', () => {
      atom.config.set(
        'assisted-writing.gemini.blockedWords',
        'test blocked words'
      )
      expect(
        service.containsBlockedWord('This is a test with blocked words.')
      ).toBe(true)
    })

    it('wont block when the list is blank', () => {
      atom.config.set('assisted-writing.gemini.blockedWords', '')
      expect(service.containsBlockedWord('This is not a test.')).toBe(false)
    })
  })
})
