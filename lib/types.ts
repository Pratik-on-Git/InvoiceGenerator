// Data model for a Blue Moon Creatives document (quotation / invoice).
// The shape mirrors the printed layout 1:1 so rendering reproduces the design exactly.

export interface KV {
  k: string;
  v: string;
}

export interface LineItem {
  name: string;
  desc: string;
  qty: string;
  unit: string;
  amount: number;
}

export interface Deliverable {
  idx: string;
  price: string;
  name: string;
  meta: string;
  desc: string;
  includes: string[];
}

export interface Feature {
  title: string;
  desc: string;
}

export interface FeatureGroup {
  tag: string;
  title: string;
  range: string;
  items: Feature[];
}

export interface Milestone {
  n: string;
  title: string;
  pct: string;
  desc: string;
}

export interface Stat {
  k: string;
  v: string;
  sub: string;
}

export interface Requirement {
  letter: string;
  title: string;
  html: string; // rich (may contain <b>)
}

export interface Signature {
  name: string;
  role: string;
}

export interface Invoice {
  meta: {
    accent: string;
    docNoLabel: string;
    docNo: string;
    dateLabel: string;
    date: string;
    currency: string;
    brandFooter: string;
    docFooter: string;
  };
  brand: {
    logo: string; // URL or data URI
    name: string;
    tagline: string;
  };
  cover: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    sub: string;
  };
  provider: {
    label: string;
    name: string;
    lines: string[];
  };
  client: {
    label: string;
    name: string;
    lines: string[];
  };
  invest: {
    title: string;
    note: string;
    items: LineItem[];
    totalLabel: string;
    totalNote: string;
    advancePct: number;
  };
  scope: {
    enabled: boolean;
    num: string;
    title: string;
    lead: string; // rich
    deliverables: Deliverable[];
    note: string; // rich
  };
  features: {
    enabled: boolean;
    num: string;
    title: string;
    lead: string; // rich
    groups: FeatureGroup[];
  };
  terms: {
    enabled: boolean;
    num: string;
    title: string;
    items: string[]; // rich
    mileTag: string;
    mileTitle: string;
    milestones: Milestone[];
    stats: Stat[];
  };
  requirements: {
    enabled: boolean;
    num: string;
    title: string;
    lead: string; // rich
    items: Requirement[];
    note: string; // rich
  };
  payment: {
    enabled: boolean;
    num: string;
    title: string;
    bankLabel: string;
    bank: KV[];
    contactLabel: string;
    personName: string;
    personRole: string;
    contact: KV[];
    signTag: string;
    signTitle: string;
    signLead: string;
    signs: Signature[];
    thanksA: string;
    thanksB: string;
    thanksSub: string;
  };
}

export type SectionKey = "scope" | "features" | "terms" | "requirements" | "payment";
