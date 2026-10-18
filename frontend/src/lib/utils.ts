export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number | string): string {
  const n = Number(price);
  if (Number.isNaN(n)) return String(price);
  if (n === 0) return "Gratis";
  return "Rp" + n.toLocaleString("id-ID");
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
