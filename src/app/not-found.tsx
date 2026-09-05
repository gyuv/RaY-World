import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState
        title="Page not found"
        message="We couldn't find what you were looking for — but the catalog is full of things to discover."
      />
    </div>
  );
}
