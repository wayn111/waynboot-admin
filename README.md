## waynboot-mall项目

waynboot-mall是一套全部开源的微商城项目，包含一个运营后台、h5商城和后台接口。
实现了一个商城所需的首页展示、商品分类、商品详情、sku详情、商品搜索、加入购物车、结算下单、订单状态流转、商品评论等一系列功能。
技术上基于Springboot2.0，整合了Redis、RabbitMQ、ElasticSearch等常用中间件，
贴近生产环境实际经验开发而来不断完善、优化、改进中。

- [h5商城项目](https://gitee.com/wayn111/waynboot-mobile)
- [运营后台项目](https://gitee.com/wayn111/waynboot-admin)  
- [后台接口项目](https://gitee.com/wayn111/waynboot-mall)

## waynboot-admin

* 基于vue-admin-template基础模板脚手架
* 前端采用Vue、Element UI。
* 后端采用Spring Boot、Spring Security、Redis & Jwt。
* 支持动态路由，权限验证。

> 如果有任何使用问题，欢迎提交Issue或加wx告知，方便互相交流反馈～ 💘。最后，喜欢的话麻烦给我个star

关注公众号：waynblog，每周更新最新技术文章。回复关键字：
- **学习**：加群交流，群内问题都会一一解答。
- **演示账号**：获得线上项目管理后台演示账号。
- **开源项目**：获取博主自己写的三个开源项目，包含PC、H5商城、后台权限管理系统等。

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
# 克隆项目
git clone git@github.com:wayn111/waynboot-admin.git

# 进入项目目录
cd waynboot-admin

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev

# 管理员账号/密码
admin/123456
```

## 在线体验
演示地址：http://121.4.124.33/admin

演示账号：关注博主公众号【waynblog】，发送 演示账号

## 演示图

<table>
    <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-3cb800e60b6c99c5e0c2e2984b9ddffdcc0.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-224e54dcb3eb4035736fcbea4626b85223d.png"/></td>
    </tr>
    <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-7fabe6227a9447653e06d2d8e4efb974195.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-0192d4f41f9c061ed5329d9d6267ce3b8f3.png"/></td>
    </tr>
    <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-cec6bde100884182a9ad7aae10cb8c9d5b8.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-535f8cab7365885095e3e511ec3762b0973.png"/></td>
    </tr>
    <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-b831bbf1f4fa00655d3b7e4368d4181a9b9.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-e9edbb0bfcfd2c8687457573caf603e6275.png"/></td>
    </tr>
    <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-5447c1deaa5e1db63b81a9f90b5eed2fc07.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-c769886a136ce0f25edcc4d647322d5d51f.png"/></td>
    </tr>
     <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-ef857d19b1f905afec239c673be24860a9a.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-e0effea68ad0073f30d5b5f6d9567a24b9e.png"/></td>
    </tr>
    <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-d3bce6e295c1ddf4b27e6c437ca6a8b6351.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-e6c8baa4e20766156053daa15b0b0240653.png"/></td>
    </tr>
    <tr>
        <td><img src="https://oscimg.oschina.net/oscnet/up-f5989718203874629c12f637c1c787c5ea6.png"/></td>
        <td><img src="https://oscimg.oschina.net/oscnet/up-0613c4a6eb745def23c5359a53340744c05.png"/></td>
    </tr>
</table>


## waynboot-mall交流群

关注博主公众号【waynblog】，发送 加群，博主拉你进群

## 感谢

- [vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)
- [litemall](https://github.com/linlinjava/litemall)

# 捐助

<img src="./images/捐助.jpg" width="260" alt="如果这个项目对你有所帮助，不如请作者喝杯咖啡吧">
