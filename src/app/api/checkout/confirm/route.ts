import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDogrunFee } from '@/lib/fee';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const visitGroupId = body.visit_group_id;

    const { data: activeVisit, error: visitError } = await supabase
      .from('visit_groups')
      .select('*')
      .eq('id', visitGroupId)
      .eq('status', 'checked_in')
      .maybeSingle();

    if (visitError) throw visitError;

    if (!activeVisit) {
      return NextResponse.json(
        { success: false, message: '対象のチェックイン情報が見つかりません。' },
        { status: 404 }
      );
    }

    const { data: visitDogs } = await supabase
      .from('visit_group_dogs')
      .select('dog_id')
      .eq('visit_group_id', activeVisit.id);

    const dogCount = visitDogs?.length || 0;

    const checkIn = new Date(activeVisit.checked_in_at);
    const checkOut = new Date();

    const totalMinutes = Math.max(
      1,
      Math.ceil((checkOut.getTime() - checkIn.getTime()) / 1000 / 60)
    );

    const totalFee = calculateDogrunFee(totalMinutes, dogCount);

    const { data: updatedVisit, error: updateError } = await supabase
      .from('visit_groups')
      .update({
        checked_out_at: checkOut.toISOString(),
        status: 'checked_out',
        total_minutes: totalMinutes,
        total_fee: totalFee,
      })
      .eq('id', activeVisit.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      visit_group: updatedVisit,
      dog_count: dogCount,
      total_minutes: totalMinutes,
      total_fee: totalFee,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'チェックアウト確定に失敗しました。' },
      { status: 500 }
    );
  }
}