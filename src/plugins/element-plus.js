import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'dayjs/locale/zh-cn'
import { installElementPlusIcons } from './element-plus-icons'

export const elementPlusOptions = {
  locale: zhCn
}

export function installElementPlus(app) {
  app.use(ElementPlus, elementPlusOptions)
  installElementPlusIcons(app)
}
