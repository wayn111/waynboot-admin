# waynboot-admin

Waynboot Mall 后台管理端，已升级到 Vue 3、Vite 6 和 Element Plus。项目面向商城运营后台，包含动态路由菜单、权限控制、商品管理、订单管理、会员管理、运营配置、系统管理、富文本编辑和消息通知等后台功能。

## 相关仓库

- H5 商城端：https://github.com/wayn111/waynboot-mobile
- 后台管理端：https://github.com/wayn111/waynboot-admin
- 后台接口服务：https://github.com/wayn111/waynboot-mall

## 技术栈

- Vue 3.5
- Vue Router 4
- Vuex 4
- Vite 6
- Element Plus 2
- Axios
- ECharts
- TinyMCE 8 + `@tinymce/tinymce-vue`
- Vitest + Vue Test Utils
- ESLint

## 环境要求

- Node.js >= 20.19.0
- npm >= 10.0.0

## 快速开始

```bash
npm install
npm run dev
```

默认开发服务端口为 `9528`，Vite 会按 `.env.development` 中的配置代理 `/dev-api` 和 `/upload`。

管理员账号密码由后端服务提供，常用演示账号为：

```text
admin / 123456
```

## 常用命令

```bash
npm run dev
npm run build:prod
npm run preview
npm run lint
npm run test:unit
npm run test:ci
npm run svgo
```

命令说明：

- `dev`：启动 Vite 开发服务。
- `build:prod`：生产构建，输出到 `dist/`。
- `preview`：本地预览生产构建产物。
- `lint`：检查 `src` 下的 JavaScript 和 Vue 文件。
- `test:unit`：运行 Vitest 单元测试。
- `test:ci`：依次运行 lint 和单元测试。
- `svgo`：压缩 `src/icons/svg` 图标。

## 目录结构

```text
.
├── public/                 # 静态资源，包含 favicon 和本地 TinyMCE 语言包/资源
├── src/
│   ├── api/                # 后台接口封装
│   ├── assets/             # 项目图片等静态资源
│   ├── components/         # 通用组件
│   ├── directive/          # 权限等自定义指令
│   ├── icons/              # SVG 图标与注册逻辑
│   ├── layout/             # 后台基础布局、导航栏、侧边栏
│   ├── plugins/            # Element Plus 等插件初始化
│   ├── router/             # 常量路由与动态路由入口
│   ├── store/              # Vuex 模块
│   ├── styles/             # 全局样式、Element Plus 样式覆盖
│   ├── utils/              # 请求、加密、TinyMCE、环境变量等工具
│   └── views/              # 页面模块
├── tests/unit/             # 单元测试与架构约束测试
├── index.html              # Vite 入口 HTML
└── vite.config.js          # Vite 构建配置
```

## 功能模块

- 登录、注销和用户信息加载。
- 动态路由菜单，支持后端 `getRouters` 返回父子目录层级。
- 侧边栏、面包屑和导航栏状态联动。
- 商品、订单、分类、库存、预警、会员、地址、评论等商城模块。
- 栏目、金刚区、关键字、优惠券、客服配置等运营模块。
- 用户、角色、菜单、部门、字典、系统日志等系统模块。
- 邮件、存储、接口文档等工具模块。
- TinyMCE 使用本地开源包和 GPL license，不依赖 TinyMCE Cloud。
- 消息通知页使用前端静态数据，因为后台当前未提供 `/msg/msgTask/list` 接口。

## 环境变量

开发环境配置位于 `.env.development`：

```env
VITE_APP_BASE_API='/dev-api'
VITE_APP_BASE_URL='http://localhost:81/'
```

生产环境配置位于 `.env.production`：

```env
VITE_APP_BASE_API='/admin-api'
VITE_APP_BASE_URL='http://localhost:81'
```

`VITE_APP_BASE_API` 用于前端请求前缀，`VITE_APP_BASE_URL` 用于 Vite 开发服务器代理目标。

## 构建与部署

项目构建基于 Vite，生产构建命令为：

```bash
npm run build:prod
```

构建产物输出到 `dist/`。当前 `vite.config.js` 中的 `base` 为 `/admin/`，部署到其他路径时需要同步调整该配置和后端静态资源访问路径。

## 迁移说明

当前项目已经从 Vue 2 / Vue CLI / Element UI 迁移到 Vue 3 / Vite 6 / Element Plus。旧的 Vue CLI、Babel、Jest、Travis 和 Element UI 入口配置已移除，测试体系改为 Vitest。

## License

MIT
