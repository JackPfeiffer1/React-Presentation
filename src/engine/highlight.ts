import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export type TokenClass = 'kw' | 'tag' | 'attr' | 'str' | 'props' | 'fn' | 'num' | 'punc' | 'comment' | 'plain'
export type Lang = 'jsx' | 'html'

let highlighter: HighlighterCore | null = null

export async function initHighlighter() {
  if (highlighter) return
  highlighter = await createHighlighterCore({
    themes: [import('shiki/themes/github-dark.mjs')],
    langs: [import('shiki/langs/jsx.mjs'), import('shiki/langs/html.mjs')],
    engine: createJavaScriptRegexEngine(),
  })
}

function classify(scopes: string[]): TokenClass {
  for (let i = scopes.length - 1; i >= 0; i--) {
    const s = scopes[i]
    if (s.startsWith('comment') || s.startsWith('punctuation.definition.comment')) return 'comment'
    if (s.startsWith('punctuation.definition.string') || s.startsWith('string.')) return 'str'
    if (s.startsWith('storage.type.function.arrow')) return 'punc'
    if (s.startsWith('storage.type') || s.startsWith('keyword.control') || s.startsWith('storage.modifier')) return 'kw'
    if (s.startsWith('support.class.component')) return 'tag'
    if (s.startsWith('entity.name.tag')) return 'tag'
    if (s.startsWith('entity.other.attribute-name')) return 'attr'
    if (s.startsWith('variable.parameter') || s.startsWith('variable.other.object') || s.startsWith('variable.other.property')) return 'props'
    if (s.startsWith('entity.name.function')) return 'fn'
    if (s.startsWith('constant.numeric')) return 'num'
    if (s.startsWith('punctuation') || s.startsWith('keyword.operator') || s.startsWith('meta.brace')) return 'punc'
  }
  return 'plain'
}

/** One class per character of `code` (newlines included, classed as plain). */
export function classifyChars(code: string, lang: Lang): TokenClass[] {
  const out: TokenClass[] = new Array(code.length).fill('plain')
  if (!highlighter || code.length === 0) return out
  try {
    const result = highlighter.codeToTokens(code, { lang, theme: 'github-dark', includeExplanation: true })
    let lineStart = 0
    const lines = code.split('\n')
    result.tokens.forEach((line, li) => {
      let col = 0
      for (const token of line) {
        for (const part of token.explanation ?? [{ content: token.content, scopes: [] }]) {
          const cls = classify(part.scopes.map((sc) => sc.scopeName))
          for (let k = 0; k < part.content.length; k++) out[lineStart + col + k] = cls
          col += part.content.length
        }
      }
      lineStart += (lines[li]?.length ?? 0) + 1
    })
  } catch {
    // Fall back to plain text.
  }
  return out
}
