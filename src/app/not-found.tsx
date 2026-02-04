import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Return to homepage
      </Link>
    </div>
  );
}
