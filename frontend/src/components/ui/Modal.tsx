"use client";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#161616]">{title}</h2>
          <button onClick={onClose} className="text-sm text-[#737373] hover:text-[#161616]">
            Tutup
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
