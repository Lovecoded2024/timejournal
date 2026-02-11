#!/bin/bash

echo "========================================="
echo "时光手记 TimeJournal 测试报告"
echo "========================================="
echo ""

# Run tests with coverage
npx vitest run --coverage --reporter=json > test-results.json 2>&1

# Parse results
if [ -f test-results.json ]; then
  echo "测试执行完成"
  echo ""
  
  # Count tests
  PASSED=$(grep -o '"status":"passed"' test-results.json | wc -l)
  FAILED=$(grep -o '"status":"failed"' test-results.json | wc -l)
  TOTAL=$((PASSED + FAILED))
  
  echo "📊 测试结果摘要"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "总测试数: $TOTAL"
  echo "通过: $PASSED ✅"
  echo "失败: $FAILED ❌"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  if [ $FAILED -eq 0 ]; then
    echo "✅ 所有测试通过！项目已准备好部署。"
    echo ""
    echo "下一步："
    echo "1. 提交代码到 GitHub"
    echo "2. 在 Vercel 导入项目"
    echo "3. 配置环境变量"
    echo "4. 部署上线 🚀"
  else
    echo "❌ 有 $FAILED 个测试失败，请修复后再部署。"
    echo ""
    echo "查看详细报告:"
    echo "npx vitest run --reporter=verbose"
  fi
  
  # Clean up
  rm test-results.json
else
  echo "❌ 测试执行失败"
  echo ""
  echo "尝试运行："
  echo "npx vitest run"
fi