// ============================================================
// Éclat Institute — Institutional Academic Handbooks & E-Textbooks
// Native In-App High Resolution Reader Content Engine
// ============================================================

export interface HandbookChapter {
  id: string
  number: number
  title: string
  summary: string
  sections: {
    heading: string
    content: string[]
    codeSnippet?: string
    codeLanguage?: string
    keyPoints?: string[]
    practiceQuestions?: { q: string; a: string }[]
  }[]
}

export interface AcademicHandbook {
  id: string
  title: string
  subtitle: string
  faculty: string
  edition: string
  year: number
  totalChapters: number
  estimatedReadTime: string
  chapters: HandbookChapter[]
}

export const ACADEMIC_HANDBOOKS: Record<string, AcademicHandbook> = {
  'res-fullstack-guide': {
    id: 'res-fullstack-guide',
    title: 'Full-Stack Web Development & Modern React 19 Mastery Handbook',
    subtitle: 'Comprehensive Engineering Guide for Modern Frontend & Cloud Backend Architectures',
    faculty: 'Department of Computing & Software Engineering',
    edition: '2026 Enterprise Edition',
    year: 2026,
    totalChapters: 6,
    estimatedReadTime: '4 hours 30 mins',
    chapters: [
      {
        id: 'fs-ch1',
        number: 1,
        title: 'Modern Web Architecture & Semantic HTML5 Standards',
        summary: 'Foundational concepts of modern browser rendering, the DOM, and accessible web applications.',
        sections: [
          {
            heading: '1.1 The Anatomy of Modern Web Applications',
            content: [
              'Modern web development requires understanding the lifecycle of a request from DNS resolution through TLS handshake, server routing, and progressive client rendering.',
              'Clean semantic markup ensures that assistive technologies, search crawlers, and performance engines parse document trees with zero layout thrashing.',
              'Key elements include `<main>`, `<section>`, `<article>`, `<nav>`, and `<aside>`, which provide intrinsic accessibility without excessive ARIA overrides.',
            ],
            keyPoints: [
              'Always declare explicit viewport meta tags for responsive rendering across mobile and desktop displays.',
              'Use semantic landmark tags to establish logical reading order for accessibility readers.',
              'Minimize deep DOM hierarchies to maintain 60 FPS scrolling and low memory overhead.',
            ],
          },
          {
            heading: '1.2 TypeScript ES6+ Fundamentals for Enterprise Codebases',
            content: [
              'Strongly-typed TypeScript interfaces prevent runtime TypeError bugs and enable autocomplete tooling across large engineering teams.',
              'Always prefer immutable data transformations (`map`, `filter`, `reduce`) over in-place array mutations.',
            ],
            codeLanguage: 'typescript',
            codeSnippet: `interface TraineeProfile {\n  readonly id: string\n  fullName: string\n  enrollmentStatus: 'active' | 'graduated' | 'suspended'\n  gpa: number\n  enrolledUnits: string[]\n}\n\nexport function calculateAcademicStanding(student: TraineeProfile): string {\n  if (student.gpa >= 3.7) return 'First Class Distinction'\n  if (student.gpa >= 3.0) return 'Upper Second Class'\n  return 'Pass'\n}`,
            keyPoints: [
              'Use TypeScript discriminated unions to represent strict state transitions.',
              'Mark immutable properties with the readonly modifier to prevent unintended side effects.',
            ],
          },
        ],
      },
      {
        id: 'fs-ch2',
        number: 2,
        title: 'React 19 Hooks, State Management & Compiler Optimizations',
        summary: 'Mastering React 19 concurrent features, useActionState, useOptimistic, and memoization.',
        sections: [
          {
            heading: '2.1 Declarative State and Server Actions',
            content: [
              'React 19 introduces automatic memoization and fine-grained reactivity, reducing boilerplate code previously required by useMemo and useCallback.',
              'The useActionState hook simplifies asynchronous form submissions and mutation workflows with built-in pending states and error boundaries.',
            ],
            codeLanguage: 'tsx',
            codeSnippet: `import { useActionState } from 'react'\n\nasync function updateEnrollment(prevState: any, formData: FormData) {\n  const unitCode = formData.get('unitCode') as string\n  const res = await fetch('/api/register-unit', {\n    method: 'POST',\n    body: JSON.stringify({ unitCode })\n  })\n  return res.json()\n}\n\nexport function UnitRegisterForm() {\n  const [state, formAction, isPending] = useActionState(updateEnrollment, null)\n\n  return (\n    <form action={formAction}>\n      <input name="unitCode" placeholder="e.g. CS101" required />\n      <button type="submit" disabled={isPending}>\n        {isPending ? 'Registering...' : 'Confirm Registration'}\n      </button>\n      {state?.error && <p className="text-red-500">{state.error}</p>}\n    </form>\n  )\n}`,
            keyPoints: [
              'Use useActionState to handle async mutations without manual loading state booleans.',
              'Combine with useOptimistic for instant user feedback on network requests.',
            ],
          },
        ],
      },
      {
        id: 'fs-ch3',
        number: 3,
        title: 'RESTful API Engineering & Supabase PostgreSQL Integration',
        summary: 'Building high-throughput, secure backend data pipelines with Row-Level Security.',
        sections: [
          {
            heading: '3.1 Database Modeling & Relational Integrity',
            content: [
              'PostgreSQL tables must adhere to 3rd Normal Form (3NF) to eliminate redundancy, while utilizing foreign key constraints and indexed columns for sub-millisecond query latency.',
              'Row-Level Security (RLS) policies enforce security at the database engine layer, guaranteeing multi-tenant isolation even if client tokens are intercepted.',
            ],
            codeLanguage: 'sql',
            codeSnippet: `-- Create secure student registration table with RLS\nCREATE TABLE public.student_registrations (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n  unit_code VARCHAR(32) NOT NULL,\n  semester VARCHAR(16) NOT NULL,\n  registered_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- Enable Row-Level Security\nALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;\n\n-- Allow students to read only their personal records\nCREATE POLICY "Students can view personal registrations" \nON public.student_registrations \nFOR SELECT \nUSING (auth.uid() = student_id);`,
            keyPoints: [
              'Always enable Row-Level Security (RLS) on all public tables in Supabase.',
              'Index foreign keys and frequently filtered columns like student_id and unit_code.',
            ],
          },
        ],
      },
    ],
  },

  'res-python-lab': {
    id: 'res-python-lab',
    title: 'Python Data Science, Automation & Machine Learning Practical Lab Manual',
    subtitle: 'Hands-On Practical Code Notebooks & Statistical Computing Frameworks',
    faculty: 'Department of Computing & Artificial Intelligence',
    edition: '2026 Practical Lab Series',
    year: 2026,
    totalChapters: 5,
    estimatedReadTime: '3 hours 45 mins',
    chapters: [
      {
        id: 'py-lab1',
        number: 1,
        title: 'Data Wrangling & Vectorized Operations with NumPy & Pandas',
        summary: 'Practical data ingestion, cleaning, transformation, and statistical aggregation.',
        sections: [
          {
            heading: '1.1 Data Ingestion & Missing Value Imputation',
            content: [
              'Pandas DataFrames provide high-performance in-memory tabular manipulation. In real-world data pipelines, handling null values and datatype casting is the primary step before modeling.',
            ],
            codeLanguage: 'python',
            codeSnippet: `import pandas as pd\nimport numpy as np\n\n# Ingest raw examination scores\ndf = pd.read_csv('student_exam_scores.csv')\n\n# Impute missing numerical scores with cohort median\ndf['score'] = df['score'].fillna(df['score'].median())\n\n# Compute percentile ranks and letter grade categories\ndf['grade_category'] = pd.qcut(df['score'], q=4, labels=['Pass', 'Credit', 'Distinction', 'High Distinction'])\n\nprint("Cohort Summary Statistics:")\nprint(df.describe())`,
            keyPoints: [
              'Always check `.isna().sum()` and `.dtypes` immediately after loading tabular datasets.',
              'Vectorized operations in Pandas are written in C/Cython and run 50x faster than standard Python loops.',
            ],
          },
        ],
      },
      {
        id: 'py-lab2',
        number: 2,
        title: 'Supervised Learning with Scikit-Learn: Classification & Regression',
        summary: 'Building, tuning, and evaluating predictive machine learning models.',
        sections: [
          {
            heading: '2.1 Train-Test Splits and Random Forest Evaluation',
            content: [
              'Cross-validation ensures our model generalizes to unseen test distributions without overfitting training noise.',
            ],
            codeLanguage: 'python',
            codeSnippet: `from sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report, confusion_matrix\n\nX = df[['attendance_rate', 'assignment_avg', 'quiz_score']]\ny = df['passed_course']\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = RandomForestClassifier(n_estimators=100, max_depth=6)\nmodel.fit(X_train, y_train)\n\npreds = model.predict(X_test)\nprint(classification_report(y_test, preds))`,
            keyPoints: [
              'Never evaluate models on the training dataset to avoid optimistic variance estimation.',
              'Look at precision, recall, and F1-score rather than raw accuracy when classes are imbalanced.',
            ],
          },
        ],
      },
    ],
  },

  'res-ielts-prep': {
    id: 'res-ielts-prep',
    title: 'IELTS Academic & General 8.0 Band Comprehensive Preparation Guide & Past Papers',
    subtitle: 'Strategic Writing Frameworks, Speaking Templates, and Reading Mastery',
    faculty: 'Department of Modern Languages & International Testing',
    edition: '2026 Academic Edition',
    year: 2026,
    totalChapters: 4,
    estimatedReadTime: '3 hours 15 mins',
    chapters: [
      {
        id: 'ielts-ch1',
        number: 1,
        title: 'Academic Writing Task 1 & Task 2 High-Scoring Blueprints',
        summary: 'Mastering band 8.0 cohesion, lexical resource, and grammatical range.',
        sections: [
          {
            heading: '1.1 Task 2 Essay Structure for Band 8.0+',
            content: [
              'The IELTS Task 2 essay requires a structured 4-paragraph response consisting of: Introduction with Paraphrase and Thesis Statement, Body Paragraph 1 (First Main Idea with concrete illustration), Body Paragraph 2 (Second Main Idea or Counterpoint), and a Conclusion that summarizes without introducing new arguments.',
            ],
            keyPoints: [
              'Paraphrase the prompt using academic synonyms rather than repeating the exam question verbatim.',
              'Use sophisticated linking phrases like "Consequently", "In stark contrast", and "It is widely asserted that".',
              'Aim for 270-290 words in 40 minutes.',
            ],
            practiceQuestions: [
              {
                q: 'Prompt: Some believe university education should focus solely on career skills, while others argue for broad knowledge. Discuss both views and give your opinion.',
                a: 'Model Outline: Intro (Paraphrase + Balanced thesis) -> Body 1 (Economic utility of direct vocational training) -> Body 2 (Critical thinking & societal benefits of broad liberal arts) -> Conclusion (Synthesize that a hybrid curriculum yields the highest long-term adaptability).',
              },
            ],
          },
        ],
      },
    ],
  },

  'res-quickbooks-guide': {
    id: 'res-quickbooks-guide',
    title: 'Computerized Accounting, QuickBooks Pro & KRA iTax Filing Manual',
    subtitle: 'Practical Guide to Double-Entry Bookkeeping, Invoicing, and Statutory Compliance',
    faculty: 'Department of Business Technology & Accounting',
    edition: '2026 Professional Edition',
    year: 2026,
    totalChapters: 4,
    estimatedReadTime: '2 hours 50 mins',
    chapters: [
      {
        id: 'qb-ch1',
        number: 1,
        title: 'Chart of Accounts Setup & Double-Entry Journal Posting',
        summary: 'Configuring enterprise financial ledgers and generating automated balance sheets.',
        sections: [
          {
            heading: '1.1 Principles of the Fundamental Accounting Equation',
            content: [
              'Every transaction maintains the fundamental balance: Assets = Liabilities + Equity.',
              'In computerized accounting systems like QuickBooks, every debit must be matched with a corresponding credit across configured nominal ledger accounts.',
            ],
            keyPoints: [
              'Current Assets include Cash, Accounts Receivable, and Short-term prepayments.',
              'Maintain strict bank reconciliation at the close of every business week.',
            ],
          },
        ],
      },
    ],
  },

  'res-cybersecurity-handbook': {
    id: 'res-cybersecurity-handbook',
    title: 'Cybersecurity Fundamentals, Network Defense & Threat Modeling Handbook',
    subtitle: 'Defensive Security Operations, Cryptography, and Zero-Trust Architectures',
    faculty: 'Faculty of Computing & Cyber Defense',
    edition: '2026 Defensive Security Edition',
    year: 2026,
    totalChapters: 4,
    estimatedReadTime: '3 hours 30 mins',
    chapters: [
      {
        id: 'sec-ch1',
        number: 1,
        title: 'Zero-Trust Architecture & Identity Access Management (IAM)',
        summary: 'Implementing least-privilege principles, multi-factor authentication, and encryption.',
        sections: [
          {
            heading: '1.1 The Core Pillars of Zero Trust',
            content: [
              'Zero Trust operates on the principle of "Never Trust, Always Verify". Every network packet, API request, and data access call must be authenticated and authorized regardless of whether it originates inside or outside the internal network perimeter.',
            ],
            keyPoints: [
              'Always enforce encrypted transport layer security (TLS 1.3) on all network endpoints.',
              'Implement token rotation and short-lived JWT credentials with asymmetric RSA/ECDSA signing.',
            ],
          },
        ],
      },
    ],
  },

  'res-computer-packages-notes': {
    id: 'res-computer-packages-notes',
    title: 'Comprehensive Computer Packages & Digital Workplace Office Mastery',
    subtitle: 'Word Processing, Advanced Spreadsheets, Presentation Design & Cloud Workspaces',
    faculty: 'Department of Digital Skills & Office Productivity',
    edition: '2026 Foundations Edition',
    year: 2026,
    totalChapters: 4,
    estimatedReadTime: '2 hours 20 mins',
    chapters: [
      {
        id: 'cp-ch1',
        number: 1,
        title: 'Advanced Microsoft Excel & Google Sheets Productivity Formulas',
        summary: 'Data lookup, logical formulas, pivot tables, and conditional formatting.',
        sections: [
          {
            heading: '1.1 Dynamic Lookup with XLOOKUP and INDEX-MATCH',
            content: [
              'Modern spreadsheet workflows use XLOOKUP to retrieve relational data without the column-order limitations of legacy VLOOKUP.',
            ],
            keyPoints: [
              'Formula: `=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])`',
              'Use absolute cell references `$A$1` to lock ranges during formula drag-and-drop.',
            ],
          },
        ],
      },
    ],
  },

  'res-french-conversational': {
    id: 'res-french-conversational',
    title: 'Modern Conversational French & DELF A1/A2 Examination Study Notes',
    subtitle: 'Grammar Foundations, Vocabulary Modules, and Pronunciation Guide',
    faculty: 'Department of Modern Languages',
    edition: '2026 Edition',
    year: 2026,
    totalChapters: 3,
    estimatedReadTime: '2 hours 10 mins',
    chapters: [
      {
        id: 'fr-ch1',
        number: 1,
        title: 'Salutations, Presentations & Everyday Interactions',
        summary: 'Essential spoken dialogue, greetings, and formal vs informal address.',
        sections: [
          {
            heading: '1.1 Formal and Informal Introductions',
            content: [
              'In French society, distinction between "Tu" (informal) and "Vous" (formal) is critical for professional and academic etiquette.',
            ],
            keyPoints: [
              '"Bonjour, comment allez-vous ?" — Formal / Academic setting',
              '"Salut, comment ça va ?" — Informal / Friendly setting',
            ],
          },
        ],
      },
    ],
  },

  'res-digital-marketing-strategy': {
    id: 'res-digital-marketing-strategy',
    title: 'Digital Marketing, Meta Ads & Social Media Monetization Strategy Framework',
    subtitle: 'Campaign Architecture, Audience Targeting, and Conversion Rate Optimization',
    faculty: 'Department of Media & Marketing',
    edition: '2026 Strategy Edition',
    year: 2026,
    totalChapters: 3,
    estimatedReadTime: '2 hours 40 mins',
    chapters: [
      {
        id: 'dm-ch1',
        number: 1,
        title: 'Customer Acquisition Funnels & Paid Advertising Metrics',
        summary: 'Understanding CAC, ROAS, LTV, and conversion tracking.',
        sections: [
          {
            heading: '1.1 Calculating Return On Ad Spend (ROAS)',
            content: [
              'High-performing growth campaigns optimize for Return on Ad Spend (ROAS = Revenue / Ad Spend). A sustainable campaign typically targets a minimum of 3.5x ROAS to maintain healthy gross margins.',
            ],
            keyPoints: [
              'Always install server-side Conversion API (CAPI) to circumvent browser ad-blocking.',
              'Test multiple creative hooks (video vs carousel vs single image) with identical audience segments.',
            ],
          },
        ],
      },
    ],
  },
}

// ============================================================
// COMIC BOOKS & GRAPHIC NOVELS ENGINE
// ============================================================

export interface ComicPanel {
  panelNumber: number
  characterName?: string
  avatarEmoji?: string
  dialogue?: string
  thought?: string
  narrative?: string
  sfx?: string
  backgroundTheme: 'cyber' | 'action' | 'noir' | 'scifi' | 'campus' | 'dramatic'
  illustrationEmoji: string
  illustrationVisual: string
  codeSnippet?: string
  terminalOutput?: string
}

export interface ComicIssue {
  issueNumber: number
  title: string
  synopsis: string
  coverEmoji: string
  panels: ComicPanel[]
}

export interface ComicBook {
  id: string
  title: string
  series: string
  volume: string
  genre: 'Cyberpunk & Security' | 'Tech Mystery & Noir' | 'Manga & Sci-Fi' | 'AI & Future Tech'
  author: string
  illustrator: string
  year: number
  estimatedReadTime: string
  coverEmoji: string
  coverColor: string
  synopsis: string
  issues: ComicIssue[]
}

export const COMIC_BOOKS_DATA: Record<string, ComicBook> = {
  'comic-cyber-sentinel': {
    id: 'comic-cyber-sentinel',
    title: 'The Cyber Sentinel: Rise of the White Hat',
    series: 'Cyber Sentinel Chronicles',
    volume: 'Volume 1 — Genesis Breach',
    genre: 'Cyberpunk & Security',
    author: 'Alex Mwangi',
    illustrator: 'Éclat Interactive Studios',
    year: 2026,
    estimatedReadTime: '15 mins',
    coverEmoji: '🛡️',
    coverColor: '#0ea5e9',
    synopsis: 'When a rogue AI syndicate infiltrates the national power grid, trainee cybersecurity engineer Kaelen must deploy zero-day countermeasures before the city goes dark.',
    issues: [
      {
        issueNumber: 1,
        title: 'Issue #1: Midnight Protocol',
        synopsis: 'A suspicious beacon blinks on the terminal at 02:43 AM. The mainframe defense alarms trigger.',
        coverEmoji: '⚡',
        panels: [
          {
            panelNumber: 1,
            narrative: 'Nairobi Metropolis — 02:43 AM. The servers in the Éclat Cyber Range hum under an unprecedented surge.',
            backgroundTheme: 'cyber',
            illustrationEmoji: '🏙️',
            illustrationVisual: 'Towering neon skyscrapers reflected across rain-slicked server farm glass.',
            sfx: '*HUMMMMMMMM*',
          },
          {
            panelNumber: 2,
            characterName: 'Kaelen (White Hat Trainee)',
            avatarEmoji: '👨‍💻',
            dialogue: 'Wait… this isn’t a standard port scan. Someone is injecting encrypted payload packets into port 443!',
            thought: 'If that rogue packet hits the authentication gateway, all credentials will be wiped!',
            backgroundTheme: 'cyber',
            illustrationEmoji: '🚨',
            illustrationVisual: 'Red telemetry alerts flash violently across three curved OLED monitors.',
            sfx: '*BEEP-BEEP-BEEP*',
            codeSnippet: 'tcpdump -i eth0 "tcp[tcpflags] & (tcp-syn) != 0" -c 50\nALERT: [192.168.1.105 -> 10.0.0.1:443] MALICIOUS SYN FLOOD DETECTED',
          },
          {
            panelNumber: 3,
            characterName: 'Dr. Naomi (Chief Cyber Instructor)',
            avatarEmoji: '👩‍🏫',
            dialogue: 'Stay calm, Kaelen! Isolate the subnet immediately and spin up the honeypot firewall!',
            backgroundTheme: 'action',
            illustrationEmoji: '⚡',
            illustrationVisual: 'Dr. Naomi steps into the command cockpit, deploying biometric override authorization.',
            sfx: '*ACCESS AUTHORIZED*',
          },
          {
            panelNumber: 4,
            characterName: 'Kaelen',
            avatarEmoji: '👨‍💻',
            dialogue: 'Executing iptables rate-limiting rules and tracing source hops now!',
            backgroundTheme: 'cyber',
            illustrationEmoji: '💻',
            illustrationVisual: 'Fingers fly across the mechanical keyboard at 120 words per minute.',
            sfx: '*CLACK-CLACK-CLACK-ENTER!*',
            terminalOutput: '[+] iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 20 -j DROP\n[+] Threat Neutralized: 45,000 Botnet IP Addresses Blocked.',
          },
          {
            panelNumber: 5,
            narrative: 'The alarm silence descends. But deep inside the log files, a hidden digital signature remains...',
            backgroundTheme: 'dramatic',
            illustrationEmoji: '👁️',
            illustrationVisual: 'A mysterious neon emblem with the letters "SYN-X" flashes for 0.1 seconds before dissolving.',
            sfx: '*STATIC SHIVER*',
          },
        ],
      },
      {
        issueNumber: 2,
        title: 'Issue #2: The Shadow Infiltration',
        synopsis: 'Kaelen and team follow the digital breadcrumbs to an abandoned data center in the industrial district.',
        coverEmoji: '🕵️',
        panels: [
          {
            panelNumber: 1,
            narrative: 'Next Morning — The forensics team recovers an encrypted USB drive left on the server chassis.',
            backgroundTheme: 'noir',
            illustrationEmoji: '💾',
            illustrationVisual: 'High security evidence locker glowing in ultraviolet light.',
            sfx: '*CLICK*',
          },
          {
            panelNumber: 2,
            characterName: 'Kaelen',
            avatarEmoji: '👨‍💻',
            dialogue: 'Sandboxing this binary inside an isolated Linux VM... let’s see what payload they tried to deliver.',
            backgroundTheme: 'cyber',
            illustrationEmoji: '🔬',
            illustrationVisual: 'Hex dump stream unrolling on screen revealing hidden ASCII art.',
            codeSnippet: 'gdb ./suspect_payload.bin\n(gdb) disassemble main\n0x08048430: mov eax, 0x1\n0x08048435: int 0x80 ; Syscall Exfiltration Routine',
          },
          {
            panelNumber: 3,
            characterName: 'Dr. Naomi',
            avatarEmoji: '👩‍🏫',
            dialogue: 'This is military-grade encryption. Whoever built this knows our architecture inside out.',
            backgroundTheme: 'dramatic',
            illustrationEmoji: '⚠️',
            illustrationVisual: 'A satellite link map tracing servers across 6 continents.',
            sfx: '*PING-PONG*',
          },
        ],
      },
    ],
  },

  'comic-sql-detective': {
    id: 'comic-sql-detective',
    title: 'Data Detective: The SQL Injection Mystery',
    series: 'Tech Detective Bureau',
    volume: 'Case File #101',
    genre: 'Tech Mystery & Noir',
    author: 'Samira Noor',
    illustrator: 'Kenya Manga Guild',
    year: 2026,
    estimatedReadTime: '12 mins',
    coverEmoji: '🔍',
    coverColor: '#eab308',
    synopsis: 'When a bank ledger is modified without an audit trail, Detective Cipher uses parameterized queries and database forensics to catch the digital phantom.',
    issues: [
      {
        issueNumber: 1,
        title: 'Case 1: The Dropped Table Incident',
        synopsis: 'A classic SQL injection vulnerability leaves a financial database wide open.',
        coverEmoji: '🗄️',
        panels: [
          {
            panelNumber: 1,
            narrative: 'The Bank of Rift Valley — 11:00 PM. A mysterious transfer of KES 50,000,000 disappears into thin air.',
            backgroundTheme: 'noir',
            illustrationEmoji: '🏦',
            illustrationVisual: 'Dimly lit audit office with towering paper records and glowing terminal matrices.',
            sfx: '*TICK... TOCK...*',
          },
          {
            panelNumber: 2,
            characterName: 'Detective Cipher',
            avatarEmoji: '🕵️‍♂️',
            dialogue: 'Let me look at the backend login script... Great heavens, look at this query concatenation!',
            backgroundTheme: 'noir',
            illustrationEmoji: '🔎',
            illustrationVisual: 'Magnifying glass focused over raw backend PHP script from 2012.',
            codeSnippet: '// VULNERABLE CODE FOUND:\n$query = "SELECT * FROM users WHERE user=\'" . $_POST["user"] . "\' AND pass=\'" . $_POST["pass"] . "\'";',
          },
          {
            panelNumber: 3,
            characterName: 'Detective Cipher',
            avatarEmoji: '🕵️‍♂️',
            dialogue: 'The suspect entered: \' OR \'1\'=\'1\' -- and bypassed the entire authentication layer!',
            backgroundTheme: 'action',
            illustrationEmoji: '💡',
            illustrationVisual: 'Lightbulb moment illuminating the entire detective squad room.',
            sfx: '*EUREKA!*',
          },
          {
            panelNumber: 4,
            characterName: 'Trainee Junior',
            avatarEmoji: '🧑‍💻',
            dialogue: 'How do we secure this permanently, Detective?',
            backgroundTheme: 'campus',
            illustrationEmoji: '🛡️',
            illustrationVisual: 'Detective Cipher writing parameterized prepared statements on the glass whiteboard.',
            codeSnippet: '// SECURE PARAMETERIZED QUERY (PREVENTS INJECTION 100%):\n$stmt = $pdo->prepare("SELECT id, name FROM users WHERE user = :user AND pass_hash = :hash");\n$stmt->execute([":user" => $cleanUser, ":hash" => $passwordHash]);',
          },
        ],
      },
    ],
  },

  'comic-silicon-savannah': {
    id: 'comic-silicon-savannah',
    title: 'Silicon Savannah: Zawadi’s AI Quest',
    series: 'African Tech Heroes Manga',
    volume: 'Volume 1 — Zero to One',
    genre: 'Manga & Sci-Fi',
    author: 'Zawadi Mwangi & Studio 254',
    illustrator: 'Nairobi Graphic Arts',
    year: 2026,
    estimatedReadTime: '18 mins',
    coverEmoji: '🌱',
    coverColor: '#10b981',
    synopsis: 'Armed with a laptop and solar panels, a young Kenyan inventor builds an AI drone ecosystem to protect crops against climate volatility.',
    issues: [
      {
        issueNumber: 1,
        title: 'Episode 1: The Hackathon Spark',
        synopsis: 'The 48-hour Pan-African Innovation Challenge begins at Éclat Institute.',
        coverEmoji: '🚀',
        panels: [
          {
            panelNumber: 1,
            narrative: 'Nairobi Innovation Hub — 48 hours remain on the grand hackathon timer.',
            backgroundTheme: 'campus',
            illustrationEmoji: '🎪',
            illustrationVisual: 'Packed auditorium filled with 500 enthusiastic developers, hardware kits, and espresso machines.',
            sfx: '*CHEERING & BUZZ*',
          },
          {
            panelNumber: 2,
            characterName: 'Zawadi',
            avatarEmoji: '👩‍🔬',
            dialogue: 'If we train an edge-AI computer vision model on low-power Raspberry Pi chips, farmers can diagnose crop blight in real time without needing 5G internet!',
            backgroundTheme: 'action',
            illustrationEmoji: '🤖',
            illustrationVisual: 'Zawadi holds up an ultra-compact carbon-fiber quadcopter drone.',
            sfx: '*WHIRRRRRRR*',
          },
          {
            panelNumber: 3,
            characterName: 'Team Coder (Juma)',
            avatarEmoji: '🧑‍💻',
            dialogue: 'Deploying our PyTorch Mobile model with 98.4% accuracy on African maize blight datasets!',
            backgroundTheme: 'cyber',
            illustrationEmoji: '📊',
            illustrationVisual: 'Live computer vision boundary boxes tagging healthy vs diseased leaves.',
            terminalOutput: 'Model: CropVision-YOLO-v11-Edge\nLatency: 14ms per frame\nInference: ONNX Runtime Optimized\nVerdict: 100% Offline Capable',
          },
          {
            panelNumber: 4,
            narrative: 'The judges award First Place to Team Savannah. A new generation of African tech leadership is born!',
            backgroundTheme: 'dramatic',
            illustrationEmoji: '🏆',
            illustrationVisual: 'Gold trophy raised high under confetti cannons.',
            sfx: '*CONFETTI POP!*',
          },
        ],
      },
    ],
  },
}

