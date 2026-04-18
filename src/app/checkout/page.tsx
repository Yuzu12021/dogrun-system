'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const inputClassName =
  'w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

type PreviewResult = {
  owner: {
    id: string;
    full_name: string;
    phone_number: string;
  };
  visit_group: {
    id: string;
    checked_in_at: string;
  };
  dogs: {
    id: string;
    name: string;
    dog_code: string;
  }[];
  dog_count: number;
  total_minutes: number;
  total_fee: number;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  async function handlePreview() {
    setMessage('');
    setPreview(null);

    try {
      const res = await fetch('/api/checkout/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone }),
      });

      const data = await res.json();

      if (data.success) {
        setPreview(data);
      } else {
        setMessage(data.message || '確認情報の取得に失敗しました。');
      }
    } catch (error) {
      console.error(error);
      setMessage('通信エラーが発生しました。');
    }
  }

  async function handleConfirmCheckout() {
    if (!preview) return;

    const dogNames = preview.dogs.map((dog) => dog.name).join('、');
    const nowIso = new Date().toISOString();

    const ok = window.confirm(
      `${preview.owner.full_name} 様\n` +
        `対象: ${dogNames}\n` +
        `チェックイン時刻: ${formatTime(preview.visit_group.checked_in_at)}\n` +
        `チェックアウト時刻: ${formatTime(nowIso)}\n` +
        `経過時刻: ${preview.total_minutes}分\n` +
        `料金: ${preview.total_fee}円\n\n` +
        'この内容でチェックアウトしますか？'
    );

    if (!ok) return;

    setMessage('');

    try {
      const res = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_group_id: preview.visit_group.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/complete?action=checkout');
      } else {
        setMessage(data.message || 'チェックアウトに失敗しました。');
      }
    } catch (error) {
      console.error(error);
      setMessage('通信エラーが発生しました。');
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex rounded-2xl border border-amber-200 bg-white px-5 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
        >
          ← トップページに戻る
        </Link>
      </div>

      <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-orange-700">チェックアウト</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          電話番号から現在の利用を確認
        </h2>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="電話番号を入力"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClassName}
          />
          <button
            onClick={handlePreview}
            className="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            利用状況を確認
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm font-medium text-orange-700">{message}</p>
        )}
      </section>

      {preview && (
        <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="border-b border-amber-100 pb-4">
            <p className="text-sm text-amber-700">チェックアウト確認</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              {preview.owner.full_name} 様
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              電話番号: {preview.owner.phone_number}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="text-sm text-orange-700">来店頭数</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {preview.dog_count}頭
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-green-700">チェックイン時刻</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatTime(preview.visit_group.checked_in_at)}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">チェックアウト時刻</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatTime(new Date().toISOString())}
              </p>
            </div>

            <div className="rounded-2xl bg-lime-50 p-4">
              <p className="text-sm text-lime-700">経過時刻</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {preview.total_minutes}分
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-sm text-stone-600">料金</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {preview.total_fee}円
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-slate-700">
              対象のわんちゃん
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {preview.dogs.map((dog) => (
                <div
                  key={dog.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  <p className="font-semibold text-slate-900">{dog.name}</p>
                  <p className="text-sm text-slate-500">{dog.dog_code}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleConfirmCheckout}
              className="rounded-2xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              この内容でチェックアウト
            </button>
          </div>
        </section>
      )}
    </div>
  );
}