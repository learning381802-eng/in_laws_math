import { visit } from 'unist-util-visit'

/**
 * Remark plugin to convert $...$ and $$...$$ to custom MDX components
 */
export function remarkMathInline() {
  return (tree: any) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value || typeof node.value !== 'string') return

      const value = node.value
      const hasDisplayMath = value.includes('$$')
      const hasInlineMath = value.includes('$') && !hasDisplayMath

      if (!hasDisplayMath && !hasInlineMath) return

      const nodes: any[] = []
      let lastIndex = 0
      let inDisplayMath = false
      let inInlineMath = false

      for (let i = 0; i < value.length; i++) {
        // Check for display math $$
        if (value.slice(i, i + 2) === '$$' && !inInlineMath) {
          // Push text before math
          if (i > lastIndex) {
            nodes.push({ type: 'text', value: value.slice(lastIndex, i) })
          }

          inDisplayMath = !inDisplayMath
          lastIndex = i + 2

          if (!inDisplayMath) {
            // End of display math
            const mathContent = value.slice(lastIndex - 2, i).replace(/^\$\$/, '').replace(/\$\$/, '')
            nodes.push({
              type: 'mdxJsxFlowElement',
              name: 'MathBlock',
              children: [{ type: 'text', value: mathContent }],
            })
            lastIndex = i + 2
          }
          continue
        }

        // Check for inline math $
        if (value[i] === '$' && !inDisplayMath && value[i + 1] !== '$') {
          // Push text before math
          if (i > lastIndex) {
            nodes.push({ type: 'text', value: value.slice(lastIndex, i) })
          }

          inInlineMath = !inInlineMath
          lastIndex = i + 1

          if (!inInlineMath) {
            // End of inline math
            const mathContent = value.slice(lastIndex - 1, i).replace(/^\$/, '').replace(/\$/, '')
            nodes.push({
              type: 'mdxJsxTextElement',
              name: 'Math',
              children: [{ type: 'text', value: mathContent }],
            })
            lastIndex = i + 1
          }
          continue
        }
      }

      // Push remaining text
      if (lastIndex < value.length) {
        nodes.push({ type: 'text', value: value.slice(lastIndex) })
      }

      if (nodes.length > 0) {
        parent.children.splice(index, 1, ...nodes)
      }
    })
  }
}
