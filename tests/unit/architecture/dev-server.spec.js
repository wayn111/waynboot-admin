import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

function readProjectFile(file) {
  return fs.readFileSync(path.join(projectRoot, file), 'utf8')
}

describe('development server configuration', () => {
  it('uses the stable local admin port for dev startup', () => {
    const packageJson = JSON.parse(readProjectFile('package.json'))
    const viteConfig = readProjectFile('vite.config.js')

    expect(packageJson.scripts.dev).toContain('--port 9530')
    expect(viteConfig).toContain('process.env.npm_config_port || 9530')
  })
})
