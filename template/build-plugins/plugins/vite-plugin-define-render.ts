import { parse as babelParse } from '@babel/parser'
import MagicString from 'magic-string'
import type * as t from '@babel/types'

function isCallOf(
  node: t.Node,
  name: string,
): node is t.CallExpression & { callee: t.Identifier } {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === name
  )
}

function isFunctionType(node: t.Node): boolean {
  return (
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'ObjectMethod'
  )
}

interface ASTWalkHandlers {
  enter?: (node: t.Node, parent: t.Node | null) => void
}

function walkAST(
  node: t.Node,
  handlers: ASTWalkHandlers,
  parent: t.Node | null = null,
): void {
  handlers.enter?.(node, parent)
  for (const key of Object.keys(node)) {
    const val = (node as any)[key]
    if (!val || typeof val !== 'object') continue
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object' && item.type) {
          walkAST(item, handlers, node)
        }
      }
    } else if (val.type) {
      walkAST(val, handlers, node)
    }
  }
}

interface NodePos {
  start?: number | null
  end?: number | null
}

function removeNode(s: MagicString, node: NodePos): void {
  if (node.start != null && node.end != null) {
    s.remove(node.start, node.end)
  }
}

function moveNode(s: MagicString, node: NodePos, index: number): void {
  if (node.start != null && node.end != null) {
    s.move(node.start, node.end, index)
  }
}

function generateTransform(
  s: MagicString | undefined,
  id: string,
): { code: string; map: any } | undefined {
  if (s?.hasChanged()) {
    return {
      code: s.toString(),
      get map() {
        return s.generateMap({
          source: id,
          includeContent: true,
          hires: 'boundary',
        })
      },
    }
  }
}

const DEFINE_RENDER = 'defineRender'

function transformDefineRender(code: string, id: string) {
  if (!code.includes(DEFINE_RENDER)) return

  const program = babelParse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  const nodes: {
    parent: t.BlockStatement
    node: t.ExpressionStatement
    arg: t.Node
  }[] = []

  walkAST(program, {
    enter(node, parent) {
      if (
        node.type !== 'ExpressionStatement' ||
        !isCallOf(node.expression, DEFINE_RENDER) ||
        parent?.type !== 'BlockStatement'
      )
        return

      nodes.push({
        parent: parent as t.BlockStatement,
        node,
        arg: node.expression.arguments[0],
      })
    },
  })

  if (nodes.length === 0) return

  const s = new MagicString(code)

  for (const { parent, node, arg } of nodes) {
    const returnStmt = parent.body.find(
      (n: t.Statement) => n.type === 'ReturnStatement',
    ) as t.ReturnStatement | undefined
    if (returnStmt) removeNode(s, returnStmt)

    const index = returnStmt ? returnStmt.start! : parent.end! - 1
    const shouldWrap =
      !isFunctionType(arg) && arg.type !== 'Identifier'

    s.appendLeft(index, `return ${shouldWrap ? '() => (' : ''}`)
    moveNode(s, arg, index)
    if (shouldWrap) s.appendRight(index, `)`)

    s.remove(node.start!, arg.start!)
    s.remove(arg.end!, node.end!)
  }

  return generateTransform(s, id)
}

const VUE_SFC_RE = /\.vue$/
const VUE_VIRTUAL_RE = /\.(vue|setup\.[cm]?[jt]sx?)\?vue/

export default function defineRenderPlugin() {
  return {
    name: 'vite-plugin-define-render',
    enforce: 'post' as const,

    transform(code: string, id: string) {
      if (!VUE_SFC_RE.test(id) && !VUE_VIRTUAL_RE.test(id)) return
      return transformDefineRender(code, id)
    },
  }
}
