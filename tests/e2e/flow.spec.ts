import { test, expect } from '@playwright/test'

test.describe('时光手记端到端测试', () => {
  test('首页加载正常', async ({ page }) => {
    await page.goto('/')
    
    // 验证页面标题
    await expect(page).toHaveTitle(/时光手记/)
    
    // 验证主要元素存在
    await expect(page.locator('h1', { hasText: '时光手记' })).toBeVisible()
    await expect(page.locator('text=用 AI 记录人生故事')).toBeVisible()
    
    // 验证开始创作按钮
    await expect(page.locator('a', { hasText: '开始创作' })).toBeVisible()
  })

  test('匿名登录流程', async ({ page }) => {
    await page.goto('/login')
    
    // 输入名字
    await page.fill('input[placeholder*="名字"]', '测试用户')
    
    // 点击登录
    await page.click('button:has-text("立即开始")')
    
    // 验证跳转到项目列表
    await expect(page).toHaveURL(/.*projects/)
    
    // 验证登录成功（显示用户菜单）
    await expect(page.locator('text=测试用户')).toBeVisible()
  })

  test('创建传记项目流程', async ({ page }) => {
    // 先登录
    await page.goto('/login')
    await page.fill('input[placeholder*="名字"]', '测试用户')
    await page.click('button:has-text("立即开始")')
    
    // 等待跳转到项目列表
    await page.waitForURL(/.*projects/)
    
    // 点击创建新项目
    await page.click('a:has-text("创建新项目")')
    
    // 填写表单
    await page.fill('input#subjectName', '张老先生')
    await page.fill('input#subjectBirthPlace', '北京')
    await page.fill('textarea#projectGoal', '送给父亲的生日礼物')
    
    // 提交表单
    await page.click('button[type="submit"]')
    
    // 验证跳转到项目详情
    await page.waitForURL(/.*projects\/.*/)
    
    // 验证项目名称显示
    await expect(page.locator('h1', { hasText: '张老先生' })).toBeVisible()
  })

  test('导航到上传资料页面', async ({ page }) => {
    // 先登录并创建项目
    await page.goto('/login')
    await page.fill('input[placeholder*="名字"]', '测试用户')
    await page.click('button:has-text("立即开始")')
    await page.waitForURL(/.*projects/)
    
    // 点击创建示例项目
    await page.click('button:has-text("创建示例项目")')
    
    // 等待跳转到项目详情
    await page.waitForURL(/.*projects\/.*/)
    
    // 点击上传资料
    await page.click('text=上传资料')
    
    // 验证跳转到上传页面
    await expect(page).toHaveURL(/.*upload/)
    
    // 验证上传区域存在
    await expect(page.locator('text=点击或拖拽文件到此处上传')).toBeVisible()
  })

  test('导航到访谈页面', async ({ page }) => {
    // 先登录并创建项目
    await page.goto('/login')
    await page.fill('input[placeholder*="名字"]', '测试用户')
    await page.click('button:has-text("立即开始")')
    await page.waitForURL(/.*projects/)
    
    // 点击创建示例项目
    await page.click('button:has-text("创建示例项目")')
    
    // 等待跳转到项目详情
    await page.waitForURL(/.*projects\/.*/)
    
    // 点击开始访谈
    await page.click('text=开始访谈')
    
    // 验证跳转到访谈页面
    await expect(page).toHaveURL(/.*interview/)
    
    // 验证聊天界面存在
    await expect(page.locator('text=AI 采访助手')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="输入消息"]')).toBeVisible()
  })

  test('导航到电子书预览页面', async ({ page }) => {
    // 先登录并创建项目
    await page.goto('/login')
    await page.fill('input[placeholder*="名字"]', '测试用户')
    await page.click('button:has-text("立即开始")')
    await page.waitForURL(/.*projects/)
    
    // 点击创建示例项目
    await page.click('button:has-text("创建示例项目")')
    
    // 等待跳转到项目详情
    await page.waitForURL(/.*projects\/.*/)
    
    // 点击查看传记
    await page.click('text=查看传记')
    
    // 验证跳转到电子书页面
    await expect(page).toHaveURL(/.*ebook/)
    
    // 验证章节内容存在
    await expect(page.locator('text=章节内容')).toBeVisible()
    await expect(page.locator('text=人生时间线')).toBeVisible()
  })
})
