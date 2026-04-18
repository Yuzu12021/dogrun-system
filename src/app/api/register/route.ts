import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { normalizePhoneNumber } from '@/lib/format';

type RegisterBody = {
  owner: {
    full_name: string;
    full_name_kana: string;
    birth_date: string;
    phone_number: string;
    email?: string;
    postal_code: string;
    address: string;
  };
  dog: {
    name: string;
    breed: string;
    birth_date?: string;
    identification_number: string;
    registration_city: string;
    rabies_vaccination_date: string;
    vaccine_vaccination_date?: string;
  };
};

function calcRabiesExpiration(dateString: string): string {
  const d = new Date(dateString);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterBody;
    const normalizedPhone = normalizePhoneNumber(body.owner.phone_number);

    const { data: existingOwner } = await supabase
      .from('owners')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    let ownerId: string;
    let ownerCode: number;

    if (!existingOwner) {
      const { data: insertedOwner, error: ownerError } = await supabase
        .from('owners')
        .insert({
          full_name: body.owner.full_name,
          full_name_kana: body.owner.full_name_kana,
          birth_date: body.owner.birth_date,
          phone_number: normalizedPhone,
          email: body.owner.email || null,
          postal_code: body.owner.postal_code,
          address: body.owner.address,
        })
        .select()
        .single();

      if (ownerError) throw ownerError;

      ownerId = insertedOwner.id;
      ownerCode = insertedOwner.owner_code;
    } else {
      ownerId = existingOwner.id;
      ownerCode = existingOwner.owner_code;
    }

    const { data: existingDogs, error: dogCountError } = await supabase
      .from('dogs')
      .select('dog_branch_no')
      .eq('owner_id', ownerId);

    if (dogCountError) throw dogCountError;

    const nextBranchNo = (existingDogs?.length || 0) + 1;
    const dogCode = `${ownerCode}_${nextBranchNo}`;

    const { data: insertedDog, error: dogError } = await supabase
      .from('dogs')
      .insert({
        owner_id: ownerId,
        dog_branch_no: nextBranchNo,
        dog_code: dogCode,
        name: body.dog.name,
        breed: body.dog.breed,
        birth_date: body.dog.birth_date || null,
        identification_number: body.dog.identification_number,
        registration_city: body.dog.registration_city,
        rabies_vaccination_date: body.dog.rabies_vaccination_date,
        rabies_expiration_date: calcRabiesExpiration(body.dog.rabies_vaccination_date),
        vaccine_vaccination_date: body.dog.vaccine_vaccination_date || null,
      })
      .select()
      .single();

    if (dogError) throw dogError;

    return NextResponse.json({
      success: true,
      owner_id: ownerId,
      owner_code: ownerCode,
      dog: insertedDog,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: '登録に失敗しました。' },
      { status: 500 }
    );
  }
}