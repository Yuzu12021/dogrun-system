'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

type Dog = {
  id: string;
  name: string;
  dog_code: string;
  breed: string;
  rabies_vaccination_date: string;
  rabies_expiration_date: string;
  vaccine_vaccination_date: string | null;
};

export default function DogEditPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const dogId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [dog, setDog] = useState<Dog | null>(null);
  const [rabiesDate, setRabiesDate] = useState('');
  const [vaccineDate, setVaccineDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!shouldRedirect) return;

    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [shouldRedirect, router]);

  useEffect(() => {
    async function fetchDog() {
      if (!dogId) {
        setLoading(false);
        setMessage('わんちゃんIDが取得できませんでした。');
        return;
      }

      try {
        setLoading(true);
        setMessage('');

        const res = await fetch(`/api/dogs/${dogId}`);
        const data = await res.json();

        if (data.success) {
          setDog(data.dog);
          setRabiesDate(data.dog.rabies_vaccination_date || '');
          setVaccineDate(data.dog.vaccine_vaccination_date || '');
        } else {
          setMessage(data.message || '取得に失敗しました。');
        }
      } catch (error) {
        console.error(error);
        setMessage('取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }

    fetchDog();
  }, [dogId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setShouldRedirect(false);

    if (!dogId) {
      setMessage('わんちゃんIDが取得できませんでした。');
      return;
    }

    const ok = window.confirm(
      `${dog?.name ?? ''} の情報を更新します。\n\n` +
        `狂犬病接種日: ${rabiesDate}\n` +
        `ワクチン接種日: ${vaccineDate || '未入力'}\n\n` +
        'この内容で更新しますか？'
    );

    if (!ok) return;

    try {
      const res = await fetch(`/api/dogs/${dogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rabies_vaccination_date: rabiesDate,
          vaccine_vaccination_date: vaccineDate || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
  router.push('/complete?action=update');
} else {
  setMessage(data.message || '更新に失敗しました。');
}
    } catch (error) {
      console.error(error);
      setMessage('更新中にエラーが発生しました。');
    }
  }

  if (loading) {
    return <main className="p-6">読み込み中...</main>;
  }

  if (!dog) {
    return (
      <main className="p-6">
        <p>{message || 'わんちゃん情報が見つかりません。'}</p>
        <div className="mt-4">
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            トップページに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← トップページに戻る
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-indigo-500">
          わんちゃん情報更新
        </p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          狂犬病・ワクチン情報を更新
        </h2>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 border-b border-slate-100 pb-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">名前</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{dog.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">犬番号</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {dog.dog_code}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">犬種</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{dog.breed}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">現在の有効期限</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {dog.rabies_expiration_date}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              狂犬病接種日
            </label>
            <input
              type="date"
              value={rabiesDate}
              onChange={(e) => setRabiesDate(e.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ワクチン接種日（任意）
            </label>
            <input
              type="date"
              value={vaccineDate}
              onChange={(e) => setVaccineDate(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/checkin"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            チェックイン画面へ戻る
          </Link>

          <button
            type="submit"
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            更新する
          </button>
        </div>

        {message && (
          <div className="mt-4">
            <p className="text-sm font-medium text-indigo-600">{message}</p>
            {shouldRedirect && (
              <p className="mt-1 text-xs text-slate-500">
                5秒後にトップページへ戻ります。
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}