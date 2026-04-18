'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const [form, setForm] = useState({
    ownerName: '',
    ownerKana: '',
    ownerBirthDate: '',
    phoneNumber: '',
    email: '',
    postalCode: '',
    address: '',
    dogName: '',
    breed: '',
    dogBirthDate: '',
    identificationNumber: '',
    registrationCity: '',
    rabiesVaccinationDate: '',
    vaccineVaccinationDate: '',
  });

  useEffect(() => {
    if (!shouldRedirect) return;

    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [shouldRedirect, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setShouldRedirect(false);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: {
            full_name: form.ownerName,
            full_name_kana: form.ownerKana,
            birth_date: form.ownerBirthDate,
            phone_number: form.phoneNumber,
            email: form.email,
            postal_code: form.postalCode,
            address: form.address,
          },
          dog: {
            name: form.dogName,
            breed: form.breed,
            birth_date: form.dogBirthDate || undefined,
            identification_number: form.identificationNumber,
            registration_city: form.registrationCity,
            rabies_vaccination_date: form.rabiesVaccinationDate,
            vaccine_vaccination_date:
              form.vaccineVaccinationDate || undefined,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
  router.push('/complete?action=register');
} else {
  setMessage(data.message || '登録に失敗しました。');
}

    } catch (error) {
      console.error(error);
      setMessage('通信エラーが発生しました。');
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← トップページに戻る
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-indigo-500">新規登録</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          飼い主様とわんちゃんの情報を登録
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">飼い主様情報</h3>
          <p className="mt-1 text-sm text-slate-500">
            受付時の検索に使う電話番号は正確に入力してください。
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                名前（漢字フルネーム）
              </label>
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                ナマエ（フリガナ）
              </label>
              <input
                name="ownerKana"
                value={form.ownerKana}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                生年月日
              </label>
              <input
                name="ownerBirthDate"
                type="date"
                value={form.ownerBirthDate}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                電話番号
              </label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                メールアドレス（任意）
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                郵便番号
              </label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                住所
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">わんちゃん情報</h3>
          <p className="mt-1 text-sm text-slate-500">
            狂犬病接種日はチェックイン判定に使います。
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                名前
              </label>
              <input
                name="dogName"
                value={form.dogName}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                犬種
              </label>
              <input
                name="breed"
                value={form.breed}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                生年月日（任意）
              </label>
              <input
                name="dogBirthDate"
                type="date"
                value={form.dogBirthDate}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                鑑札番号 or マイクロチップ番号
              </label>
              <input
                name="identificationNumber"
                value={form.identificationNumber}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                登録市区町村
              </label>
              <input
                name="registrationCity"
                value={form.registrationCity}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                狂犬病接種日
              </label>
              <input
                name="rabiesVaccinationDate"
                type="date"
                value={form.rabiesVaccinationDate}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                ワクチン接種日（任意）
              </label>
              <input
                name="vaccineVaccinationDate"
                type="date"
                value={form.vaccineVaccinationDate}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>
        </section>

        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                入力内容を確認して登録してください。
              </p>
              {message && (
                <div>
                  <p className="mt-2 text-sm font-semibold text-indigo-600">
                    {message}
                  </p>
                  {shouldRedirect && (
                    <p className="mt-1 text-xs text-slate-500">
                      5秒後にトップページへ戻ります。
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              登録する
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}