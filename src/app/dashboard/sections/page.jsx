import { Suspense } from 'react';
import SectionsPageClient from './SectionsPageClient';

function SectionsPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading sections...</div>
    </div>
  );
}

export default function SectionsPage() {
  return (
    <Suspense fallback={<SectionsPageFallback />}>
      <SectionsPageClient />
    </Suspense>
  );
}2