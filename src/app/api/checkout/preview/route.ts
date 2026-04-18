import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDogrunFee } from '@/lib/fee';
import { normalizePhoneNumber } from '@/lib/format';

export async function POST(req: Request) {
  try {
    const body = await req.json();
const normalizedPhone = normalizePhoneNumber(body.phone_number || '');

console.log('checkout preview input:', body.phone_number);
console.log('checkout preview normalized:', normalizedPhone);

const { data: owner, error: ownerError } = await supabase
  .from('owners')
  .select('*')
  .eq('phone_number', normalizedPhone)
  .maybeSingle();

console.log('checkout preview owner:', owner);

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

    const { data: visitDogRows, error: visitDogsError } = await supabase
      .from('visit_group_dogs')
      .select(`
        dog_id,
        dogs (
          id,
          name,
          dog_code
        )
      `)
      .eq('visit_group_id', activeVisit.id);

    if (visitDogsError) throw visitDogsError;

    const dogs = (visitDogRows || []).map((row: any) => row.dogs).filter(Boolean);
    const dogCount = dogs.length;

    const checkIn = new Date(activeVisit.checked_in_at);
    const now = new Date();

    const totalMinutes = Math.max(
      1,
      Math.ceil((now.getTime() - checkIn.getTime()) / 1000 / 60)
    );

    const totalFee = calculateDogrunFee(totalMinutes, dogCount);

    return NextResponse.json({
      success: true,
      owner: {
        id: owner.id,
        full_name: owner.full_name,
        phone_number: owner.phone_number,
      },
      visit_group: {
        id: activeVisit.id,
        checked_in_at: activeVisit.checked_in_at,
      },
      dogs,
      dog_count: dogCount,
      total_minutes: totalMinutes,
      total_fee: totalFee,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'チェックアウト確認情報の取得に失敗しました。' },
      { status: 500 }
    );
  }
}