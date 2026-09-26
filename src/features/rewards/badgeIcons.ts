import {
  Award,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Compass,
  Eye,
  Flame,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** One icon per badge key (server: app/services/rewards.py). */
export const BADGE_ICON: Record<string, LucideIcon> = {
  "first-200": Zap,
  briefed: BookOpen,
  "warmed-up": Sunrise,
  cleared: Lightbulb,
  "no-hint-hero": ShieldCheck,
  "three-districts": Award,
  "combo-5": Flame,
  "sharp-eye": Eye,
  "daily-5": CalendarDays,
  "found-start": Compass,
  "streak-3": CalendarCheck,
  "streak-7": Sparkles,
};
