import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type CheckinBody = {
  owner_id: string;
  dog_ids: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckinBody;

    if (!body.owner_id || !body.dog_ids || body.dog_ids.length === 0) {
      return NextResponse.json(
        { success: false, message: '飼い主またはわんちゃんが未選択です。' },
        { status: 400 }
      );
    }

    const { data: dogs, error: dogsError } = await supabase
      .from('dogs')
      .select('*')
      .in('id', body.dog_ids);

    if (dogsError) throw dogsError;

    const today = new Date().toISOString().slice(0, 10);

    const expiredDogs = (dogs || []).filter(
      (dog) => dog.rabies_expiration_date < today
    );

    if (expiredDogs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: '狂犬病予防接種の有効期限切れのわんちゃんがいます。',
          expiredDogs: expiredDogs.map((dog) => dog.name),
        },
        { status: 400 }
      );
    }

    const { data: visitGroup, error: visitGroupError } = await supabase
      .from('visit_groups')
      .insert({
        owner_id: body.owner_id,
        status: 'checked_in',
      })
      .select()
      .single();

    if (visitGroupError) throw visitGroupError;

    const rows = body.dog_ids.map((dogId) => ({
      visit_group_id: visitGroup.id,
      dog_id: dogId,
    }));

    const { error: insertDogsError } = await supabase
      .from('visit_group_dogs')
      .insert(rows);

    if (insertDogsError) throw insertDogsError;

    return NextResponse.json({
      success: true,
      visit_group: visitGroup,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'チェックインに失敗しました。' },
      { status: 500 }
    );
  }
}