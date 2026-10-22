"use client";

export function Loading({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-2.5 text-sm text-muted">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-line border-t-brand" />
        {text}
      </div>
    </div>
  );
}
