import fs from 'node:fs'
import path from 'node:path'

const virtualModuleId = 'virtual:svg-icons-register'
const resolvedVirtualModuleId = `\0${virtualModuleId}`
const spriteDomId = '__svg__icons__dom__'

function normalizeSvgName(file) {
  return path.basename(file, path.extname(file))
}

function getSvgFiles(iconDirs) {
  return iconDirs.flatMap(iconDir => {
    if (!fs.existsSync(iconDir)) {
      return []
    }

    return fs.readdirSync(iconDir, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.svg'))
      .map(entry => path.join(iconDir, entry.name))
  })
}

function createSymbol(file, symbolId) {
  const source = fs.readFileSync(file, 'utf8')
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
  const svgMatch = source.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i)

  if (!svgMatch) {
    return ''
  }

  const attrs = svgMatch[1]
  const body = svgMatch[2]
  const viewBox = attrs.match(/\bviewBox=(["'])(.*?)\1/i)?.[2]
  const width = attrs.match(/\bwidth=(["'])(.*?)\1/i)?.[2]
  const height = attrs.match(/\bheight=(["'])(.*?)\1/i)?.[2]
  const fallbackViewBox = width && height ? `0 0 ${width} ${height}` : '0 0 1024 1024'
  const id = symbolId.replace('[name]', normalizeSvgName(file))

  return `<symbol id="${id}" viewBox="${viewBox || fallbackViewBox}">${body}</symbol>`
}

export function createSvgSprite({ iconDirs, symbolId = 'icon-[name]' }) {
  const symbols = getSvgFiles(iconDirs)
    .map(file => createSymbol(file, symbolId))
    .filter(Boolean)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${symbols}</svg>`
}

export function createSvgIconsPlugin(options) {
  return {
    name: 'local-svg-icons',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return null
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null
      }

      const sprite = createSvgSprite(options)

      return `
const sprite = ${JSON.stringify(sprite)}
if (typeof document !== 'undefined' && !document.getElementById('${spriteDomId}')) {
  const div = document.createElement('div')
  div.id = '${spriteDomId}'
  div.innerHTML = sprite
  document.body.insertBefore(div, document.body.firstChild)
}
`
    }
  }
}
