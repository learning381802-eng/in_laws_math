'use client'

import { useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathProps {
  children: string
  displayMode?: boolean
}

export function Math({ children, displayMode = false }: MathProps) {
  useEffect(() => {
    // Re-render KaTeX after mount
    const elements = document.querySelectorAll('.math-expression')
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const math = el.getAttribute('data-math')
        if (math) {
          try {
            katex.render(math, el, {
              displayMode: el.hasAttribute('data-display-mode'),
              throwOnError: false,
            })
          } catch (e) {
            console.error('KaTeX render error:', e)
          }
        }
      }
    })
  }, [children])

  return (
    <span
      className="math-expression inline"
      data-math={children}
      data-display-mode={displayMode ? 'true' : undefined}
    />
  )
}

export function MathBlock({ children }: { children: string }) {
  useEffect(() => {
    const elements = document.querySelectorAll('.math-block')
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const math = el.getAttribute('data-math')
        if (math) {
          try {
            katex.render(math, el, {
              displayMode: true,
              throwOnError: false,
            })
          } catch (e) {
            console.error('KaTeX render error:', e)
          }
        }
      }
    })
  }, [children])

  return (
    <div
      className="math-block my-4 overflow-x-auto"
      data-math={children}
    />
  )
}
