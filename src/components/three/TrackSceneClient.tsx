"use client";

import dynamic from "next/dynamic";

const TrackScene = dynamic(
  () => import("@/components/three/TrackScene").then((m) => m.TrackScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 items-center justify-center rounded-2xl bg-[var(--panel-2)] text-xs text-[var(--muted)] sm:h-48">
        Loading 3D…
      </div>
    ),
  },
);

export function TrackSceneClient({ track }: { track: string }) {
  return <TrackScene track={track} />;
}
