import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

describe('Element Plus global styles', () => {
  it('centers dialogs in the overlay by default', () => {
    const source = fs.readFileSync(path.join(projectRoot, 'src/styles/element-plus.scss'), 'utf8')

    expect(source).toMatch(/\.el-overlay-dialog\s*\{[\s\S]*display:\s*flex/)
    expect(source).toMatch(/\.el-overlay-dialog\s*\{[\s\S]*align-items:\s*center/)
    expect(source).toMatch(/\.el-overlay-dialog\s*\{[\s\S]*justify-content:\s*center/)
    expect(source).toMatch(/\.el-overlay-dialog\s+\.el-dialog\s*\{[\s\S]*margin:\s*auto/)
  })
})
