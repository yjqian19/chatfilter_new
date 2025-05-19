import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = session.user;

  // 在用户表中创建或更新用户
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unnamed User',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to ensure user info:', error);
    return NextResponse.json(
      { error: 'Failed to save user info' },
      { status: 500 }
    );
  }

  // 确保默认群组存在
  const defaultGroupId = '00000000-0000-0000-0000-000000000001';

  // 检查默认群组是否存在
  const { data: existingGroup } = await supabase
    .from('chat_groups')
    .select('id')
    .eq('id', defaultGroupId)
    .maybeSingle();

  // 如果不存在，创建默认群组
  if (!existingGroup) {
    await supabase
      .from('chat_groups')
      .insert({
        id: defaultGroupId,
        name: 'Default Group',
        owner_id: user.id
      });
  }

  return NextResponse.json(data);
}
