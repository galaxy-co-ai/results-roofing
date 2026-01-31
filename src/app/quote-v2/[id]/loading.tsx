import { Loader2 } from 'lucide-react';

export default function QuoteV2Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-sandstone mx-auto" />
        <p className="mt-4 text-gray-600">Loading your quote...</p>
      </div>
    </div>
  );
}
