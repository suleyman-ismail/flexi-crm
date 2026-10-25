export type WorkspaceId = '' | 'r';

export type NavTab = 'tasks' | 'sites' | 'clients' | 'workers' | 'reports' | 'messages';

export interface NextStepInfo {
  d: string; // YYYY-MM-DD
  t?: string; // HH:mm
  y: string; // Task type
  r?: string; // Rep
}

export interface SiteMeta {
  o: string; // '🔨 Тече' | '⏸️ Пауза' | '✅ Завършен' | ''
  w: string[]; // Assigned worker names
  nx?: NextStepInfo | null;
  sx?: NextStepInfo | null;
  la?: string; // Last activity date
  sd?: string;
  s0?: string; // Start date
  deal?: number;
  got?: number;
  cost?: number;
  owed?: number;
}

export interface ClientSummary {
  n: string; // Client Name
  p: string; // Phone
  c: string; // City
  s: string; // Stage
  r: string; // Responsible rep
  m: string; // Model
  b: number; // Budget / Offer (€)
  i: string; // Inquiry date (YYYY-MM-DD)
  l: string; // Last contact date
  nx: string; // Next task date
  maps?: string; // Google Maps URL / Coords
  x?: SiteMeta | null; // Present if client is an active/completed site
}

export interface TaskItem {
  id?: string;
  row: number;
  client: string;
  type: string;
  date: string;
  time: string;
  remind: string;
  desc: string;
  rep: string;
  phone?: string;
  city?: string;
  maps?: string;
  status?: string;
  seen?: boolean;
  tmp?: boolean;
}

export interface WorkerJob {
  c: string; // Client
  j: string; // Job description
  d: string; // Date
  a: number; // Agreed amount
  pd: number; // Paid amount
  ow: number; // Owed amount
  jid?: string;
}

export interface WorkerItem {
  n: string; // Name
  p: string; // Phone
  sp: string; // Specialty
  city: string;
  r: number; // Rating 1-5
  tags: string;
  note: string;
  owed: number;
  paid: number;
  jobs: WorkerJob[];
}

export interface PartnerItem {
  n: string; // Partner Name
  p: string; // Phone
  t: string; // Category (Фабрика, Дограма, и др.)
  w: string; // What they supply/do
  city: string;
  ct: string; // Contact person
  r: number; // Rating 1-5
  note: string;
}

export interface OwedSummary {
  w: string; // Worker name
  a: number; // Amount owed
  c: string[]; // Clients list
}

export interface UserPermissions {
  a?: boolean; // Admin
  f?: boolean; // Finance access
  d?: boolean; // Can delete
  k?: boolean; // Cost calculations in Pad
  o?: boolean; // Own clients only
  r?: boolean; // Renovations workspace access
  boss?: boolean; // Owner dashboard access
}

export interface AppData {
  me: string;
  today: string;
  adm?: boolean;
  ws?: string;
  wsr?: boolean;
  perm?: UserPermissions;
  stages: string[];
  closed: string[];
  models: string[];
  sources: string[];
  types: string[];
  siteT?: string[];
  reps: string[];
  expCats?: string[];
  wtags?: string[];
  ptypes?: string[];
  clients: ClientSummary[];
  tasks: TaskItem[];
  workers: WorkerItem[];
  partners: PartnerItem[];
  owed?: OwedSummary[];
  pk?: string;
}

export interface DealRecord {
  id: string;
  desc: string;
  amount: number;
  date: string;
  due?: string;
  note?: string;
  status?: string; // 'done' | ''
}

export interface CostRecord {
  id: string;
  date: string;
  amount: number;
  desc?: string;
  type?: string;
  method?: string;
  note?: string;
  jid?: string;
  wk?: string;
}

export interface WorkerCostGroup {
  id: string;
  name: string;
  job: string;
  agreed: number;
  paid: number;
  owed: number;
  date: string;
  jid?: string;
  pays: CostRecord[];
}

export interface ClientCosts {
  deal: number;
  got: number;
  cost: number;
  owed: number;
  nf?: boolean;
  deals: DealRecord[];
  inc: CostRecord[];
  exp: CostRecord[];
  workers: WorkerCostGroup[];
}

export interface MediaPhoto {
  id: string;
  name: string;
  thumb: string;
  view?: string;
  url?: string;
  t?: number;
  j?: string;
  note?: string;
  beforeAfter?: 'before' | 'after';
}

export interface MediaFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  url: string;
  t?: number;
  j?: string;
  note?: string;
}

export interface ClientCard {
  name: string;
  phone: string;
  city: string;
  stage: string;
  rep: string;
  model: string;
  budget: number | string;
  src: string;
  inq: string;
  last: string;
  notes: string;
  maps: string;
  lostR?: string;
  h?: string;
  stub?: boolean;
  mediaOk?: boolean;
  photoErr?: string;
  folder?: string;
  tasks: TaskItem[];
  costs: ClientCosts | null;
  photos: MediaPhoto[];
  files: MediaFile[];
}

export interface PadCheckItem {
  x: string;
  d: boolean;
}

export interface PadCostRow {
  n: string;
  q: number | string;
  p: number | string;
}

export interface PadBlock {
  id: string;
  t: 'note' | 'idea' | 'cost' | 'check' | 'link' | 'folder' | 'file';
  title: string;
  text?: string;
  url?: string;
  f?: string; // Folder ID
  pin?: number;
  col?: string;
  u?: number;
  items?: PadCheckItem[];
  rows?: PadCostRow[];
  m?: number; // Markup %
  name?: string;
  mime?: string;
  size?: number;
  fid?: string;
}

export interface PadDocument {
  v: number;
  u: number;
  blocks: PadBlock[];
}

export interface ChatConv {
  id: string;
  n: string;
  g?: boolean;
  un: number;
  t: number;
  x: string;
  f: string;
  mine?: boolean;
}

export interface ChatMessage {
  id: string;
  t: number;
  f: string;
  x: string;
  r?: number;
  tmp?: boolean;
  q?: { id: string; f: string; x: string } | null;
  a?: {
    k: 'file' | 'card' | 'del';
    id?: string;
    name?: string;
    mime?: string;
    th?: string;
    n?: string;
    ws?: string;
    title?: string;
    s?: string;
    up?: number;
  } | null;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  undoLabel?: string;
  onUndo?: () => void;
}
