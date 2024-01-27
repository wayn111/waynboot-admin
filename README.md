## waynboot-mall项目

waynboot-mall是一套全部开源的微商城项目，包含一个运营后台、h5商城和后台接口。
实现了一个商城所需的首页展示、商品分类、商品详情、sku详情、商品搜索、加入购物车、结算下单、订单状态流转、商品评论等一系列功能。
技术上基于Springboot2.0，整合了Redis、RabbitMQ、ElasticSearch等常用中间件，
贴近生产环境实际经验开发而来不断完善、优化、改进中。

- [h5商城项目](https://github.com/wayn111/waynboot-mobile)
- [运营后台项目](https://github.com/wayn111/waynboot-admin)  
- [后台接口项目](https://github.com/wayn111/waynboot-mall)

## waynboot-admin

* 基于vue-admin-template基础模板脚手架
* 前端采用Vue、Element UI。
* 后端采用Spring Boot、Spring Security、Redis & Jwt。
* 支持动态路由，权限验证。

> 如果有任何使用问题，欢迎提交Issue或加wx告知，方便互相交流反馈～ 💘。最后，喜欢的话麻烦给我个star

关注我的公众号：程序员wayn，专注技术干货输出、分享开源项目。回复关键字：

- **加群**：加群交流，探讨技术问题。
- **演示账号**：获得 waynboot-mall 商城后台演示账号。
- **开源项目**：获取我写的三个开源项目，包含PC、H5商城、后台权限管理系统等。
- **wayn商城资料**：获取wayhboot-mall项目配套资料以及商城图片压缩包下载地址。
- **加微信**：联系我。

<img src="images/wx-mp-code.png" width = "100" />

---

## 内置功能

```
- 登录 / 注销

- 权限验证
  - 页面权限
  - 指令权限
  - 权限配置

- 全局功能
  - 动态侧边栏（支持多级路由嵌套）
  - 动态面包屑
  - 快捷导航(标签页)
  - Svg Sprite 图标
  - Screenfull全屏
  - 自适应收缩侧边栏

- 菜单导航
  - 首页
  - 用户管理
    - 会员管理
    - 地址管理
    - 评论管理
  - 商城管理
    - 添加商品
    - 商品管理
    - banner管理
    - 订单管理
    - 分类管理
  - 运营管理
    - 金刚区管理
    - 栏目管理
    - 关键字管理
  - 系统管理
    - 用户管理
    - 角色管理
    - 菜单管理
    - 部门管理
    - 字典管理
  - 系统监控
    - 数据管理
  - 系统工具
    - 存储管理
    - 邮件管理
    - 系统接口
```
## 本地开发
```
# 前置准备
下载 nodejs v16.20.1 版本

# 克隆项目
git clone git@github.com:wayn111/waynboot-admin.git

# 进入项目目录
cd waynboot-admin

// 清空缓存
npm cache clean --force

// 切换新淘宝源
npm config set registry https://registry.npmmirror.com

# 安装依赖
npm install

# 启动服务
npm run dev

# 管理员账号/密码
admin/123456
```

## 在线体验

演示地址以及账号：关注我的公众号【程序员wayn】，发送 演示账号

## 演示gif

![Alt text](images/admin.gif)

## waynboot-mall交流群

关注我的公众号【程序员wayn】，发送 加群，拉你进我的技术交流群

## 感谢

- [vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)
- [litemall](https://github.com/linlinjava/litemall)

# 捐助

<img src="./images/捐助.jpg" width="260" alt="如果这个项目对你有所帮助，不如请作者喝杯咖啡吧">
