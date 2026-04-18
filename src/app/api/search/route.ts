import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { normalizePhoneNumber } from '@/lib/format';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const normalized = normalizePhoneNumber(phone);

    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('*')
      .eq('phone_number', normalized)
      .maybeSingle();

    if (ownerError) throw ownerError;

    if (!owner) {
      return NextResponse.json({ success: false, message: '見つかりません' });
    }

    const { data: dogs, error: dogsError } = await supabase
  .from('dogs')
  .select('*')
  .eq('owner_id', owner.id)
  .order('dog_branch_no', { ascending: true });

if (dogsError) throw dogsError;

const today = new Date().toISOString().slice(0, 10);

const dogsWithStatus = (dogs || []).map((dog) => ({
  ...dog,
  rabies_valid: dog.rabies_expiration_date >= today,
}));

return NextResponse.json({
  success: true,
  owner,
  dogs: dogsWithStatus,
});
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: '検索失敗' },
      { status: 500 }
    );
  }
}