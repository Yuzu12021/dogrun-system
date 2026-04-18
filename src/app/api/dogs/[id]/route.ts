import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, message: 'わんちゃん情報が見つかりません。' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dog: data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: '取得に失敗しました。' },
      { status: 500 }
    );
  }
}

function calcRabiesExpiration(dateString: string): string {
  const d = new Date(dateString);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const rabiesDate = body.rabies_vaccination_date;
    const vaccineDate = body.vaccine_vaccination_date || null;

    const { data, error } = await supabase
      .from('dogs')
      .update({
        rabies_vaccination_date: rabiesDate,
        rabies_expiration_date: calcRabiesExpiration(rabiesDate),
        vaccine_vaccination_date: vaccineDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      dog: data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: '更新に失敗しました。' },
      { status: 500 }
    );
  }
}