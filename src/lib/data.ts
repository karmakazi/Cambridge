export type Member = {
  id: string;
  name: string;
  title: string;
  organization: string;
  location: string;
  jurisdiction: string;
  practiceArea: string;
  expertise: string[];
  bio: string;
  forumsAttended: string[];
  steeringCommittee: boolean;
  contactEmail: string;
  contactPreference: "email" | "request-intro" | "private";
  discoverable: boolean; // cross-forum discovery opt-in
  avatar: string; // initials
};

export type Forum = {
  id: string;
  title: string;
  area: string;
  date: string;
  location: string;
  venue: string;
  status: "upcoming" | "past";
  participants: string[]; // member IDs
  agenda: AgendaItem[];
  materials: Material[];
  logistics: Logistics;
};

export type AgendaItem = {
  time: string;
  title: string;
  description: string;
  speaker?: string;
};

export type Material = {
  id: string;
  title: string;
  type: "pdf" | "slides" | "reading";
  size: string;
};

export type Logistics = {
  hotel: string;
  hotelAddress: string;
  dressCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

export const MEMBERS: Member[] = [
  {
    id: "m001",
    name: "Elena Marchetti",
    title: "Managing Partner",
    organization: "Marchetti & Silveira LLP",
    location: "Milan, Italy",
    jurisdiction: "European Union",
    practiceArea: "Antitrust",
    expertise: ["Competition Law", "Merger Control", "State Aid", "Digital Markets"],
    bio: "Elena leads one of Italy's foremost competition practices, advising multinationals on EU merger filings and cartel investigations. Former legal advisor to the European Commission.",
    forumsAttended: ["f001", "f004", "f007"],
    steeringCommittee: true,
    contactEmail: "e.marchetti@marchetti-silveira.com",
    contactPreference: "email",
    discoverable: true,
    avatar: "EM",
  },
  {
    id: "m002",
    name: "James Okafor",
    title: "General Counsel",
    organization: "Meridian Capital Group",
    location: "London, United Kingdom",
    jurisdiction: "United Kingdom",
    practiceArea: "Private Capital Markets",
    expertise: ["Private Equity", "Fund Formation", "Cross-border M&A", "Carried Interest"],
    bio: "James oversees all legal and compliance matters for a £4bn private equity firm. Previously a partner at a Magic Circle firm, specialising in leveraged buyouts across EMEA.",
    forumsAttended: ["f002", "f005"],
    steeringCommittee: false,
    contactEmail: "j.okafor@meridiancapital.com",
    contactPreference: "request-intro",
    discoverable: true,
    avatar: "JO",
  },
  {
    id: "m003",
    name: "Priya Anand",
    title: "Partner",
    organization: "Singh Anand & Associates",
    location: "Singapore",
    jurisdiction: "Asia-Pacific",
    practiceArea: "Privacy, Data & Cyber Security",
    expertise: ["PDPA Compliance", "Cross-border Data Transfers", "Incident Response", "AI Governance"],
    bio: "Priya is a leading data protection counsel in Southeast Asia, advising financial institutions and technology companies on regulatory compliance and cyber incident response.",
    forumsAttended: ["f003", "f006"],
    steeringCommittee: false,
    contactEmail: "p.anand@singhanandassoicates.com",
    contactPreference: "email",
    discoverable: true,
    avatar: "PA",
  },
  {
    id: "m004",
    name: "Marcus Holst",
    title: "Senior Partner",
    organization: "Holst Richter Rechtsanwälte",
    location: "Frankfurt, Germany",
    jurisdiction: "Germany",
    practiceArea: "Corporate Law & Finance",
    expertise: ["Restructuring", "Banking Law", "Debt Capital Markets", "ESG Finance"],
    bio: "Marcus advises leading German and international banks on complex financing structures, debt restructuring, and the emerging ESG-linked bond market.",
    forumsAttended: ["f001", "f005", "f008"],
    steeringCommittee: true,
    contactEmail: "m.holst@holst-richter.de",
    contactPreference: "email",
    discoverable: true,
    avatar: "MH",
  },
  {
    id: "m005",
    name: "Sophie Beaumont",
    title: "Chief Privacy Officer",
    organization: "Lumière Technologies",
    location: "Paris, France",
    jurisdiction: "European Union",
    practiceArea: "Privacy, Data & Cyber Security",
    expertise: ["GDPR", "AI Act Compliance", "Data Ethics", "DPO Advisory"],
    bio: "Sophie leads privacy strategy for a pan-European tech company, navigating the GDPR and the incoming AI Act across 12 jurisdictions. Former regulator at CNIL.",
    forumsAttended: ["f003", "f006", "f009"],
    steeringCommittee: false,
    contactEmail: "s.beaumont@lumiere-tech.com",
    contactPreference: "email",
    discoverable: false,
    avatar: "SB",
  },
  {
    id: "m006",
    name: "David Nkrumah",
    title: "Partner",
    organization: "Nkrumah Mensah & Partners",
    location: "Accra, Ghana",
    jurisdiction: "West Africa",
    practiceArea: "Corporate Law & Finance",
    expertise: ["Natural Resources", "Foreign Direct Investment", "Pan-African M&A", "Extractive Industries"],
    bio: "David advises governments and multinationals on natural resource transactions and foreign investment across anglophone West Africa. Recognized as a leading lawyer in Ghana for 12 consecutive years.",
    forumsAttended: ["f002", "f007"],
    steeringCommittee: false,
    contactEmail: "d.nkrumah@nkrumahmensah.com",
    contactPreference: "request-intro",
    discoverable: true,
    avatar: "DN",
  },
  {
    id: "m007",
    name: "Catherine Leroux",
    title: "Partner",
    organization: "Leroux Delacroix Avocats",
    location: "Montréal, Canada",
    jurisdiction: "Canada",
    practiceArea: "Dispute Resolution",
    expertise: ["International Arbitration", "Commercial Litigation", "Class Actions", "Energy Disputes"],
    bio: "Catherine has acted as counsel and arbitrator in over 80 international arbitral proceedings. She sits on the ICC Court of Arbitration and the LCIA Court.",
    forumsAttended: ["f004", "f008"],
    steeringCommittee: true,
    contactEmail: "c.leroux@lerouxdelacroix.ca",
    contactPreference: "email",
    discoverable: true,
    avatar: "CL",
  },
  {
    id: "m008",
    name: "Rajan Pillai",
    title: "Managing Director, Legal",
    organization: "GulfStream Asset Management",
    location: "Dubai, UAE",
    jurisdiction: "Middle East",
    practiceArea: "Family Office",
    expertise: ["Wealth Structuring", "Succession Planning", "Trust Law", "Sharia-Compliant Finance"],
    bio: "Rajan advises ultra-high-net-worth families across the Gulf on wealth preservation, family governance, and succession structures spanning multiple jurisdictions.",
    forumsAttended: ["f005", "f009"],
    steeringCommittee: false,
    contactEmail: "r.pillai@gulfstreanam.com",
    contactPreference: "private",
    discoverable: true,
    avatar: "RP",
  },
  {
    id: "m009",
    name: "Ingrid Svensson",
    title: "Head of Legal, Nordics",
    organization: "Nordic Green Energy AS",
    location: "Oslo, Norway",
    jurisdiction: "Nordic Countries",
    practiceArea: "ESG & Environmental Regulation",
    expertise: ["Renewable Energy Law", "Carbon Markets", "Environmental Permitting", "Green Finance"],
    bio: "Ingrid oversees legal strategy for a major Nordic renewable energy developer, advising on offshore wind, carbon trading, and the EU taxonomy for sustainable finance.",
    forumsAttended: ["f001", "f006"],
    steeringCommittee: false,
    contactEmail: "i.svensson@nordicgreenenergy.no",
    contactPreference: "email",
    discoverable: true,
    avatar: "IS",
  },
  {
    id: "m010",
    name: "Thomas Abernathy",
    title: "Partner",
    organization: "Abernathy Caldwell LLP",
    location: "New York, USA",
    jurisdiction: "United States",
    practiceArea: "Enforcement",
    expertise: ["DOJ Investigations", "FCPA", "White Collar Defense", "Whistleblower Claims"],
    bio: "Thomas is a former federal prosecutor who now leads one of New York's most prominent white collar defense practices, with a particular focus on FCPA and DOJ investigation response.",
    forumsAttended: ["f002", "f007", "f009"],
    steeringCommittee: false,
    contactEmail: "t.abernathy@abernathycaldwell.com",
    contactPreference: "email",
    discoverable: true,
    avatar: "TA",
  },
  {
    id: "m011",
    name: "Yuki Tanaka",
    title: "General Counsel",
    organization: "Tanaka Precision Industries",
    location: "Tokyo, Japan",
    jurisdiction: "Japan",
    practiceArea: "Compliance & Corporate Governance",
    expertise: ["Board Governance", "Listed Company Compliance", "Corporate Investigations", "ESG Reporting"],
    bio: "Yuki manages all legal and governance functions for a TSE-listed precision manufacturing group. Instrumental in the company's adoption of the Japanese Corporate Governance Code.",
    forumsAttended: ["f003", "f008"],
    steeringCommittee: false,
    contactEmail: "y.tanaka@tanaka-precision.co.jp",
    contactPreference: "email",
    discoverable: true,
    avatar: "YT",
  },
  {
    id: "m012",
    name: "Ana Cristina Vásquez",
    title: "Partner",
    organization: "Vásquez & Reyes Abogados",
    location: "Bogotá, Colombia",
    jurisdiction: "Latin America",
    practiceArea: "Land Use Planning & Infrastructure",
    expertise: ["Infrastructure Finance", "PPP Structures", "Urban Development", "Mining Concessions"],
    bio: "Ana Cristina leads the infrastructure practice at one of Colombia's foremost law firms, advising on toll roads, ports, energy projects, and urban development concessions across the region.",
    forumsAttended: ["f004", "f007"],
    steeringCommittee: false,
    contactEmail: "acv@vasquezreyes.com.co",
    contactPreference: "email",
    discoverable: true,
    avatar: "AV",
  },
  {
    id: "m013",
    name: "Hamish MacAllister",
    title: "Senior Partner",
    organization: "MacAllister Duncan & Co",
    location: "Edinburgh, Scotland",
    jurisdiction: "United Kingdom",
    practiceArea: "Private Client",
    expertise: ["Estate Planning", "Heritage Assets", "Agricultural Estates", "Cross-border Succession"],
    bio: "Hamish has advised landed estates and high-net-worth Scottish families for over two decades, with particular expertise in agricultural property reliefs and heritage asset planning.",
    forumsAttended: ["f005", "f009"],
    steeringCommittee: false,
    contactEmail: "h.macallister@macallisterduncan.co.uk",
    contactPreference: "request-intro",
    discoverable: true,
    avatar: "HM",
  },
  {
    id: "m014",
    name: "Fatima Al-Rashidi",
    title: "Partner",
    organization: "Al-Rashidi Legal Group",
    location: "Riyadh, Saudi Arabia",
    jurisdiction: "Middle East",
    practiceArea: "Corporate Law & Finance",
    expertise: ["Saudi Vision 2030", "Privatisation", "Capital Markets", "Foreign Investment"],
    bio: "Fatima advises on some of Saudi Arabia's most significant privatisation and capital market transactions. She played a key role in the legal structuring of several Vision 2030 giga-projects.",
    forumsAttended: ["f002", "f006"],
    steeringCommittee: false,
    contactEmail: "f.alrashidi@alrashidilegal.sa",
    contactPreference: "email",
    discoverable: true,
    avatar: "FA",
  },
  {
    id: "m015",
    name: "Robert Kowalski",
    title: "Managing Partner",
    organization: "Kowalski & Wiśniewski",
    location: "Warsaw, Poland",
    jurisdiction: "Central & Eastern Europe",
    practiceArea: "Antitrust",
    expertise: ["CEE Competition Law", "Bid Rigging", "Dawn Raids", "Leniency Applications"],
    bio: "Robert is the pre-eminent competition lawyer in Central Europe, acting for Fortune 500 companies in Polish and European competition investigations and merger control proceedings.",
    forumsAttended: ["f001", "f004"],
    steeringCommittee: false,
    contactEmail: "r.kowalski@kowalskiwisnewski.pl",
    contactPreference: "email",
    discoverable: true,
    avatar: "RK",
  },
];

// The current logged-in user (member ID m001 by default, overrideable by auth)
export const CURRENT_USER_ID = "m001";

export const FORUMS: Forum[] = [
  {
    id: "f001",
    title: "Annual European Competition Forum",
    area: "Antitrust",
    date: "2026-11-14",
    location: "Brussels, Belgium",
    venue: "Hotel Amigo",
    status: "upcoming",
    participants: ["m001", "m004", "m009", "m015"],
    agenda: [
      { time: "09:00", title: "Welcome & Introductions", description: "Chair's opening remarks and participant introductions.", speaker: "Elena Marchetti" },
      { time: "09:30", title: "Digital Markets Act: 18 Months In", description: "A roundtable assessment of DMA enforcement and its practical impact on designated gatekeepers.", speaker: "Panel" },
      { time: "11:00", title: "Break", description: "", },
      { time: "11:15", title: "Merger Control in Volatile Markets", description: "Discussion of recent DG COMP decisional practice and shifting remedies policy.", speaker: "Panel" },
      { time: "13:00", title: "Lunch", description: "Hosted lunch at the hotel. Informal networking." },
      { time: "14:30", title: "State Aid in the Green Transition", description: "Examining how energy subsidies and ESG incentives interact with EU state aid rules.", speaker: "Panel" },
      { time: "16:00", title: "Closing Discussion & Wrap-up", description: "Chair's summary and forward look.", speaker: "Elena Marchetti" },
      { time: "19:30", title: "Dinner", description: "Private dinner at Brasserie La Maison du Cygne." },
    ],
    materials: [
      { id: "mat001", title: "DMA Enforcement Summary — Oct 2026", type: "pdf", size: "1.2 MB" },
      { id: "mat002", title: "Merger Control Trends Q3 2026", type: "pdf", size: "890 KB" },
      { id: "mat003", title: "Pre-reading: State Aid & Green Deal", type: "reading", size: "340 KB" },
    ],
    logistics: {
      hotel: "Hotel Amigo",
      hotelAddress: "Rue de l'Amigo 1-3, 1000 Brussels",
      dressCode: "Business formal",
      contactName: "Sarah Chen",
      contactEmail: "s.chen@cambridgeforums.com",
      contactPhone: "+1 416 703 1577 ext.305",
      notes: "A room block is held under 'Cambridge Forums' until 1 November. Check-in from 15:00.",
    },
  },
  {
    id: "f002",
    title: "Private Capital Markets Forum",
    area: "Private Capital Markets",
    date: "2026-12-04",
    location: "London, United Kingdom",
    venue: "The Ned",
    status: "upcoming",
    participants: ["m002", "m006", "m010", "m014"],
    agenda: [
      { time: "09:00", title: "Welcome", description: "Opening remarks from the Chair.", speaker: "James Okafor" },
      { time: "09:30", title: "Secondary Markets & Liquidity", description: "The evolution of LP secondary transactions and GP-led restructurings.", speaker: "Panel" },
      { time: "11:00", title: "Break", description: "" },
      { time: "11:15", title: "Continuation Funds: Lessons Learned", description: "A candid discussion of deal structuring, conflicts, and LP expectations.", speaker: "Panel" },
      { time: "13:00", title: "Lunch", description: "" },
      { time: "14:30", title: "Emerging Markets Capital Raising", description: "Challenges and opportunities in West Africa, the Gulf, and Southeast Asia.", speaker: "Panel" },
      { time: "16:30", title: "Closing Remarks", description: "", speaker: "James Okafor" },
    ],
    materials: [
      { id: "mat004", title: "Global PE Market Update Q3 2026", type: "pdf", size: "2.1 MB" },
      { id: "mat005", title: "Continuation Fund Structures — Deck", type: "slides", size: "4.3 MB" },
    ],
    logistics: {
      hotel: "The Ned",
      hotelAddress: "27 Poultry, London EC2R 8AJ",
      dressCode: "Smart business",
      contactName: "Sarah Chen",
      contactEmail: "s.chen@cambridgeforums.com",
      contactPhone: "+1 416 703 1577 ext.305",
      notes: "Rooms available at The Ned at a preferential rate. Quote 'Cambridge Forums' when booking.",
    },
  },
  {
    id: "f003",
    title: "Data Privacy & AI Governance Forum",
    area: "Privacy, Data & Cyber Security",
    date: "2026-10-22",
    location: "Amsterdam, Netherlands",
    venue: "Pulitzer Amsterdam",
    status: "upcoming",
    participants: ["m003", "m005", "m011"],
    agenda: [
      { time: "09:00", title: "Welcome", description: "Opening remarks.", speaker: "Priya Anand" },
      { time: "09:30", title: "EU AI Act — Practical Implications", description: "Mapping high-risk AI systems to compliance obligations.", speaker: "Panel" },
      { time: "11:15", title: "Cross-Border Data Transfers Post-Schrems", description: "Standard contractual clauses and transfer impact assessments in practice.", speaker: "Panel" },
      { time: "13:00", title: "Lunch", description: "" },
      { time: "14:30", title: "Cyber Incident Response — A Crisis Simulation", description: "Tabletop exercise: 48 hours after a ransomware attack.", speaker: "Panel" },
      { time: "16:30", title: "Closing", description: "", speaker: "Priya Anand" },
    ],
    materials: [
      { id: "mat006", title: "EU AI Act — Compliance Roadmap", type: "pdf", size: "1.8 MB" },
      { id: "mat007", title: "SCCs Practical Guide 2026", type: "pdf", size: "920 KB" },
      { id: "mat008", title: "Incident Response Simulation Brief", type: "pdf", size: "440 KB" },
    ],
    logistics: {
      hotel: "Pulitzer Amsterdam",
      hotelAddress: "Prinsengracht 315-331, 1016 GZ Amsterdam",
      dressCode: "Smart casual",
      contactName: "Sarah Chen",
      contactEmail: "s.chen@cambridgeforums.com",
      contactPhone: "+1 416 703 1577 ext.305",
      notes: "Hotel is located in the heart of the canal belt. Airport transfer available on request.",
    },
  },
  {
    id: "f004",
    title: "Antitrust & Enforcement Roundtable",
    area: "Antitrust",
    date: "2025-09-18",
    location: "Washington D.C., USA",
    venue: "St. Regis Washington",
    status: "past",
    participants: ["m001", "m007", "m012", "m015"],
    agenda: [],
    materials: [
      { id: "mat009", title: "Forum Summary & Key Themes", type: "pdf", size: "680 KB" },
      { id: "mat010", title: "DOJ Antitrust Division — Enforcement Trends", type: "pdf", size: "1.1 MB" },
    ],
    logistics: {
      hotel: "St. Regis Washington D.C.",
      hotelAddress: "923 16th and K St NW, Washington, DC 20006",
      dressCode: "Business formal",
      contactName: "Sarah Chen",
      contactEmail: "s.chen@cambridgeforums.com",
      contactPhone: "+1 416 703 1577 ext.305",
      notes: "",
    },
  },
  {
    id: "f005",
    title: "Family Office & Private Wealth Forum",
    area: "Family Office",
    date: "2025-06-12",
    location: "Geneva, Switzerland",
    venue: "Beau-Rivage Hotel",
    status: "past",
    participants: ["m002", "m004", "m008", "m013"],
    agenda: [],
    materials: [
      { id: "mat011", title: "Forum Summary — June 2025", type: "pdf", size: "720 KB" },
      { id: "mat012", title: "Global Wealth Structures Outlook", type: "slides", size: "3.2 MB" },
    ],
    logistics: {
      hotel: "Beau-Rivage Hotel",
      hotelAddress: "13 Quai du Mont-Blanc, 1201 Genève",
      dressCode: "Business formal",
      contactName: "Sarah Chen",
      contactEmail: "s.chen@cambridgeforums.com",
      contactPhone: "+1 416 703 1577 ext.305",
      notes: "",
    },
  },
];

export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getForumById(id: string): Forum | undefined {
  return FORUMS.find((f) => f.id === id);
}

export function getForumsForMember(memberId: string): Forum[] {
  return FORUMS.filter((f) => f.participants.includes(memberId));
}
