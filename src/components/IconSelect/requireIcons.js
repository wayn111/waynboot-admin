const modules = import.meta.glob('../../icons/svg/*.svg', { eager: true })
const re = /\/([^/]+)\.svg$/

const icons = Object.keys(modules).map(i => {
  return i.match(re)[1]
})

export default icons
