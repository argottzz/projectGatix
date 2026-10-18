"use client";

export function Loading({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex items-center gap-2 text-sm text-[#737373]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#FF6A00]" />
        {text}
      </div>
    </div>
  );
}
