'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type CompleteConfig = {
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
  ringClass: string;
};

const COMPLETE_MAP: Record<string, CompleteConfig> = {
  register: {
    title: '登録が完了しました',
    description: '飼い主様とわんちゃんの情報を登録しました。',
    emoji: '📝',
    colorClass: 'text-orange-700',
    ringClass: 'bg-orange-50 border-orange-200',
  },
  checkin: {
    title: 'チェックインが完了しました',
    description: '受付処理が完了しました。ご利用をお楽しみください。',
    emoji: '🐾',
    colorClass: 'text-green-700',
    ringClass: 'bg-green-50 border-green-200',
  },
  checkout: {
    title: 'チェックアウトが完了しました',
    description: '精算処理が完了しました。ご利用ありがとうございました。',
    emoji: '💳',
    colorClass: 'text-amber-700',
    ringClass: 'bg-amber-50 border-amber-200',
  },
  update: {
    title: '更新が完了しました',
    description: 'わんちゃん情報を更新しました。',
    emoji: '✅',
    colorClass: 'text-emerald-700',
    ringClass: 'bg-emerald-50 border-emerald-200',
  },
};

function formatTime(dateString: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || 'register';
  const checkedInAt = searchParams.get('checkedInAt');

  const config = useMemo(
    () => COMPLETE_MAP[action] || COMPLETE_MAP.register,
    [action]
  );

  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
      <section className="w-full rounded-[32px] border border-orange-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full border text-5xl ${config.ringClass}`}
          >
            {config.emoji}
          </div>

          <p className={`mt-6 text-sm font-semibold ${config.colorClass}`}>
            COMPLETE
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {config.title}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            {config.description}
          </p>

          {action === 'checkin' && checkedInAt && (
            <div className="mt-6 w-full rounded-3xl border border-green-100 bg-green-50 px-6 py-5">
              <p className="text-sm text-green-700">チェックイン時刻</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatTime(checkedInAt)}
              </p>
            </div>
          )}

          <div className="mt-8 w-full rounded-3xl bg-amber-50 px-6 py-5">
            <p className="text-sm text-amber-700">自動遷移</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {seconds}秒後にトップページへ戻ります
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              今すぐトップへ戻る
            </Link>

            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              前の画面へ戻る
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}