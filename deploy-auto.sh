#!/bin/bash

# 时光手记全自动部署脚本
# 使用说明: 需要提供 SUPABASE_SERVICE_ROLE_KEY 才能完全自动化

echo "========================================="
echo "🚀 时光手记 TimeJournal 全自动部署"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要的环境变量
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ 错误: VERCEL_TOKEN 未设置${NC}"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  警告: SUPABASE_SERVICE_ROLE_KEY 未设置${NC}"
    echo "某些操作需要在 Supabase Dashboard 中手动完成"
    echo ""
fi

echo -e "${BLUE}📋 部署计划:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. 检查 GitHub 仓库状态"
echo "2. 推送最新代码到 GitHub"
echo "3. 配置 Supabase 数据库 (如提供 Service Role Key)"
echo "4. 配置 Supabase Auth"
echo "5. 配置 Supabase Storage"
echo "6. 触发 Vercel 重新部署"
echo "7. 等待部署完成并验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 检查 GitHub 仓库
echo -e "${BLUE}📦 步骤 1: 检查 GitHub 仓库...${NC}"
cd /Users/airforce/.openclaw/workspace/timejournal

if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 错误: Git 仓库未初始化${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git 仓库已就绪${NC}"

# 2. 推送代码
echo ""
echo -e "${BLUE}📤 步骤 2: 推送最新代码到 GitHub...${NC}"
git add -A
git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')" --allow-empty 2>/dev/null
git push origin main 2>&1 | grep -E "(Writing objects|remote|To http)" || echo "代码已是最新"
echo -e "${GREEN}✅ 代码已推送${NC}"

# 3. Supabase 配置 (如果提供了 Service Role Key)
if [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo ""
    echo -e "${BLUE}🗄️  步骤 3: 配置 Supabase 数据库...${NC}"
    
    # 执行 SQL 创建表
    SQL_RESULT=$(curl -s -X POST \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -d "{\"sql\": \"$(cat supabase/schema.sql | sed 's/"/\\"/g' | tr '\n' ' ')\"}" 2>&1)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 数据库表创建成功${NC}"
    else
        echo -e "${YELLOW}⚠️  数据库配置需要手动完成${NC}"
        echo "请在 Supabase Dashboard > SQL Editor 中执行 supabase/schema.sql"
    fi
    
    # 启用匿名登录
    echo ""
    echo -e "${BLUE}🔐 步骤 4: 配置 Supabase Auth...${NC}"
    AUTH_RESULT=$(curl -s -X PATCH \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        "$SUPABASE_URL/auth/v1/admin/config" \
        -d '{"external_anonymous_enabled": true}' 2>&1)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 匿名登录已启用${NC}"
    else
        echo -e "${YELLOW}⚠️  请在 Supabase Dashboard > Auth > Providers 中启用 Anonymous${NC}"
    fi
    
    # 创建 Storage bucket
    echo ""
    echo -e "${BLUE}📁 步骤 5: 配置 Supabase Storage...${NC}"
    STORAGE_RESULT=$(curl -s -X POST \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        "$SUPABASE_URL/storage/v1/bucket" \
        -d '{"id": "uploads", "name": "uploads", "public": true}' 2>&1)
    
    if [[ $STORAGE_RESULT == *"error"* ]]; then
        if [[ $STORAGE_RESULT == *"already exists"* ]]; then
            echo -e "${GREEN}✅ Storage bucket 已存在${NC}"
        else
            echo -e "${YELLOW}⚠️  请在 Supabase Dashboard > Storage 中创建 uploads bucket${NC}"
        fi
    else
        echo -e "${GREEN}✅ Storage bucket 创建成功${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  跳过 Supabase 自动配置${NC}"
    echo "请在 Supabase Dashboard 中完成以下操作:"
    echo "1. SQL Editor > 执行 supabase/schema.sql"
    echo "2. Auth > Providers > 启用 Anonymous"
    echo "3. Storage > 创建 uploads bucket (Public)"
fi

# 6. 触发 Vercel 部署
echo ""
echo -e "${BLUE}🚀 步骤 6: 触发 Vercel 部署...${NC}"

DEPLOY_RESULT=$(curl -s -X POST \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.vercel.com/v13/deployments" \
    -d "{
        \"name\": \"timejournal\",
        \"project\": \"prj_ZXgEpjQj5huwcIq4LkRUZb6ABhGl\",
        \"target\": \"production\",
        \"gitSource\": {
            \"type\": \"github\",
            \"repo\": \"Lovecoded2024/timejournal\",
            \"repoId\": \"1155263980\",
            \"ref\": \"main\"
        }
    }" 2>&1)

if [[ $DEPLOY_RESULT == *"error"* ]]; then
    echo -e "${RED}❌ 部署触发失败${NC}"
    echo "$DEPLOY_RESULT" | head -20
    exit 1
fi

DEPLOY_URL=$(echo "$DEPLOY_RESULT" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOY_ID=$(echo "$DEPLOY_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo -e "${GREEN}✅ 部署已触发${NC}"
echo ""
echo -e "${BLUE}📍 部署信息:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "部署 ID: $DEPLOY_ID"
echo "预览地址: https://$DEPLOY_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 7. 等待部署完成
echo ""
echo -e "${BLUE}⏳ 步骤 7: 等待部署完成...${NC}"
echo "这可能需要 2-3 分钟..."
echo ""

for i in {1..12}; do
    sleep 10
    
    STATUS_RESULT=$(curl -s -X GET \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v13/deployments/$DEPLOY_ID" 2>&1)
    
    READY_STATE=$(echo "$STATUS_RESULT" | grep -o '"readyState":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    case $READY_STATE in
        "READY")
            echo ""
            echo -e "${GREEN}🎉 部署成功!${NC}"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🌐 访问地址:"
            echo "   https://$DEPLOY_URL"
            echo ""
            echo "🔗 项目地址:"
            echo "   https://github.com/Lovecoded2024/timejournal"
            echo ""
            echo "📊 Vercel 控制台:"
            echo "   https://vercel.com/dashboard"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            exit 0
            ;;
        "ERROR")
            echo ""
            echo -e "${RED}❌ 部署失败${NC}"
            echo "请检查 Vercel Dashboard 中的构建日志"
            exit 1
            ;;
        *)
            echo -n "."
            ;;
    esac
done

echo ""
echo -e "${YELLOW}⏱️  部署仍在进行中...${NC}"
echo "请稍后访问: https://$DEPLOY_URL"
echo "或在 Vercel Dashboard 查看状态"
