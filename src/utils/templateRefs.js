export function useTemplateRefs(instance) {
  return new Proxy({}, {
    get(target, key) {
      return instance?.proxy?.$refs?.[key]
    }
  })
}
