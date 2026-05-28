import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSvgSprite } from '../../../vite/plugins/svg-icons.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

describe('local svg icons plugin', () => {
  it('generates sprite symbols compatible with SvgIcon references', () => {
    const sprite = createSvgSprite({
      iconDirs: [path.join(projectRoot, 'src/icons/svg')],
      symbolId: 'icon-[name]'
    })

    expect(sprite).toContain('<svg')
    expect(sprite).toContain('id="icon-dashboard"')
    expect(sprite).toContain('<symbol')
    expect(sprite).not.toContain('<script')
  })
})
