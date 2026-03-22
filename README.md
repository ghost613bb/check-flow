# 项目结构与功能说明

这是一个基于 Vue 3 + Element Plus 的仿钉钉审批可视化配置前端项目
以下是项目的核心目录结构以及各个文件实现的功能说明：
预览：http://101.34.91.102:8080/


```text
Workflow-Vue3/
├── public/                     # 静态资源目录，存放作为 Mock 数据来源的 JSON 文件
│   ├── data.json               # 核心：初始化审批流程图的树状 JSON 数据
│   ├── employees.json          # Mock数据：员工列表
│   ├── departments.json        # Mock数据：部门架构树
│   ├── roles.json              # Mock数据：角色列表
│   └── conditions.json         # Mock数据：表单条件字段列表
│
├── src/                        # 源代码目录
│   ├── api/                    
│   │   └── index.js            # 接口请求配置，封装 axios 请求 public 下的 JSON 模拟后端接口
│   │
│   ├── assets/                 # 静态资源
│   │   ├── images/             # 存放项目中用到的各类小图标（如加号、关闭、选人等）
│   │   └── ...                 # 全局 CSS 基础样式
│   │
│   ├── components/             # ★ 核心业务组件目录
│   │   ├── addNode.vue         # 节点添加组件（点击 + 号弹出的气泡菜单，用于插入审批人/抄送人/条件分支）
│   │   ├── nodeWrap.vue        # ★ 最核心的递归渲染组件（负责把嵌套的 JSON 数据渲染成可视化的节点和连线）
│   │   ├── selectBox.vue       # 通用组件：在选人弹窗中，左侧展示供选择的列表（支持部门、角色、人员）
│   │   ├── selectResult.vue    # 通用组件：在选人弹窗中，右侧展示已选中的结果并提供删除功能
│   │   │
│   │   ├── dialog/             # 弹窗组件目录（用于复杂的业务选择）
│   │   │   ├── common.js             # 弹窗组件通用的防抖搜索、数据获取等逻辑
│   │   │   ├── employeesDialog.vue   # 选人/选部门弹窗组件
│   │   │   ├── roleDialog.vue        # 选角色弹窗组件
│   │   │   └── errorDialog.vue       # 错误提示弹窗组件（点击发布时，展示漏填的节点列表）
│   │   │
│   │   └── drawer/             # 右侧抽屉组件目录（用于配置各个节点的详细规则）
│   │       ├── approverDrawer.vue    # 审批人配置抽屉（配置指定成员、主管级别等）
│   │       ├── copyerDrawer.vue      # 抄送人配置抽屉
│   │       ├── conditionDrawer.vue   # 条件分支配置抽屉（配置请假天数、金额等判断条件）
│   │       └── promoterDrawer.vue    # 发起人配置抽屉（配置谁可以发起该流程）
│   │
│   ├── css/                    # 样式文件目录
│   │   └── workflow.css        # ★ 核心样式：使用纯 CSS 伪元素绘制流程图的复杂连线
│   │
│   ├── router/                 
│   │   └── index.js            # Vue Router 路由配置
│   │
│   ├── stores/                 
│   │   └── index.js            # Pinia 状态管理（用于跨层级共享当前正在编辑的节点配置数据）
│   │
│   ├── utils/                  
│   │   ├── axios.js            # 封装的 Axios 拦截器
│   │   ├── const.js            # 全局常量配置（如节点背景色、默认占位符、选项字典等）
│   │   └── index.js            # 全局工具函数（如判断节点是否为空、数组去重/转字符串等）
│   │
│   ├── views/                  
│   │   └── setting.vue         # ★ 项目主页面（负责初始化数据、控制画布缩放、以及全局的递归容错校验 reErr 和保存逻辑）
│   │
│   ├── App.vue                 # 根组件
│   └── main.js                 # 项目入口文件（挂载 Vue 实例、引入 Element Plus 和 Pinia）
│
├── vite.config.js              # Vite 构建配置（配置别名、按需引入 Element Plus 等）
└── package.json                # 项目依赖配置文件
```

## 核心数据流向总结：
1. `setting.vue` 加载 `public/data.json` 获取完整的树状结构数据。
2. 将数据传递给 `nodeWrap.vue`，通过**组件自身递归调用**渲染出无限层级的流程图。
3. 用户点击节点修改规则时，触发事件并将当前节点数据存入 `stores` (Pinia)。
4. `drawer/` 目录下的组件监听 Pinia 数据的变化，滑出抽屉供用户配置。
5. 抽屉内如果需要选人，则打开 `dialog/` 目录下的弹窗，弹窗复用了 `selectBox.vue` 和 `selectResult.vue`。
6. 配置完成后，数据更新回 Pinia，`nodeWrap.vue` 监听到更新，重新渲染视图。
7. 点击“发布”时，`setting.vue` 遍历校验整个 JSON 树是否有漏配，校验通过后提交数据。