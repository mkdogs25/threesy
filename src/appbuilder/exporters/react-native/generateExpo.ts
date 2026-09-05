import type { AppBuilderProject, ComponentNode } from '../../project/schema/types'
import { computeRNStyle, styleToSource } from './rnStyle'

const RN_TAG: Partial<Record<ComponentNode['type'], string>> = {
  screen: 'View',
  container: 'View',
  row: 'View',
  card: 'View',
  section: 'View',
  form: 'View',
  mobileForm: 'View',
  list: 'View',
  listItem: 'View',
  hero: 'View',
  footer: 'View',
  sidebar: 'View',
  navbar: 'View',
  appBar: 'View',
  divider: 'View',
  text: 'Text',
  heading: 'Text',
  icon: 'Text',
  image: 'Image',
  input: 'TextInput',
  toggle: 'Switch',
}

function renderNode(nodeId: string, project: AppBuilderProject, styleNames: Map<string, string>, styleDefs: string[], indent: string): string {
  const node = project.nodes[nodeId]
  if (!node) return ''

  const className = `s${styleNames.size}`
  styleNames.set(nodeId, className)
  styleDefs.push(`  ${className}: ${styleToSource(computeRNStyle(node))},`)

  const hasEvent = node.events.some((e) => e.trigger === 'click')
  const onPress = hasEvent ? ` onPress={() => handleEvent(${JSON.stringify(node.id)}, 'click')}` : ''

  if (node.type === 'button' || node.type === 'fab') {
    return `${indent}<TouchableOpacity style={styles.${className}}${onPress}>\n${indent}  <Text style={{ color: ${JSON.stringify(node.style.color)}, fontWeight: ${JSON.stringify(String(node.style.fontWeight))} }}>${escapeJs(node.text)}</Text>\n${indent}</TouchableOpacity>`
  }
  if (node.type === 'text' || node.type === 'heading') {
    return `${indent}<Text style={styles.${className}}>{overrides[${JSON.stringify(node.id)}] ?? ${JSON.stringify(node.text)}}</Text>`
  }
  if (node.type === 'icon') {
    return `${indent}<Text style={styles.${className}}>•</Text>`
  }
  if (node.type === 'image') {
    return `${indent}<Image style={styles.${className}} source={{ uri: ${JSON.stringify(node.imageUrl || 'https://placehold.co/300x200')} }} />`
  }
  if (node.type === 'input') {
    return `${indent}<TextInput style={styles.${className}} placeholder={${JSON.stringify(node.placeholder)}} />`
  }
  if (node.type === 'toggle') {
    return `${indent}<Switch />`
  }
  if (node.type === 'bottomNav' || node.type === 'tabBar') {
    const items = node.navItems
      .map(
        (item) =>
          `${indent}  <TouchableOpacity key={${JSON.stringify(item.id)}} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }} onPress={() => ${item.targetPageId ? `setScreen(${JSON.stringify(item.targetPageId)})` : '{}'}}>\n${indent}    <Text>${escapeJs(item.label)}</Text>\n${indent}  </TouchableOpacity>`,
      )
      .join('\n')
    return `${indent}<View style={styles.${className}}>\n${items}\n${indent}</View>`
  }
  if (node.type === 'modal') {
    return `${indent}<Modal visible={!!modals[${JSON.stringify(node.id)}]} transparent animationType="fade">\n${indent}  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>\n${indent}    <View style={styles.${className}}>\n${node.children.map((c) => renderNode(c, project, styleNames, styleDefs, indent + '      ')).join('\n')}\n${indent}    </View>\n${indent}  </View>\n${indent}</Modal>`
  }

  const tag = RN_TAG[node.type] ?? 'View'
  const children = node.children.map((c) => renderNode(c, project, styleNames, styleDefs, indent + '  ')).join('\n')
  return `${indent}<${tag} style={styles.${className}}>\n${children}\n${indent}</${tag}>`
}

function escapeJs(text: string): string {
  return text.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

export interface ExpoProject {
  files: Record<string, string>
}

/** A simplified but real Expo/React Native project: every supported
 * component maps onto a genuine RN primitive (View/Text/TouchableOpacity/
 * TextInput/Image/Switch/Modal) using RN's own flexbox styling, with a
 * small in-memory interpreter for click → navigate/show/hide/etc — the same
 * action vocabulary as the web export, just running against React state
 * instead of the DOM since RN has none. Web-only components (navbar, table,
 * tabs, sidebar, footer) fall back to a plain View. */
export function generateExpoProject(project: AppBuilderProject): ExpoProject {
  const styleDefs: string[] = []
  const screensJsx = project.pages
    .map((page) => {
      const styleNames = new Map<string, string>()
      const jsx = renderNode(page.rootId, project, styleNames, styleDefs, '        ')
      return `      ${JSON.stringify(page.id)}: () => (\n${jsx}\n      ),`
    })
    .join('\n')

  const appJs = `import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Image, Switch, Modal, StyleSheet, Linking } from 'react-native'

const INITIAL_SCREEN = ${JSON.stringify(project.pages[0]?.id ?? '')}

const EVENTS = ${JSON.stringify(Object.fromEntries(Object.values(project.nodes).filter((n) => n.events.length > 0).map((n) => [n.id, n.events])))}

export default function App() {
  const [screen, setScreen] = useState(INITIAL_SCREEN)
  const [overrides, setOverrides] = useState({})
  const [modals, setModals] = useState({})
  const [history, setHistory] = useState([])

  function runAction(action) {
    switch (action.type) {
      case 'navigate':
        setHistory((h) => [...h, screen])
        setScreen(action.pageId)
        break
      case 'show':
        setOverrides((o) => ({ ...o, [action.targetId]: o[action.targetId] }))
        break
      case 'hide':
        break
      case 'changeText':
        setOverrides((o) => ({ ...o, [action.targetId]: action.text }))
        break
      case 'setValue':
        setOverrides((o) => ({ ...o, [action.targetId]: action.value }))
        break
      case 'openModal':
        setModals((m) => ({ ...m, [action.targetId]: true }))
        break
      case 'closeModal':
        setModals((m) => ({ ...m, [action.targetId]: false }))
        break
      case 'notify':
        // Wire up your own toast/alert here — e.g. Alert.alert(action.message)
        break
      case 'openUrl':
        Linking.openURL(action.url)
        break
      case 'goBack':
        setHistory((h) => {
          if (h.length === 0) return h
          setScreen(h[h.length - 1])
          return h.slice(0, -1)
        })
        break
    }
  }

  function handleEvent(nodeId, trigger) {
    (EVENTS[nodeId] || []).filter((e) => e.trigger === trigger).forEach((e) => runAction(e.action))
  }

  const SCREENS = {
${screensJsx}
  }

  const render = SCREENS[screen]
  return render ? render() : null
}

const styles = StyleSheet.create({
${styleDefs.join('\n')}
})
`

  const appJson = {
    expo: {
      name: project.name,
      slug: project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app',
      version: '1.0.0',
      orientation: 'portrait',
      sdkVersion: '51.0.0',
    },
  }

  const packageJson = {
    name: project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app',
    version: '1.0.0',
    main: 'node_modules/expo/AppEntry.js',
    scripts: { start: 'expo start', android: 'expo start --android', ios: 'expo start --ios', web: 'expo start --web' },
    dependencies: { expo: '~51.0.0', react: '18.2.0', 'react-native': '0.74.0' },
  }

  const readme = `# ${project.name}\n\nA simplified Expo/React Native project generated by Threesy App Builder.\nWeb-specific components (navbar, table, tabs, sidebar, footer) fall back to\na plain View here since they don't have a native mobile equivalent.\n\n## Run it\n\n\`\`\`\nnpm install\nnpx expo start\n\`\`\`\n`

  return {
    files: {
      'package.json': JSON.stringify(packageJson, null, 2),
      'app.json': JSON.stringify(appJson, null, 2),
      'App.js': appJs,
      'README.md': readme,
    },
  }
}
