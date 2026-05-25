import { AppMain, Navbar, Sidebar } from '@/layout/components'

function isRenderableComponent(component) {
  return Boolean(component && (component.render || component.template || component.setup))
}

describe('layout component exports', () => {
  it('exports renderable Vue components for layout children', () => {
    expect(isRenderableComponent(Navbar)).toBe(true)
    expect(isRenderableComponent(Sidebar)).toBe(true)
    expect(isRenderableComponent(AppMain)).toBe(true)
  })
})
