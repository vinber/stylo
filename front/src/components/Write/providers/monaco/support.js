export function registerReadOnlyTheme (monaco) {
  monaco.editor.defineTheme('styloReadOnly', {
    base: 'vs',
    inherit: true,
    rules: [{ background: 'EDF9FA' }],
    colors: {
      'editor.foreground': '#000000',
      'editor.background': '#fafafa',
      'editor.lineHighlightBackground': '#fafafa',
      'editorLineNumber.foreground': '#7d7d7d',
      'editor.selectionHighlightBackground': '#fafafa',
      'editorLineNumber.activeForeground': '#7d7d7d',
    }
  })
}

export function registerBibliographyCompletion (monaco, bibTeXEntries) {
  function createBibliographyProposals (range) {
    return bibTeXEntries.map((entry) => ({
      label: entry.key,
      kind: monaco.languages.CompletionItemKind.Reference,
      documentation: entry.title,
      insertText: entry.key,
      range: range
    }))
  }

  return monaco.languages.registerCompletionItemProvider('markdown', {
    triggerCharacters: '@',
    provideCompletionItems: function (model, position) {
      // find out if we are completing a property in the 'dependencies' object.
      var textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })
      var match = textUntilPosition.match(
        /\[@/
      )
      if (!match) {
        return { suggestions: [] }
      }
      var word = model.getWordUntilPosition(position)
      var range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      return {
        suggestions: createBibliographyProposals(range)
      }
    }
  })
}

export function defineFlippedDiffTheme (monaco) {
  monaco.editor.defineTheme('flippedDiffTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'diffEditor.insertedTextBackground': '#ff000033',
      'diffEditor.removedTextBackground': '#28d22833'
    }
  })
  monaco.editor.setTheme('flippedDiffTheme')
}