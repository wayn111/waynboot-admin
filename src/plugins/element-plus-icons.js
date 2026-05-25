import {
  ArrowDown,
  Delete,
  Download,
  Edit,
  Expand,
  Key,
  Loading,
  Minus,
  Plus,
  Position,
  Promotion,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Search,
  Tools,
  Upload
} from '@element-plus/icons-vue'

export const elementPlusIconAliases = {
  ArrowDown,
  Delete,
  Download,
  Edit,
  Expand,
  Key,
  Loading,
  Minus,
  Plus,
  Position,
  Promotion,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Search,
  Tools,
  Upload,
  'el-icon-arrow-down': ArrowDown,
  'el-icon-delete': Delete,
  'el-icon-download': Download,
  'el-icon-edit': Edit,
  'el-icon-key': Key,
  'el-icon-loading': Loading,
  'el-icon-minus': Minus,
  'el-icon-plus': Plus,
  'el-icon-position': Position,
  'el-icon-refresh': Refresh,
  'el-icon-refresh-left': RefreshLeft,
  'el-icon-refresh-right': RefreshRight,
  'el-icon-s-promotion': Promotion,
  'el-icon-s-tools': Tools,
  'el-icon-s-unfold': Expand,
  'el-icon-search': Search,
  'el-icon-upload': Upload,
  'el-icon-upload2': Upload
}

export function installElementPlusIcons(app) {
  Object.entries(elementPlusIconAliases).forEach(([name, component]) => {
    app.component(name, component)
  })
}
