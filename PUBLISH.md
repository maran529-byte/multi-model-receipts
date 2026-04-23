# 发布指南

## 1. 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. Repository name: `multi-model-receipts`
3. 选择 Public
4. 不要勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

## 2. 推送代码

在终端运行以下命令（从 GitHub 页面复制对应命令）：

```bash
cd ~/projects/multi-model-receipts
git remote add origin https://github.com/marans/multi-model-receipts.git
git branch -M main
git push -u origin main
```

## 3. 发布到 npm（可选）

```bash
cd ~/projects/multi-model-receipts
npm publish --access public
```

需要先在 https://www.npmjs.com 设置 2FA。

## 4. 添加 GitHub Topics（网页上操作）

在仓库页面右侧点击 "Add topics"，添加：
- openai
- anthropic
- google
- tokens
- usage
- billing
- cli
- nodejs
