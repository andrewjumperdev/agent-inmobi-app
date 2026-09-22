/**
 * Iconografía única del producto.
 *
 * Antes convivían DOS sistemas: lucide-react en 28 archivos y Material Symbols
 * en 30. No es solo inconsistencia visual —trazo de 2px contra glifos de fuente,
 * con métricas y pesos distintos que nunca alinean— sino un bug: Material se
 * cargaba como webfont de Google, así que hasta que bajaba, cada icono se veía
 * como su palabra literal. "campaign", "smart_toy", "support_agent" escritos en
 * el medio de la interfaz, en cada carga fría y para siempre si la fuente no
 * llegaba.
 *
 * Ahora hay uno solo, y los nombres son semánticos: la UI pide "el icono de
 * captación", no "Megaphone". Si mañana Megaphone se reemplaza, se cambia acá y
 * cambia en todos lados.
 *
 * Un nombre inexistente es un error de TypeScript, no un hueco en blanco.
 */
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BookmarkPlus,
  Calculator,
  Calendar,
  Check,
  Circle,
  CheckCircle2,
  Dot,
  ChevronRight,
  CircleUser,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Flame,
  Gauge,
  Globe,
  Bell,
  Headset,
  Home,
  Image,
  Images,
  Hourglass,
  Inbox,
  Info,
  LayoutDashboard,
  LineChart,
  Link2,
  LogIn,
  Magnet,
  Mail,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Minus,
  MonitorSmartphone,
  Network,
  Package,
  Rocket,
  Phone,
  PlayCircle,
  Plug,
  PlusCircle,
  Power,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  SquareCheckBig,
  Star,
  Tag,
  Timer,
  TrendingUp,
  User,
  UserPlus,
  Users,
  UserSearch,
  Workflow,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* El mapa semántico. La clave es lo que la interfaz quiere decir; el valor, con
   qué se dibuja hoy. Se conservan los nombres que venían de Material para que
   la migración fuera mecánica y revisable de a un archivo por vez. */
export const ICONS = {
  // Navegación y secciones
  dashboard: LayoutDashboard,
  space_dashboard: LayoutDashboard,
  group: Users,
  campaign: Megaphone,
  headset_mic: Headset,
  support_agent: Headset,
  article: FileText,
  forum: MessagesSquare,
  bar_chart: BarChart3,
  query_stats: LineChart,
  power: Plug,
  account_circle: CircleUser,
  home: Home,
  magnet: Magnet,

  // Agentes y automatización
  smart_toy: Bot,
  auto_awesome: Sparkles,
  hub: Network,
  conversion_path: Workflow,
  speed: Gauge,

  // Estado y feedback
  check: Check,
  check_circle: CheckCircle2,
  verified: BadgeCheck,
  info: Info,
  star: Star,
  local_fire_department: Flame,
  shield_with_heart: ShieldCheck,
  schedule: Clock,
  timer: Timer,
  calendar_month: Calendar,

  // Acciones
  close: X,
  remove: Minus,
  add_circle: PlusCircle,
  person_add: UserPlus,
  person_search: UserSearch,
  bookmark_add: BookmarkPlus,
  save: Save,
  search: Search,
  copy: Copy,
  send: Send,
  settings: Settings,
  play_circle: PlayCircle,
  arrow_forward: ArrowRight,
  arrow_downward: ArrowDown,
  chevron_right: ChevronRight,
  open_in_new: ExternalLink,
  link: Link2,
  input: LogIn,

  // Selección (los check_box de Material)
  check_box: SquareCheckBig,
  check_box_outline_blank: Square,
  radio_button_unchecked: Circle,
  content_copy: Copy,
  hourglass_top: Hourglass,
  person: User,

  // Canales y datos
  chat: MessageSquare,
  mail: Mail,
  phone: Phone,
  web: Globe,
  inbox: Inbox,
  inventory_2: Package,
  image: Image,
  view_carousel: Images,
  fiber_manual_record: Dot,
  verified_user: ShieldCheck,
  notifications_active: Bell,
  sell: Tag,
  devices: MonitorSmartphone,
  calculate: Calculator,
  trending_up: TrendingUp,
  construction: Wrench,
  bolt: Zap,
  rocket_launch: Rocket,
} as const;

export type IconName = keyof typeof ICONS;

/**
 * Tamaños en la escala del producto. Los números sueltos por toda la interfaz
 * eran parte de por qué se veía desprolijo: el mismo icono aparecía en 14, 16,
 * 17, 18 y 20px según quién escribió la pantalla.
 */
const SIZES = { xs: 13, sm: 15, md: 17, lg: 20, xl: 24 } as const;

/**
 * Valida un nombre que viene de afuera del código —los diccionarios de i18n
 * guardan el icono como string en un JSON— y cae a un default si no existe.
 *
 * No es un cast: un cast le haría creer al compilador que el dato es válido y
 * el error saldría en runtime como un icono en blanco. Acá una traducción con
 * un nombre viejo degrada a un punto neutro y deja el aviso en consola, que es
 * lo que alguien puede accionar.
 */
export function asIconName(value: string, fallback: IconName = "fiber_manual_record"): IconName {
  if (value in ICONS) return value as IconName;
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[Icon] nombre desconocido: "${value}" — revisá el diccionario`);
  }
  return fallback;
}

export function Icon({
  name,
  size = "md",
  className,
  style,
}: {
  name: IconName;
  size?: keyof typeof SIZES;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Cmp: LucideIcon = ICONS[name];
  const px = SIZES[size];
  return (
    <Cmp
      width={px}
      height={px}
      // shrink-0 siempre: un icono aplastado dentro de un flex es el defecto
      // visual más común de todos y el más fácil de no ver al escribirlo.
      className={className ? `shrink-0 ${className}` : "shrink-0"}
      style={style}
      strokeWidth={2}
      aria-hidden
    />
  );
}
