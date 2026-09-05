import { PosterGridSkeleton } from "@/components/MediaGrid";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <div className="skeleton mb-6 h-8 w-56 rounded-lg" />
      <div className="skeleton mb-6 h-9 w-full max-w-md rounded-full" />
      <PosterGridSkeleton count={18} />
    </div>
  );
}
