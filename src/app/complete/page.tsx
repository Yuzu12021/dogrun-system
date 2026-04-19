'use client';

import { Suspense } from 'react';
import CompleteContent from './CompleteContent';

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="p-6">読み込み中...</div>}>
      <CompleteContent />
    </Suspense>
  );
}