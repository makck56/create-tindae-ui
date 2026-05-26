# 用户管理 (UserManagement)

## 功能说明

本域负责 **用户管理** 相关的所有业务逻辑。

## 目录结构

```
user-management/
├── pages/                    # 路由页 (极薄的壳)
│   └── UserManagementList.page.vue
├── features/                 # 特性实现
│   └── role/   # role
│       ├── views/           # 业务视图 (核心)
│       ├── components/      # 私有组件
│       ├── composables/     # 业务逻辑
│       ├── api/             # API 定义
│       ├── models/          # 数据模型
│       └── constants/       # 特性常量
│   └── user/   # user
│       ├── views/           # 业务视图 (核心)
│       ├── components/      # 私有组件
│       ├── composables/     # 业务逻辑
│       ├── api/             # API 定义
│       ├── models/          # 数据模型
│       └── constants/       # 特性常量
├── shared/                   # 域内共享资源
└── user-management.routes.ts  # 路由定义
```

## 开发规范

1. **Page/View 分离**: 路由页只负责取参，业务逻辑全在 View
2. **单向依赖**: features 内部不允许跨特性引用
3. **显式导入**: 禁止使用 index.ts 的 barrel exports

## 路由

- `/user-management/role/list` - role列表
- `/user-management/user/list` - user列表
