'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Dog = {
  id: string;
  name: string;
  dog_code: string;
  rabies_expiration_date: string;
  rabies_valid: boolean;
};

type Owner = {
  id: string;
  full_name: string;
  phone_number: string;
};

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

export default function CheckInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [owner, setOwner] = useState<Owner | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!shouldRedirect) return;

    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [shouldRedirect, router]);

  async function handleSearch() {
    setMessage('');
    setShouldRedirect(false);
    setSelectedDogIds([]);

    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (data.success) {
      setOwner(data.owner);
      setDogs(data.dogs || []);
    } else {
      setOwner(null);
      setDogs([]);
      setMessage(data.message || '見つかりませんでした。');
    }
  }

  function toggleDog(id: string) {
    setSelectedDogIds((prev) =>
      prev.includes(id) ? prev.filter((dogId) => dogId !== id) : [...prev, id]
    );
  }

  async function handleCheckin() {
    if (!owner) return;

    if (selectedDogIds.length === 0) {
      setMessage('チェックインするわんちゃんを選択してください。');
      return;
    }

    const selectedDogs = dogs.filter((dog) => selectedDogIds.includes(dog.id));
    const dogNames = selectedDogs.map((dog) => dog.name).join('、');

    const ok = window.confirm(
      `${owner.full_name} 様\n対象: ${dogNames}\n\nこの内容でチェックインしますか？`
    );

    if (!ok) return;

    setMessage('');
    setShouldRedirect(false);

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_id: owner.id,
        dog_ids: selectedDogIds,
      }),
    });

    const data = await res.json();

    if (data.success) {
  const checkedInAt = data.visit_group.checked_in_at;
  router.push(
    `/complete?action=checkin&checkedInAt=${encodeURIComponent(checkedInAt)}`
  );
} else {
  if (data.expiredDogs?.length) {
    setMessage(`${data.message} 対象: ${data.expiredDogs.join('、')}`);
  } else {
    setMessage(data.message || 'チェックインに失敗しました。');
  }
}
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← トップページに戻る
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-indigo-500">チェックイン</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          電話番号で検索して来店するわんちゃんを選択
        </h2>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="電話番号を入力"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClassName}
          />
          <button
            onClick={handleSearch}
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            検索
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
      </section>

      {owner && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">検索結果</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {owner.full_name} 様
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              電話番号: {owner.phone_number}
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className={`rounded-2xl border px-4 py-4 transition ${
                  dog.rabies_valid
                    ? selectedDogIds.includes(dog.id)
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedDogIds.includes(dog.id)}
                      disabled={!dog.rabies_valid}
                      onChange={() => toggleDog(dog.id)}
                      className="h-5 w-5"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{dog.name}</p>
                      <p className="text-sm text-slate-500">{dog.dog_code}</p>
                    </div>
                  </label>

                  {dog.rabies_valid ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      狂犬病有効
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2 sm:items-end">
                      <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                        狂犬病期限切れ
                      </span>
                      <Link
                        href={`/dogs/${dog.id}/edit`}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                      >
                        更新する
                      </Link>
                    </div>
                  )}
                </div>

                {!dog.rabies_valid && (
                  <p className="mt-3 text-sm text-rose-700">
                    有効期限: {dog.rabies_expiration_date}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-600">
              選択中: <span className="font-bold">{selectedDogIds.length}</span> 頭
            </p>
            <button
              onClick={handleCheckin}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              チェックイン確定
            </button>
          </div>
        </section>
      )}
    </div>
  );
}