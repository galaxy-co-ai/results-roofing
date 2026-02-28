'use client';

import dynamic from 'next/dynamic';

const RoofBuildExperience = dynamic(
  () => import('@/components/lab/RoofBuildExperience'),
  { ssr: false }
);

export default function LabPage() {
  return <RoofBuildExperience />;
}
