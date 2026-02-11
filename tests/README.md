# 时光手记测试文档

## 测试概览

本项目使用 **Vitest** 作为测试框架，**React Testing Library** 进行组件测试。

## 测试结构

```
tests/
├── unit/                    # 单元测试
│   ├── utils.test.ts       # 工具函数测试
│   ├── types.test.ts       # 类型定义测试
│   ├── components.test.tsx # UI组件测试
│   └── auth.test.tsx       # 认证测试
├── integration/             # 集成测试
│   ├── supabase.test.ts    # Supabase服务测试
│   └── minimax.test.ts     # MiniMax API测试
├── e2e/                     # 端到端测试 (预留)
└── setup.ts                # 测试环境配置
```

## 运行测试

### 运行所有测试
```bash
npm test
# 或
./run-tests.sh
```

### 开发模式（监听文件变化）
```bash
npm run test:watch
```

### 生成测试报告
```bash
./test-report.sh
```

### 带覆盖率报告
```bash
npm run test:coverage
```

## 测试覆盖范围

### ✅ 已测试功能

#### 1. 工具函数 (utils.test.ts)
- [x] `cn` 类名合并工具
- [x] Tailwind 类名冲突处理
- [x] 条件类名渲染

#### 2. 类型定义 (types.test.ts)
- [x] BiographyProject 接口验证
- [x] Upload 接口验证
- [x] InterviewSession 接口验证
- [x] CreateProjectFormData 接口验证

#### 3. UI 组件 (components.test.tsx)
- [x] Button 组件渲染和点击
- [x] Input 组件输入处理
- [x] Card 组件布局
- [x] 禁用状态测试

#### 4. 认证系统 (auth.test.tsx)
- [x] AuthContext 初始化
- [x] 匿名登录
- [x] 邮箱登录
- [x] 用户注册
- [x] 登出功能
- [x] 错误处理

#### 5. Supabase 服务 (supabase.test.ts)
- [x] 获取项目列表
- [x] 创建项目
- [x] 创建上传记录
- [x] 错误处理

#### 6. MiniMax API (minimax.test.ts)
- [x] 聊天 API 调用
- [x] 图片分析 API
- [x] TTS 语音合成
- [x] 系统提示词生成
- [x] API 错误处理

## 关键测试用例

### 认证测试
```typescript
// 匿名登录
await signInAnonymously('用户名')
expect(mockSignInAnonymously).toHaveBeenCalled()

// 邮箱登录
await signInWithEmail('email@test.com', 'password')
expect(mockSignInWithPassword).toHaveBeenCalled()
```

### API 测试
```typescript
// MiniMax 聊天
const response = await chatWithMiniMax({ messages })
expect(response.choices[0].message.content).toBeDefined()

// 图片分析
const result = await analyzeImage('base64')
expect(result.description).toBeTruthy()
```

### 组件测试
```typescript
// 按钮点击
const handleClick = vi.fn()
render(<Button onClick={handleClick}>Click</Button>)
fireEvent.click(screen.getByText('Click'))
expect(handleClick).toHaveBeenCalled()
```

## 环境变量

测试使用以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
NEXT_PUBLIC_MINIMAX_API_KEY=test-minimax-key
```

## Mock 配置

### Window API Mock
- `matchMedia` - 响应式断点测试
- `IntersectionObserver` - 懒加载/无限滚动测试
- `fetch` - API 请求测试

### Supabase Mock
- 认证方法
- 数据库操作
- 文件存储

## 测试最佳实践

1. **独立性**: 每个测试用例独立，不依赖其他测试
2. **可重复性**: 测试可以重复运行，结果一致
3. **快速执行**: 使用 mock 避免真实网络请求
4. **清晰命名**: 测试描述清晰说明测试内容

## 持续集成

建议配置 CI/CD 时运行测试：

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm test
  
- name: Check Test Results
  run: |
    if [ $? -eq 0 ]; then
      echo "✅ 测试通过"
    else
      echo "❌ 测试失败"
      exit 1
    fi
```

## 待补充测试

- [ ] 端到端测试 (Playwright/Cypress)
- [ ] 表单验证测试
- [ ] 路由跳转测试
- [ ] 文件上传流程测试
- [ ] 访谈对话流程测试
- [ ] 电子书导出测试

## 测试统计

| 类别 | 测试数 | 状态 |
|------|--------|------|
| 单元测试 | 15+ | ✅ |
| 集成测试 | 10+ | ✅ |
| 端到端测试 | 0 | ⏳ 待补充 |

---

**测试覆盖率目标**: 80%+

**当前状态**: ✅ 核心功能已覆盖，可以部署
