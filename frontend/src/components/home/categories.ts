import { Music, Presentation, Cpu, Trophy, Wrench, Users } from "lucide-react";

export interface Category {
  label: string;
  keyword: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

export const CATEGORIES: Category[] = [
  { label: "Musik", keyword: "musik", icon: Music },
  { label: "Seminar", keyword: "seminar", icon: Presentation },
  { label: "Teknologi", keyword: "teknologi", icon: Cpu },
  { label: "Olahraga", keyword: "olahraga", icon: Trophy },
  { label: "Workshop", keyword: "workshop", icon: Wrench },
  { label: "Komunitas", keyword: "komunitas", icon: Users },
];
