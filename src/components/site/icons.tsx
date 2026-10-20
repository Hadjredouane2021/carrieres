import {
  Briefcase,
  Calculator,
  Compass,
  GraduationCap,
  Handshake,
  Headset,
  Laptop,
  LineChart,
  MessagesSquare,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  calculator: Calculator,
  headset: Headset,
  scale: Scale,
  chart: LineChart,
  users: Users,
  laptop: Laptop,
  search: Search,
  sparkles: Sparkles,
  compass: Compass,
  handshake: Handshake,
  shield: ShieldCheck,
  messages: MessagesSquare,
  graduation: GraduationCap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = icons[name] ?? Sparkles;
  return <Cmp className={className} aria-hidden="true" />;
}
