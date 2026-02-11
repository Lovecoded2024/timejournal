-- Supabase Auth 配置
-- 在 Supabase Dashboard > Authentication > Providers 中启用 Anonymous sign-ins

-- 或者在 SQL Editor 中执行以下命令启用匿名登录

-- 注意：匿名登录需要在 Supabase Dashboard 中手动启用
-- 路径：Project Settings > Authentication > Anonymous sign-ins > Enable

-- 可选：设置匿名用户的默认权限
CREATE POLICY "Anonymous users can create projects" 
ON biography_projects 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anonymous users can view own projects" 
ON biography_projects 
FOR SELECT 
TO anon, authenticated
USING (auth.uid() = user_id);

-- 更新现有表的 RLS 策略以允许匿名用户
ALTER POLICY "Allow all" ON biography_projects TO anon, authenticated;
ALTER POLICY "Allow all" ON uploads TO anon, authenticated;
ALTER POLICY "Allow all" ON interview_sessions TO anon, authenticated;
ALTER POLICY "Allow all" ON interview_messages TO anon, authenticated;
ALTER POLICY "Allow all" ON ai_memory TO anon, authenticated;
ALTER POLICY "Allow all" ON ebooks TO anon, authenticated;