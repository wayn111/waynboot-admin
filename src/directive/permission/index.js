import hasRole from './hasRole'
import hasPermi from './hasPermi'

const install = function(app) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
}

if (typeof window !== 'undefined' && window.Vue) {
  window.hasRole = hasRole
  window.hasPermi = hasPermi
}

export default install
