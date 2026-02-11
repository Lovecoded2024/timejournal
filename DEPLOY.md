# 时光手记 TimeJournal 部署指南

## 🎉 部署状态

### ✅ 已完成
- [x] GitHub 仓库创建: https://github.com/Lovecoded2024/timejournal
- [x] 代码已推送到 GitHub
- [x] 测试全部通过 (37/37)

### ⏳ 待完成 (Vercel 配置)
- [ ] Vercel 项目导入
- [ ] 环境变量配置
- [ ] 首次部署

---

## 🚀 Vercel 部署步骤

### 方法一：Vercel Dashboard (推荐)

1. **访问 Vercel**
   - 打开 https://vercel.com/dashboard
   - 登录你的账号

2. **导入 GitHub 仓库**
   - 点击 "Add New Project"
   - 选择 GitHub 作为 Git Provider
   - 授权访问 `Lovecoded2024/timejournal` 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (默认)
   - **Build Command**: `next build` (默认)
   - **Output Directory**: `.next` (默认)

4. **配置环境变量**
   在 Environment Variables 中添加以下变量：

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ca42d8c8054deaba1047e78415132251.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sbp_ca42d8c8054deaba1047e78415132251a4b65491
   NEXT_PUBLIC_MINIMAX_API_KEY=sk-api-dHMfMag2uo0ABRFywU-9as39u_ns_QQRtC-GolSaQED1Z3i8H-tknbEqFWwXKJjYa-iQkaTszbXrycNYN1J_9kU60ZOKk7TygtR8tmjLJ71vgU5nDOnYTIc
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成 (约 2-3 分钟)

6. **获取域名**
   - 部署成功后，Vercel 会提供一个 `.vercel.app` 域名
   - 例如: `https://timejournal-xxx.vercel.app`

---

### 方法二：Vercel CLI

如果你更喜欢命令行，可以使用以下步骤：

```bash
# 1. 登录 Vercel (使用你的 token)
vercel login

# 2. 进入项目目录
cd /Users/airforce/.openclaw/workspace/timejournal

# 3. 初始化 Vercel 项目
vercel

# 4. 按照提示配置：
# - Set up and deploy? [Y/n] → Y
# - Link to existing project? [y/N] → N
# - Project name → timejournal
# - Directory → ./

# 5. 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_MINIMAX_API_KEY

# 6. 部署到生产环境
vercel --prod
```

---

### 方法三：GitHub Actions 自动部署

项目已配置 GitHub Actions 自动部署 (`.github/workflows/deploy.yml`)

需要在 GitHub 仓库 Settings > Secrets 中添加：

```
VERCEL_TOKEN=cLs3DcOm3njCZI8hAgFY74nd
VERCEL_ORG_ID=你的 Vercel Org ID
VERCEL_PROJECT_ID=你的 Vercel Project ID
```

获取这些值的方法：
1. 在 Vercel Dashboard 创建项目后
2. 进入 Project Settings > General
3. 找到 "Project ID" 和 "Org ID"
4. 在 Vercel Account Settings > Tokens 创建 Token

---

## 🔧 Supabase 配置

在部署前，需要在 Supabase 中完成以下配置：

### 1. 执行数据库 Schema

在 Supabase Dashboard > SQL Editor 中执行 `supabase/schema.sql`

### 2. 启用匿名登录

在 Supabase Dashboard > Authentication > Providers 中：
- 启用 "Anonymous sign-ins"

### 3. 创建 Storage Bucket

在 Supabase Dashboard > Storage 中：
- 创建名为 `uploads` 的 bucket
- 设置为 Public

---

## 📋 部署检查清单

- [ ] GitHub 仓库已创建 ✅
- [ ] 代码已推送 ✅
- [ ] 测试全部通过 ✅
- [ ] Vercel 项目已导入
- [ ] 环境变量已配置
- [ ] Supabase Schema 已执行
- [ ] Supabase Auth 已启用
- [ ] Supabase Storage 已创建
- [ ] 首次部署成功
- [ ] 自定义域名 (可选)

---

## 🌐 部署后访问

部署成功后，你可以通过以下方式访问：

- **Vercel 域名**: `https://timejournal-xxx.vercel.app`
- **自定义域名**: (可在 Vercel Dashboard 中配置)

---

## 🆘 常见问题

### 1. 构建失败
检查环境变量是否正确配置

### 2. API 调用失败
检查 MiniMax 和 Supabase 的 API Key 是否正确

### 3. 图片上传失败
检查 Supabase Storage bucket 是否为 Public

### 4. 登录失败
检查 Supabase Auth 是否启用了 Anonymous sign-ins

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. Vercel 构建日志
2. 浏览器控制台错误
3. Supabase 日志
4. 环境变量配置

---

**🎉 恭喜你！时光手记即将上线！**
