import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const targetDirs = ['src/views', 'src/components', 'src/layout']

function toProjectPath(file) {
  return file.split(path.sep).join('/')
}

describe('Vue 3 SFC syntax migration', () => {
  it('uses script setup instead of Vue 2 style Options API in migrated UI directories', async() => {
    const files = await fg(targetDirs.map(dir => `${dir.replaceAll('\\', '/')}/**/*.vue`), {
      cwd: projectRoot,
      absolute: true
    })

    const legacyFiles = files.filter(file => {
      const source = fs.readFileSync(file, 'utf8')
      const hasScript = /<script\b/i.test(source)
      const hasScriptSetup = /<script\b[^>]*\bsetup\b/i.test(source)
      const hasOptionsExport = /export\s+default\s*\{/m.test(source)

      return hasOptionsExport || (hasScript && !hasScriptSetup)
    })

    expect(legacyFiles.map(file => toProjectPath(path.relative(projectRoot, file)))).toEqual([])
  })

  it('does not reuse setup binding names as template refs', async() => {
    const files = await fg(targetDirs.map(dir => `${dir.replaceAll('\\', '/')}/**/*.vue`), {
      cwd: projectRoot,
      absolute: true
    })

    const conflicts = files.flatMap(file => {
      const source = fs.readFileSync(file, 'utf8')
      const script = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/i)?.[1] || ''
      const templateRefs = [...source.matchAll(/\sref="([^"]+)"/g)].map(match => match[1])

      return templateRefs
        .filter(refName => {
          const escapedName = refName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const templateRefDeclaration = new RegExp(
            `\\bconst\\s+${escapedName}\\s*=\\s*(?:ref|shallowRef|useTemplateRef)\\s*\\(`
          )

          if (templateRefDeclaration.test(script)) {
            return false
          }

          return [
            new RegExp(`\\bconst\\s+${escapedName}\\b`),
            new RegExp(`\\blet\\s+${escapedName}\\b`),
            new RegExp(`\\bfunction\\s+${escapedName}\\b`)
          ].some(pattern => pattern.test(script))
        })
        .map(refName => `${toProjectPath(path.relative(projectRoot, file))}: ref="${refName}"`)
    })

    expect(conflicts).toEqual([])
  })

  it('does not cache instance proxy refs during setup', async() => {
    const files = await fg(targetDirs.map(dir => `${dir.replaceAll('\\', '/')}/**/*.vue`), {
      cwd: projectRoot,
      absolute: true
    })

    const cachedRefs = files
      .filter(file => fs.readFileSync(file, 'utf8').includes('const templateRefs = instance.proxy.$refs'))
      .map(file => toProjectPath(path.relative(projectRoot, file)))

    expect(cachedRefs).toEqual([])
  })

  it('does not shadow list total refs with response total fields', async() => {
    const files = await fg('src/views/**/*.vue', {
      cwd: projectRoot,
      absolute: true
    })

    const shadowedTotals = files
      .filter(file => {
        const source = fs.readFileSync(file, 'utf8')

        return /\bconst\s+total\s*=\s*ref\s*\(/.test(source) && /\btotal\.value\s*=\s*total\b/.test(source)
      })
      .map(file => toProjectPath(path.relative(projectRoot, file)))

    expect(shadowedTotals).toEqual([])
  })

  it('does not assign setup refs from same-named local response variables', async() => {
    const files = await fg('src/views/**/*.vue', {
      cwd: projectRoot,
      absolute: true
    })

    const shadowedRefs = files.flatMap(file => {
      const source = fs.readFileSync(file, 'utf8')
      const script = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/i)?.[1] || ''
      const refNames = [...script.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*ref\s*\(/g)]
        .map(match => match[1])

      return refNames
        .filter(name => {
          const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return new RegExp(`\\b${escapedName}\\.value\\s*=\\s*${escapedName}\\b`).test(script)
        })
        .map(name => `${toProjectPath(path.relative(projectRoot, file))}: ${name}.value = ${name}`)
    })

    expect(shadowedRefs).toEqual([])
  })

  it('does not pass Vue 2 this context into form response helpers', async() => {
    const files = await fg('src/views/**/*.vue', {
      cwd: projectRoot,
      absolute: true
    })

    const legacySubmitHandlers = files
      .filter(file => {
        const source = fs.readFileSync(file, 'utf8')

        return /(?:saveHandle|updateHandle)\s*\(\s*response\s*,\s*this\s*\)/.test(source)
      })
      .map(file => toProjectPath(path.relative(projectRoot, file)))

    expect(legacySubmitHandlers).toEqual([])
  })
})
