'use babel'

import EditorManager from '../lib/editor-manager'

describe('EditorManager', () => {
  let editorManager, mockEditor, mockElement, mockSignalProvider
  
  beforeEach(() => {
    // Mock signal provider
    mockSignalProvider = {
      add: jasmine.createSpy('add'),
      clear: jasmine.createSpy('clear')
    }
    
    // Create editor manager with mock signal provider
    editorManager = new EditorManager(mockSignalProvider)
    
    // Mock editor element
    mockElement = {
      classList: {
        add: jasmine.createSpy('add'),
        remove: jasmine.createSpy('remove'),
        contains: jasmine.createSpy('contains').and.returnValue(false)
      }
    }
    
    // Mock editor
    mockEditor = {
      getElement: () => mockElement,
      getTextInRange: jasmine.createSpy('getTextInRange').and.returnValue('Sample text'),
      getCursorBufferPosition: jasmine.createSpy('getCursorBufferPosition').and.returnValue({row: 1, column: 5})
    }
    
    // Mock workspace element
    spyOn(atom.workspace, 'getElement').and.returnValue({
      classList: {
        add: jasmine.createSpy('add'),
        remove: jasmine.createSpy('remove'),
        contains: jasmine.createSpy('contains').and.returnValue(false)
      }
    })
    
    // Mock getActiveTextEditor
    spyOn(atom.workspace, 'getActiveTextEditor').and.returnValue(mockEditor)
  })
  
  describe('textToCursor()', () => {
    it('extracts text from beginning to cursor position', () => {
      const cursorPosition = {row: 2, column: 10}
      editorManager.textToCursor(mockEditor, cursorPosition)
      
      expect(mockEditor.getTextInRange).toHaveBeenCalledWith([
        [0, 0],
        [2, 10]
      ])
    })
  })
  
  describe('setRunningStatus()', () => {
    it('adds running class to editor and workspace elements', () => {
      editorManager.setRunningStatus(mockEditor)
      
      expect(mockElement.classList.add).toHaveBeenCalledWith('assisted-writing-running')
      expect(atom.workspace.getElement().classList.add).toHaveBeenCalledWith('assisted-writing-running')
      expect(mockSignalProvider.add).toHaveBeenCalledWith('Assisted Writing: running')
    })
  })
  
  describe('cancelRunningStatus()', () => {
    it('removes running class from editor and workspace elements', () => {
      editorManager.cancelRunningStatus(mockEditor)
      
      expect(mockElement.classList.remove).toHaveBeenCalledWith('assisted-writing-running')
      expect(atom.workspace.getElement().classList.remove).toHaveBeenCalledWith('assisted-writing-running')
      expect(mockSignalProvider.clear).toHaveBeenCalled()
    })
  })
  
  describe('isRunning()', () => {
    it('checks if the workspace has the running class', () => {
      editorManager.isRunning()
      expect(atom.workspace.getElement().classList.contains).toHaveBeenCalledWith('assisted-writing-running')
    })
    
    it('returns true when running', () => {
      atom.workspace.getElement().classList.contains.and.returnValue(true)
      expect(editorManager.isRunning()).toBe(true)
    })
    
    it('returns false when not running', () => {
      atom.workspace.getElement().classList.contains.and.returnValue(false)
      expect(editorManager.isRunning()).toBe(false)
    })
  })
  
  describe('getActiveEditor()', () => {
    it('returns the active text editor', () => {
      const editor = editorManager.getActiveEditor()
      expect(editor).toBe(mockEditor)
      expect(atom.workspace.getActiveTextEditor).toHaveBeenCalled()
    })
  })
  
  describe('getCurrentCursorPosition()', () => {
    it('returns the cursor position from the active editor', () => {
      const position = editorManager.getCurrentCursorPosition()
      expect(position).toEqual({row: 1, column: 5})
      expect(mockEditor.getCursorBufferPosition).toHaveBeenCalled()
    })
    
    it('returns null if no active editor', () => {
      atom.workspace.getActiveTextEditor.and.returnValue(null)
      const position = editorManager.getCurrentCursorPosition()
      expect(position).toBeNull()
    })
  })
})