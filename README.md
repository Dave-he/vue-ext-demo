# Vue TS Browser Extension

一个使用 Vue 3 + TypeScript + Vite 构建的现代浏览器扩展项目。

## 🚀 特性

- ✅ Vue 3 Composition API
- ✅ TypeScript 支持
- ✅ Vite 构建工具
- ✅ 模块化架构
- ✅ 现代浏览器 API (Manifest V3)
- ✅ 热重载开发

## 📦 技术栈

- **前端框架**: Vue 3
- **类型检查**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **工具库**: @vueuse/core
- **包管理**: pnpm
- **浏览器 API**: Chrome Extension Manifest V3

## 🛠️ 安装

```bash
# 克隆项目
git clone <repository-url>
cd vue-ts-browser-extension

# 安装依赖
pnpm install
```

## 🏗️ 开发

```bash
# 开发模式（带热重载）
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 清理构建文件
pnpm clean
```

## 📁 项目结构

```
src/
├── manifest.json          # 扩展清单文件
├── background.ts          # 背景脚本
├── content.ts            # 内容脚本
├── popup/                # 弹窗页面
│   ├── index.html
│   └── main.ts
├── components/           # Vue 组件
│   ├── App.vue
│   └── Popup.vue
└── assets/               # 静态资源
    └── icons/

scripts/
└── copy-manifest.js      # 构建脚本

dist/                     # 构建输出目录
├── manifest.json
├── popup/
│   └── index.html
└── assets/               # 编译后的资源
```

## 🔧 扩展功能

### 内容脚本 (Content Script)
- 在页面中注入 Vue 应用
- 与背景脚本通信
- 获取页面选中文本

### 背景脚本 (Background Script)
- 管理扩展状态
- 处理消息通信
- 定时任务

### 弹窗 (Popup)
- 快速操作界面
- 状态显示
- 设置入口

### 主要功能
- ✅ 扩展启用/禁用切换
- ✅ 获取页面选中文本
- ✅ 数据存储功能
- ✅ 状态持久化

## 🚀 浏览器安装

### Chrome
1. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 目录

### Firefox
1. 打开 Firefox 扩展管理页面 (`about:debugging#/runtime/this-firefox`)
2. 点击"临时载入附加组件"
3. 选择 `dist/manifest.json` 文件

## 📝 开发指南

### 添加新功能
1. 在 `src/components/` 中创建新组件
2. 在相应的脚本中导入和使用
3. 更新 `manifest.json` 配置权限

### 添加新权限
在 `src/manifest.json` 中添加所需的权限：

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "tabs"
  ]
}
```

### 调试
- 使用浏览器开发者工具的"扩展"面板
- 查看背景脚本日志
- 使用 `console.log` 调试内容脚本

### 构建流程
项目使用 Vite 进行构建，输出到 `dist` 目录：
- 自动复制 `manifest.json`
- 编译 Vue 组件
- 生成优化的 JS/CSS 文件
- 支持热重载开发

## 📋 待办功能

- [ ] 添加选项页面
- [ ] 实现主题切换
- [ ] 添加数据持久化
- [ ] 添加单元测试
- [ ] 支持多语言
- [ ] 添加图标资源

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如果遇到问题，请检查：
1. 依赖是否正确安装
2. 构建是否成功
3. 浏览器是否支持 Manifest V3
4. 是否正确加载了扩展

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本 (建议 18+)
   - 确保 pnpm 已正确安装
   - 运行 `pnpm clean` 后重新安装

2. **扩展无法加载**
   - 检查 `dist/manifest.json` 是否存在
   - 确认文件路径正确
   - 查看浏览器控制台错误信息

3. **TypeScript 错误**
   - 运行 `pnpm exec vue-tsc --noEmit` 检查类型
   - 确保所有依赖类型已安装