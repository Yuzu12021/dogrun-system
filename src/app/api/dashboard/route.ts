import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: activeVisitGroups, error: visitError } = await supabase
      .from('visit_groups')
      .select('id')
      .eq('status', 'checked_in');

    if (visitError) throw visitError;

    const visitGroupIds = (activeVisitGroups || []).map((row) => row.id);

    if (visitGroupIds.length === 0) {
      return NextResponse.json({
        success: true,
        active_count: 0,
      });
    }

    const { count, error: countError } = await supabase
      .from('visit_group_dogs')
      .select('*', { count: 'exact', head: true })
      .in('visit_group_id', visitGroupIds);

    if (countError) throw countError;

    return NextResponse.json({
      success: true,
      active_count: count || 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: '現在利用中頭数の取得に失敗しました。',
      },
      { status: 500 }
    );
  }
}