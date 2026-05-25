import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

function readProjectFile(file) {
  return fs.readFileSync(path.join(projectRoot, file), 'utf8')
}

describe('Reference-inspired admin UI styles', () => {
  it('uses the glass commerce login shell from the visual reference', () => {
    const source = readProjectFile('src/views/login/index.vue')

    expect(source).toContain('login-shell')
    expect(source).toContain('login-brand-panel')
    expect(source).toContain('login-card')
    expect(source).toContain('login-product-preview')
    expect(source).toContain('preview-bag')
    expect(source).toContain('preview-card')
    expect(source).toContain('login-help')
    expect(source).toContain('电商管理后台')
    expect(source).toContain('--login-primary: #1677ff')
    expect(source).toContain('backdrop-filter: blur')
    expect(source).toContain('...loginForm.value')
    expect(source).not.toContain('login-background')
    expect(source).not.toContain('background-image')
    expect(source).not.toContain('radial-gradient')
  })

  it('defines the Apple design tokens globally', () => {
    const source = readProjectFile('src/styles/index.scss')

    expect(source).toContain('--admin-bg: #f5f5f7')
    expect(source).toContain('--admin-surface: #ffffff')
    expect(source).toContain('--admin-primary: #0066cc')
    expect(source).toContain('--admin-primary-focus: #0071e3')
    expect(source).toContain('--admin-ink: #1d1d1f')
    expect(source).toContain('--admin-radius-card: 18px')
    expect(source).not.toContain('--admin-accent')
  })

  it('uses the requested light sidebar tokens', () => {
    const source = readProjectFile('src/styles/variables.scss')

    expect(source).toContain('$menuBg:#ffffff')
    expect(source).toContain('$menuHover:#f5f5f7')
    expect(source).toContain('$menuActiveText:#0066cc')
    expect(source).toContain('$menuText:#5f6368')
    expect(source).toContain('$menuAccent:#0066cc')
  })
})
