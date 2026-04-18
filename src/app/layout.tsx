import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ドッグラン受付システム',
  description: 'ドッグランの新規登録・チェックイン・チェックアウト管理',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-amber-200/70 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-orange-700">
                  LUCKLICK
                </p>
                <h1 className="text-lg font-bold text-stone-800">
                  ドッグラン受付システム
                </h1>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}