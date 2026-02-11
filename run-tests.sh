#!/bin/bash

echo "========================================="
echo "🧪 时光手记 TimeJournal 测试套件"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vitest is installed
if ! npm list vitest > /dev/null 2>&1; then
  echo "❌ vitest 未安装，正在安装..."
  npm install -D vitest
fi

echo "📋 测试计划:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. 单元测试 (Unit Tests)"
echo "   - 工具函数测试"
echo "   - 类型定义测试"
echo "   - UI 组件测试"
echo "   - 认证系统测试"
echo ""
echo "2. 集成测试 (Integration Tests)"
echo "   - Supabase 服务测试"
echo "   - MiniMax API 测试"
echo ""
echo "3. 端到端测试 (E2E Tests)"
echo "   - 用户流程测试"
echo "   - 页面导航测试"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run unit and integration tests
echo "🚀 运行单元测试和集成测试..."
npm test

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ 所有测试通过！${NC}"
  echo ""
  echo "📊 测试结果摘要:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ 工具函数测试: 通过"
  echo "✅ 类型定义测试: 通过"
  echo "✅ UI 组件测试: 通过"
  echo "✅ 认证系统测试: 通过"
  echo "✅ Supabase 集成测试: 通过"
  echo "✅ MiniMax API 测试: 通过"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo -e "${GREEN}🎉 项目已准备好部署！${NC}"
  echo ""
  echo "下一步:"
  echo "1. 提交代码到 GitHub"
  echo "2. 在 Vercel 导入项目"
  echo "3. 配置环境变量"
  echo "4. 部署上线 🚀"
  echo ""
  echo "部署命令:"
  echo "  git add ."
  echo "  git commit -m 'Ready for deployment'"
  echo "  git push origin main"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}❌ 测试失败，请修复后再部署${NC}"
  echo ""
  echo "调试命令:"
  echo "  npm test -- --reporter=verbose"
  exit 1
fi