import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDogrunFee } from '@/lib/fee';
import { normalizePhoneNumber } from '@/lib/format';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const normalizedPhone = normalizePhoneNumber(body.phone_number || '');

    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    if (ownerError) throw ownerError;

    if (!owner) {
      return NextResponse.json(
        { success: false, message: '該当する飼い主が見つかりません。' },
        { status: 404 }
      );
    }

    const { data: activeVisit, error: visitError } = await supabase
      .from('visit_groups')
      .select('*')
      .eq('owner_id', owner.id)
      .eq('status', 'checked_in')
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (visitError) throw visitError;

    if (!activeVisit) {
      return NextResponse.json(
        { success: false, message: '現在チェックイン中の利用がありません。' },
        { status: 404 }
      );
    }

    const { data: visitDogs, error: visitDogsError } = await supabase
      .from('visit_group_dogs')
      .select('dog_id')
      .eq('visit_group_id', activeVisit.id);

    if (visitDogsError) throw visitDogsError;

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
      { success: false, message: 'チェックアウトに失敗しました。' },
      { status: 500 }
    );
  }
}