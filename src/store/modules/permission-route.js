const viewModules = import.meta.glob('../../views/**/*.vue')

function normalizeRoutePath(routePath = '') {
  const normalizedPath = String(routePath).replace(/\/+/g, '/')
  return normalizedPath === '/' ? normalizedPath : normalizedPath.replace(/\/$/, '')
}

export function normalizeBackendRoutePath(routePath) {
  return normalizeRoutePath(routePath)
}

export function filterAsyncRouter(asyncRouterMap = [], options = {}) {
  const { layout } = options

  return asyncRouterMap.map(route => {
    const normalizedPath = normalizeBackendRoutePath(route.path)
    const convertedRoute = {
      ...route,
      path: normalizedPath
    }

    if (convertedRoute.children && convertedRoute.children.length) {
      convertedRoute.alwaysShow = true
    }

    if (convertedRoute.component) {
      if (convertedRoute.component === 'Layout') {
        convertedRoute.component = layout || convertedRoute.component
      } else {
        convertedRoute.component = loadView(convertedRoute.component)
      }
    }

    if (convertedRoute.children && convertedRoute.children.length) {
      convertedRoute.children = filterAsyncRouter(convertedRoute.children, options)
    }

    return convertedRoute
  })
}

export const loadView = (view) => {
  let path = `../../views/${view}.vue`
  if (!viewModules[path]) {
    path = `../../views/${view}/index.vue`
  }
  return viewModules[path] || (() => import('@/views/404.vue'))
}
