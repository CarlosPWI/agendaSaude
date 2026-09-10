import { Skeleton } from "./ui/skeleton";

interface ListSkeletonProps {
  rows?: number;
  label?: string;
}

/**
 * Estado de carregamento em skeleton para listas/tabelas.
 */
export function ListSkeleton({
  rows = 6,
  label = "Carregando...",
}: ListSkeletonProps) {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>

      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-14 w-full rounded-lg"
        />
      ))}
    </div>
  );
}
