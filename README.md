# 菜谱共创工坊

面向美食爱好者的全栈菜谱协作平台，支持多人实时编辑、营养自动计算、收藏夹管理。

## 技术栈

- 前端：React 18、TypeScript、Ant Design 5、Vite 6、Zustand、React Router v6、axios、socket.io-client
- 后端：Node.js 20、NestJS 10、TypeScript、TypeORM 0.3、JWT、bcrypt、class-validator、Socket.IO Gateway
- 数据库：MySQL 8.0
- 容器化：Docker Compose，项目名 `wjerecipeworks`

## 快速开始

1. 安装 Docker 和 Docker Compose。
2. 进入项目目录：`cd wje-102`。
3. 复制环境变量：`cp .env.example .env`。
4. 启动服务：`docker compose up -d --build`。
5. 初始化数据：`docker compose exec backend npm run seed`。
6. 访问前端：`http://localhost:28602`，后端 API：`http://localhost:29602/api`。

## 预置账号

| 用户名 | 邮箱 | 密码 | 角色 |
| --- | --- | --- | --- |
| chef_wang | wang@example.com | 123456 | user |
| foodie_li | li@example.com | 123456 | user |
| admin_zhang | zhang@example.com | admin123 | admin |

## API 文档概要

- Auth：`POST /api/auth/register`、`POST /api/auth/login`、`GET /api/auth/profile`
- Users：`GET /api/users`、`GET /api/users/:id`、`PUT /api/users/me/profile`
- Recipes：`GET /api/recipes`、`GET /api/recipes/my`、`POST /api/recipes`、`GET /api/recipes/:id`、`PUT /api/recipes/:id`、`PATCH /api/recipes/:id/status`、`DELETE /api/recipes/:id`
- Recipe Versions：`GET /api/recipes/:id/versions`、`POST /api/recipes/:id/versions/:versionId/rollback`
- Ingredients：`GET /api/ingredients`、`GET /api/ingredients/:id`、`POST /api/ingredients`、`PUT /api/ingredients/:id`、`DELETE /api/ingredients/:id`
- Collections：`GET /api/collections`、`POST /api/collections`、`PUT /api/collections/:id`、`DELETE /api/collections/:id`、`POST /api/collections/:id/recipes`、`DELETE /api/collections/:id/recipes/:recipeId`
- Collaborations：`GET /api/collaborations/recipes/:recipeId`、`POST /api/collaborations/recipes/:recipeId/invite`、`POST /api/collaborations/:id/accept`
- Operation Logs：`GET /api/operation-logs`，仅 admin 可访问

所有成功响应统一为 `{ code: 200, data, message: "success" }`。错误响应统一为 `{ code, data: null, message }`。

## 项目结构

```text
frontend/
├── public/
├── src/
│   ├── api/
│   ├── stores/
│   ├── types/
│   ├── components/common/
│   ├── hooks/
│   ├── pages/
│   ├── router/
│   └── utils/
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html

backend/
├── src/
│   ├── modules/
│   ├── middlewares/
│   ├── common/
│   ├── utils/
│   ├── types/
│   ├── config/
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

## 环境变量说明

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| COMPOSE_PROJECT_NAME | wjerecipeworks | Compose 项目名 |
| FRONTEND_PORT | 28602 | 前端宿主机端口 |
| BACKEND_PORT | 29602 | 后端宿主机端口 |
| DB_PORT | 57602 | MySQL 宿主机端口 |
| DB_ROOT_PASSWORD | rootpassword123 | MySQL root 密码 |
| DB_NAME | recipe_works | 数据库名 |
| DB_USER | recipe_user | 应用数据库用户 |
| DB_PASSWORD | recipe_pass_2024 | 应用数据库密码 |
| JWT_SECRET | jwt-recipe-works-secret-key-2024 | JWT 签名密钥 |

## 开发指南

- 前端开发：`cd frontend && npm install && npm run dev`
- 后端开发：`cd backend && npm install && npm run start:dev`
- 后端类型检查：`cd backend && npm run typecheck`
- 前端类型检查：`cd frontend && npm run typecheck`
- 数据库管理：使用 Navicat、DBeaver 或 MySQL CLI 连接 `localhost:57602`

## 核心功能特性

- 菜谱 CRUD、状态切换、我的菜谱管理
- 多人实时协作编辑，基于 WebSocket 房间广播字段变更、光标和在线状态
- 食材库管理与前后端营养自动计算
- 版本历史与回滚
- 收藏夹创建、删除、加入和移除菜谱
- JWT 认证、前端受保护路由、axios 自动附加 token
- 操作日志审计，记录 POST、PUT、PATCH、DELETE 写操作
