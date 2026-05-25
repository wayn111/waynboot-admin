import SvgIcon from '@/components/SvgIcon'// svg component
import 'virtual:svg-icons-register'

// register globally
export default function install(app) {
  app.component('svg-icon', SvgIcon)
}
