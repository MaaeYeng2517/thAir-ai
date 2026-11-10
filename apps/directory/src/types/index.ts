export type Pricing = "free" | "freemium" | "paid";
export type Kind = "agent" | "model" | "tool" | "ide";

export type Item = {
  id: string;
  kind: Kind;
  name: string;
  company: string;
  icon: string;
  category: string;
  pricing: Pricing;
  tags: string[];
  rating: number;
  votes: number;
  desc: string;
  url: string;
  trending?: boolean;
  isNew?: boolean;
  isHot?: boolean;
  date?: string;
};

export type ModelItem = {
  id: string;
  name: string;
  creator: string;
  icon: string;
  desc: string;
  specs: { label: string }[];
  type: string;
  link: string;
  docsLink?: string;
  badges: string[];
  context?: string;
};
