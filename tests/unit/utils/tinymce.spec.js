import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTinymceInit, tinymceLicenseKey } from '@/utils/tinymce'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

describe('TinyMCE config', () => {
  it('uses GPL license key for TinyMCE self-hosted usage through the Vue wrapper prop', () => {
    expect(tinymceLicenseKey).toBe('gpl')
  })

  it('does not export a TinyMCE cloud API key', async () => {
    const tinymceConfig = await import('@/utils/tinymce')
    const removedCloudKeyExport = ['tinymce', 'Api', 'Key'].join('')

    expect(tinymceConfig).not.toHaveProperty(removedCloudKeyExport)
  })

  it('adds GPL license key to TinyMCE init for self-hosted usage', () => {
    expect(createTinymceInit()).toHaveProperty('license_key', 'gpl')
  })

  it('bundles TinyMCE locally instead of loading Tiny Cloud by default', () => {
    const editorEntry = path.join(projectRoot, 'src/utils/tinymce-editor.js')
    const editorSource = fs.existsSync(editorEntry) ? fs.readFileSync(editorEntry, 'utf8') : ''

    expect(fs.existsSync(editorEntry)).toBe(true)
    expect(editorSource).toContain("import Editor from '@tinymce/tinymce-vue'")
    expect(editorSource).toContain("import 'tinymce/tinymce'")
    expect(editorSource).toContain("import 'tinymce/models/dom/model'")
    expect(editorSource).toContain("import 'tinymce/themes/silver'")
    expect(editorSource).toContain("import 'tinymce/icons/default'")
    expect(editorSource).not.toContain('cdn.tiny.cloud')
  })
})
