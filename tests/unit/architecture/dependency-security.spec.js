import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

function readProjectFile(file) {
  return fs.readFileSync(path.join(projectRoot, file), 'utf8')
}

describe('Dependency security posture', () => {
  it('does not use the vulnerable svg-baker based Vite icon plugin', () => {
    const packageJson = readProjectFile('package.json')
    const packageLockPath = path.join(projectRoot, 'package-lock.json')
    const packageLock = fs.existsSync(packageLockPath) ? fs.readFileSync(packageLockPath, 'utf8') : ''
    const viteConfig = readProjectFile('vite.config.js')

    expect(packageJson).not.toContain('vite-plugin-svg-icons')
    expect(packageLock).not.toContain('vite-plugin-svg-icons')
    expect(packageLock).not.toContain('svg-baker')
    expect(viteConfig).not.toContain('vite-plugin-svg-icons')
  })
})
