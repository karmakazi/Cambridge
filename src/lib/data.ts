export type Member = {
  id: string;
  name: string;
  title: string;
  organization: string;
  location: string;
  address: string;
  phone: string;
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
  photo: string; // URL
};

export type Forum = {
  id: string;
  programId: string;
  title: string;
  area: string;
  editionYear: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  location: string;
  venue: string;
  status: "upcoming" | "past";
  participants: string[]; // member IDs
  websiteUrl: string;
  factSheetUrl: string;
  materialsBundleUrl: string;
  memberFees: Record<string, string>;
  agenda: AgendaItem[];
  materials: Material[];
  logistics: Logistics;
};

export type AgendaItem = {
  time: string;
  title: string;
  description: string;
  speaker?: string;
  speakerMemberId?: string;
  venueName?: string;
  venueAddress?: string;
};

export type Material = {
  id: string;
  title: string;
  type: "pdf" | "slides" | "reading";
  size: string;
  url: string;
  category: "required" | "supplementary";
  publishedAt: string;
  revision: number;
};

export type ForumEditionSummary = {
  id: string;
  programId: string;
  title: string;
  year: number;
  location: string;
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

export type ForumDirector = {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  avatar: string;
};

export const MEMBERS: Member[] = [
  {
    id: "m001",
    name: "Elena Marchetti",
    title: "Managing Partner",
    organization: "Marchetti & Silveira LLP",
    location: "Milan, Italy",
    address: "Via Montenapoleone 8, 20121 Milan, Italy",
    phone: "+39 02 7634 8800",
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
    photo: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "m002",
    name: "James Okafor",
    title: "General Counsel",
    organization: "Meridian Capital Group",
    location: "London, United Kingdom",
    address: "1 Canada Square, Canary Wharf, London E14 5AB",
    phone: "+44 20 7946 0312",
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
    photo: "https://i.pravatar.cc/150?img=68",
  },
  {
    id: "m003",
    name: "Priya Anand",
    title: "Partner",
    organization: "Singh Anand & Associates",
    location: "Singapore",
    address: "8 Marina Boulevard, #22-01 Marina Bay Financial Centre, Singapore 018981",
    phone: "+65 6225 4400",
    jurisdiction: "Asia-Pacific",
    practiceArea: "Privacy, Data & Cyber Security",
    expertise: ["PDPA Compliance", "Cross-border Data Transfers", "Incident Response", "AI Governance"],
    bio: "Priya is a leading data protection counsel in Southeast Asia, advising financial institutions and technology companies on regulatory compliance and cyber incident response.",
    forumsAttended: ["f003", "f006"],
    steeringCommittee: false,
    contactEmail: "p.anand@singhanand.com.sg",
    contactPreference: "email",
    discoverable: true,
    avatar: "PA",
    photo: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "m004",
    name: "Marcus Holst",
    title: "Senior Partner",
    organization: "Holst Richter Rechtsanwälte",
    location: "Frankfurt, Germany",
    address: "Taunusanlage 12, 60325 Frankfurt am Main, Germany",
    phone: "+49 69 7104 5500",
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
    photo: "https://i.pravatar.cc/150?img=53",
  },
  {
    id: "m005",
    name: "Sophie Beaumont",
    title: "Chief Privacy Officer",
    organization: "Lumière Technologies",
    location: "Paris, France",
    address: "25 Rue de Ponthieu, 75008 Paris, France",
    phone: "+33 1 4266 9100",
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
    photo: "https://i.pravatar.cc/150?img=49",
  },
  {
    id: "m006",
    name: "David Nkrumah",
    title: "Partner",
    organization: "Nkrumah Mensah & Partners",
    location: "Accra, Ghana",
    address: "No. 7 Ringway Close, Osu, Accra, Ghana",
    phone: "+233 30 276 1400",
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
    photo: "https://i.pravatar.cc/150?img=56",
  },
  {
    id: "m007",
    name: "Catherine Leroux",
    title: "Partner",
    organization: "Leroux Delacroix Avocats",
    location: "Montréal, Canada",
    address: "1000 De La Gauchetière St W, Suite 2400, Montréal, QC H3B 4W5",
    phone: "+1 514 397 8800",
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
    photo: "https://i.pravatar.cc/150?img=44",
  },
  {
    id: "m008",
    name: "Rajan Pillai",
    title: "Managing Director, Legal",
    organization: "GulfStream Asset Management",
    location: "Dubai, UAE",
    address: "Level 15, Gate Building, DIFC, Dubai, UAE",
    phone: "+971 4 376 2200",
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
    photo: "https://i.pravatar.cc/150?img=60",
  },
  {
    id: "m009",
    name: "Ingrid Svensson",
    title: "Head of Legal, Nordics",
    organization: "Nordic Green Energy AS",
    location: "Oslo, Norway",
    address: "Filipstad Brygge 1, 0252 Oslo, Norway",
    phone: "+47 22 83 4400",
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
    photo: "https://i.pravatar.cc/150?img=48",
  },
  {
    id: "m010",
    name: "Thomas Abernathy",
    title: "Partner",
    organization: "Abernathy Caldwell LLP",
    location: "New York, USA",
    address: "399 Park Avenue, 37th Floor, New York, NY 10022",
    phone: "+1 212 446 7700",
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
    photo: "https://i.pravatar.cc/150?img=57",
  },
  {
    id: "m011",
    name: "Yuki Tanaka",
    title: "General Counsel",
    organization: "Tanaka Precision Industries",
    location: "Tokyo, Japan",
    address: "2-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan",
    phone: "+81 3 5220 8800",
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
    photo: "https://i.pravatar.cc/150?img=69",
  },
  {
    id: "m012",
    name: "Ana Cristina Vásquez",
    title: "Partner",
    organization: "Vásquez & Reyes Abogados",
    location: "Bogotá, Colombia",
    address: "Carrera 7 No. 71-52, Torre B Piso 12, Bogotá, Colombia",
    phone: "+57 1 326 4400",
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
    photo: "https://i.pravatar.cc/150?img=46",
  },
  {
    id: "m013",
    name: "Hamish MacAllister",
    title: "Senior Partner",
    organization: "MacAllister Duncan & Co",
    location: "Edinburgh, Scotland",
    address: "16 Charlotte Square, Edinburgh EH2 4DR, Scotland",
    phone: "+44 131 226 5500",
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
    photo: "https://i.pravatar.cc/150?img=52",
  },
  {
    id: "m014",
    name: "Fatima Al-Rashidi",
    title: "Partner",
    organization: "Al-Rashidi Legal Group",
    location: "Riyadh, Saudi Arabia",
    address: "King Fahd Road, Al Olaya District, Riyadh 12213, Saudi Arabia",
    phone: "+966 11 462 8800",
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
    photo: "https://i.pravatar.cc/150?img=51",
  },
  {
    id: "m015",
    name: "Robert Kowalski",
    title: "Managing Partner",
    organization: "Kowalski & Wiśniewski",
    location: "Warsaw, Poland",
    address: "ul. Emilii Plater 53, 00-113 Warsaw, Poland",
    phone: "+48 22 520 4400",
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
    photo: "https://i.pravatar.cc/150?img=54",
  },
];

// Cambridge staff are kept separate from forum participants so they can have
// useful profiles without appearing to have member attendance history.
export const FORUM_DIRECTORS: ForumDirector[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    title: "Forum Director",
    organization: "Cambridge Forums",
    bio: "Sarah is the Cambridge Forums contact for forum attendance, travel, logistics, and materials.",
    contactEmail: "s.chen@cambridgeforums.com",
    contactPhone: "+1 416 703 1577 ext.305",
    avatar: "SC",
  },
];

// The current logged-in user (member ID m001 by default, overrideable by auth)
export const CURRENT_USER_ID = "m001";

export const FORUMS: Forum[] = [
  {
    id: "f001",
    programId: "competition-europe",
    title: "Annual European Competition Forum",
    area: "Antitrust",
    editionYear: 2026,
    startDate: "2026-11-14",
    endDate: "2026-11-15",
    startTime: "09:00",
    endTime: "16:30",
    timeZone: "Europe/Brussels",
    location: "Brussels, Belgium",
    venue: "Hotel Amigo",
    status: "upcoming",
    participants: ["m001", "m004", "m009", "m015"],
    websiteUrl: "https://www.cambridgeforums.com",
    factSheetUrl: "/materials/prototype-fact-sheet.txt",
    materialsBundleUrl: "/materials/prototype-forum-pack.txt",
    memberFees: { m001: "$4,950 CAD", m004: "$4,950 CAD", m009: "$5,250 CAD", m015: "$4,750 CAD" },
    agenda: [
      { time: "09:00", title: "Welcome & Introductions", description: "Chair's opening remarks and participant introductions.", speaker: "Elena Marchetti", speakerMemberId: "m001" },
      { time: "09:30", title: "Digital Markets Act: 18 Months In", description: "A roundtable assessment of DMA enforcement and its practical impact on designated gatekeepers.", speaker: "Panel" },
      { time: "11:00", title: "Break", description: "", },
      { time: "11:15", title: "Merger Control in Volatile Markets", description: "Discussion of recent DG COMP decisional practice and shifting remedies policy.", speaker: "Panel" },
      { time: "13:00", title: "Lunch", description: "Hosted lunch at the hotel. Informal networking." },
      { time: "14:30", title: "State Aid in the Green Transition", description: "Examining how energy subsidies and ESG incentives interact with EU state aid rules.", speaker: "Panel" },
      { time: "16:00", title: "Closing Discussion & Wrap-up", description: "Chair's summary and forward look.", speaker: "Elena Marchetti", speakerMemberId: "m001" },
      { time: "19:30", title: "Dinner", description: "Private dinner at Brasserie La Maison du Cygne.", venueName: "La Maison du Cygne", venueAddress: "Grand Place 9, 1000 Brussels, Belgium" },
    ],
    materials: [
      { id: "mat001", title: "DMA Enforcement Summary — Oct 2026", type: "pdf", size: "1.2 MB", url: "/materials/prototype-resource.txt", category: "required", publishedAt: "2026-10-12", revision: 1 },
      { id: "mat002", title: "Merger Control Trends Q3 2026", type: "pdf", size: "890 KB", url: "/materials/prototype-resource.txt", category: "supplementary", publishedAt: "2026-10-08", revision: 2 },
      { id: "mat003", title: "State Aid & Green Deal briefing", type: "reading", size: "340 KB", url: "/materials/prototype-resource.txt", category: "required", publishedAt: "2026-10-15", revision: 1 },
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
    programId: "private-capital-markets",
    title: "Private Capital Markets Forum",
    area: "Private Capital Markets",
    editionYear: 2026,
    startDate: "2026-12-04",
    endDate: "2026-12-05",
    startTime: "09:00",
    endTime: "16:30",
    timeZone: "Europe/London",
    location: "London, United Kingdom",
    venue: "The Ned",
    status: "upcoming",
    participants: ["m002", "m006", "m010", "m014"],
    websiteUrl: "https://www.cambridgeforums.com",
    factSheetUrl: "/materials/prototype-fact-sheet.txt",
    materialsBundleUrl: "/materials/prototype-forum-pack.txt",
    memberFees: { m002: "£3,250", m006: "£3,250", m010: "£3,500", m014: "£3,100" },
    agenda: [
      { time: "09:00", title: "Welcome", description: "Opening remarks from the Chair.", speaker: "James Okafor", speakerMemberId: "m002" },
      { time: "09:30", title: "Secondary Markets & Liquidity", description: "The evolution of LP secondary transactions and GP-led restructurings.", speaker: "Panel" },
      { time: "11:00", title: "Break", description: "" },
      { time: "11:15", title: "Continuation Funds: Lessons Learned", description: "A candid discussion of deal structuring, conflicts, and LP expectations.", speaker: "Panel" },
      { time: "13:00", title: "Lunch", description: "" },
      { time: "14:30", title: "Emerging Markets Capital Raising", description: "Challenges and opportunities in West Africa, the Gulf, and Southeast Asia.", speaker: "Panel" },
      { time: "16:30", title: "Closing Remarks", description: "", speaker: "James Okafor", speakerMemberId: "m002" },
    ],
    materials: [
      { id: "mat004", title: "Global PE Market Update Q3 2026", type: "pdf", size: "2.1 MB", url: "/materials/prototype-resource.txt", category: "required", publishedAt: "2026-11-20", revision: 1 },
      { id: "mat005", title: "Continuation Fund Structures — Deck", type: "slides", size: "4.3 MB", url: "/materials/prototype-resource.txt", category: "supplementary", publishedAt: "2026-11-25", revision: 1 },
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
    programId: "privacy-ai-governance",
    title: "Data Privacy & AI Governance Forum",
    area: "Privacy, Data & Cyber Security",
    editionYear: 2026,
    startDate: "2026-10-22",
    endDate: "2026-10-23",
    startTime: "09:00",
    endTime: "16:30",
    timeZone: "Europe/Amsterdam",
    location: "Amsterdam, Netherlands",
    venue: "Pulitzer Amsterdam",
    status: "upcoming",
    participants: ["m003", "m005", "m011"],
    websiteUrl: "https://www.cambridgeforums.com",
    factSheetUrl: "/materials/prototype-fact-sheet.txt",
    materialsBundleUrl: "/materials/prototype-forum-pack.txt",
    memberFees: { m003: "€3,850", m005: "€3,850", m011: "€4,100" },
    agenda: [
      { time: "09:00", title: "Welcome", description: "Opening remarks.", speaker: "Priya Anand", speakerMemberId: "m003" },
      { time: "09:30", title: "EU AI Act — Practical Implications", description: "Mapping high-risk AI systems to compliance obligations.", speaker: "Panel" },
      { time: "11:15", title: "Cross-Border Data Transfers Post-Schrems", description: "Standard contractual clauses and transfer impact assessments in practice.", speaker: "Panel" },
      { time: "13:00", title: "Lunch", description: "" },
      { time: "14:30", title: "Cyber Incident Response — A Crisis Simulation", description: "Tabletop exercise: 48 hours after a ransomware attack.", speaker: "Panel" },
      { time: "16:30", title: "Closing", description: "", speaker: "Priya Anand", speakerMemberId: "m003" },
    ],
    materials: [
      { id: "mat006", title: "EU AI Act — Compliance Roadmap", type: "pdf", size: "1.8 MB", url: "/materials/prototype-resource.txt", category: "required", publishedAt: "2026-10-05", revision: 1 },
      { id: "mat007", title: "SCCs Practical Guide 2026", type: "pdf", size: "920 KB", url: "/materials/prototype-resource.txt", category: "supplementary", publishedAt: "2026-10-07", revision: 1 },
      { id: "mat008", title: "Incident Response Simulation Brief", type: "pdf", size: "440 KB", url: "/materials/prototype-resource.txt", category: "required", publishedAt: "2026-10-14", revision: 1 },
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
    programId: "competition-europe",
    title: "Annual European Competition Forum",
    area: "Antitrust",
    editionYear: 2025,
    startDate: "2025-09-18",
    endDate: "2025-09-19",
    startTime: "09:00",
    endTime: "16:00",
    timeZone: "America/New_York",
    location: "Washington D.C., USA",
    venue: "St. Regis Washington",
    status: "past",
    participants: ["m001", "m007", "m012", "m015"],
    websiteUrl: "https://www.cambridgeforums.com",
    factSheetUrl: "/materials/prototype-fact-sheet.txt",
    materialsBundleUrl: "/materials/prototype-forum-pack.txt",
    memberFees: {},
    agenda: [],
    materials: [
      { id: "mat009", title: "Forum Summary & Key Themes", type: "pdf", size: "680 KB", url: "/materials/prototype-resource.txt", category: "supplementary", publishedAt: "2025-09-22", revision: 1 },
      { id: "mat010", title: "DOJ Antitrust Division — Enforcement Trends", type: "pdf", size: "1.1 MB", url: "/materials/prototype-resource.txt", category: "required", publishedAt: "2025-09-01", revision: 1 },
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
    programId: "family-office-private-wealth",
    title: "Family Office & Private Wealth Forum",
    area: "Family Office",
    editionYear: 2025,
    startDate: "2025-06-12",
    endDate: "2025-06-13",
    startTime: "09:00",
    endTime: "16:00",
    timeZone: "Europe/Zurich",
    location: "Geneva, Switzerland",
    venue: "Beau-Rivage Hotel",
    status: "past",
    participants: ["m002", "m004", "m008", "m013"],
    websiteUrl: "https://www.cambridgeforums.com",
    factSheetUrl: "/materials/prototype-fact-sheet.txt",
    materialsBundleUrl: "/materials/prototype-forum-pack.txt",
    memberFees: {},
    agenda: [],
    materials: [
      { id: "mat011", title: "Forum Summary — June 2025", type: "pdf", size: "720 KB", url: "/materials/prototype-resource.txt", category: "supplementary", publishedAt: "2025-06-17", revision: 1 },
      { id: "mat012", title: "Global Wealth Structures Outlook", type: "slides", size: "3.2 MB", url: "/materials/prototype-resource.txt", category: "required", publishedAt: "2025-05-29", revision: 1 },
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

// Lightweight history records stand in for the eventual CRM attendance feed.
export const FORUM_EDITION_HISTORY: ForumEditionSummary[] = [
  ...FORUMS.map(forum => ({
    id: forum.id,
    programId: forum.programId,
    title: forum.title,
    year: forum.editionYear,
    location: forum.location,
  })),
  { id: "f006", programId: "privacy-ai-governance", title: "Data Privacy & AI Governance Forum", year: 2025, location: "The Hague, Netherlands" },
  { id: "f007", programId: "competition-europe", title: "Annual European Competition Forum", year: 2024, location: "Paris, France" },
  { id: "f008", programId: "family-office-private-wealth", title: "Family Office & Private Wealth Forum", year: 2024, location: "London, United Kingdom" },
  { id: "f009", programId: "private-capital-markets", title: "Private Capital Markets Forum", year: 2024, location: "New York, USA" },
];

export function getForumEditionSummary(id: string): ForumEditionSummary | undefined {
  return FORUM_EDITION_HISTORY.find(edition => edition.id === id);
}

export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getForumDirectorById(id: string): ForumDirector | undefined {
  return FORUM_DIRECTORS.find((director) => director.id === id);
}

export function getForumDirectorByEmail(email: string): ForumDirector | undefined {
  return FORUM_DIRECTORS.find((director) => director.contactEmail.toLowerCase() === email.toLowerCase());
}

export function getForumById(id: string): Forum | undefined {
  return FORUMS.find((f) => f.id === id);
}

export function getForumsForMember(memberId: string): Forum[] {
  return FORUMS.filter((f) => f.participants.includes(memberId));
}
