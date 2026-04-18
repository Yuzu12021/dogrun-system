'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const menuItems = [
  {
    href: '/register',
    title: '新規登録',
    description: '飼い主様情報とわんちゃん情報を登録します。',
    emoji: '📝',
  },
  {
    href: '/checkin',
    title: 'チェックイン',
    description: '電話番号検索で来店するわんちゃんを選択します。',
    emoji: '🐾',
  },
  {
    href: '/checkout',
    title: 'チェックアウト',
    description: '利用時間を計算し、料金を表示して退店処理します。',
    emoji: '💳',
  },
];

export default function HomePage() {
  const [activeCount, setActiveCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        const data = await res.json();

        if (data.success) {
          setActiveCount(data.active_count);
        } else {
          setActiveCount(0);
        }
      } catch (error) {
        console.error(error);
        setActiveCount(0);
      }
    }

    fetchDashboard();

    const interval = setInterval(fetchDashboard, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-amber-200 bg-white/90 p-8 shadow-sm">
        <p className="text-sm font-semibold text-orange-700">受付トップ</p>
        <h2 className="mt-2 text-3xl font-bold text-stone-900">
          ドッグランの受付業務を
          <br className="hidden sm:block" />
          シンプルに管理
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          新規登録、チェックイン、チェックアウトを店舗タブレットからすぐ操作できます。
          まずは最小機能を整えつつ、見やすく扱いやすい画面にしていきましょう。
        </p>
      </section>

      <section className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-green-700">現在利用中</p>
        <p className="mt-2 text-5xl font-bold text-stone-900">
          {activeCount !== null ? activeCount : '...'}
          <span className="ml-2 text-lg font-medium text-stone-500">頭</span>
        </p>
        <p className="mt-3 text-sm text-stone-500">
          現在チェックイン中のわんちゃん数を表示しています。
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">{item.emoji}</div>
            <h3 className="mt-4 text-xl font-bold text-stone-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              {item.description}
            </p>
            <p className="mt-6 text-sm font-semibold text-orange-700 group-hover:text-orange-600">
              開く →
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}