// Fan bo'yicha namunaviy DTM-uslubidagi savollar
// Har biri options[] formatida — to'g'ri javob isCorrect: true

export type SeedQuestion = {
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  difficulty: number; // 1-5
  topic?: string;
};

// MATEMATIKA — Algebra, Geometriya, Trigonometriya, Matematik analiz
export const MATEMATIKA: SeedQuestion[] = [
  {
    text: "$\\sqrt{144}$ ifodaning qiymati nechaga teng?",
    options: [
      { id: "A", text: "10", isCorrect: false },
      { id: "B", text: "12", isCorrect: true },
      { id: "C", text: "14", isCorrect: false },
      { id: "D", text: "16", isCorrect: false },
    ],
    explanation: "12² = 144, demak $\\sqrt{144} = 12$",
    difficulty: 1,
    topic: "Algebra",
  },
  {
    text: "$2x + 5 = 17$ tenglamani yeching.",
    options: [
      { id: "A", text: "x = 5", isCorrect: false },
      { id: "B", text: "x = 6", isCorrect: true },
      { id: "C", text: "x = 7", isCorrect: false },
      { id: "D", text: "x = 8", isCorrect: false },
    ],
    explanation: "$2x = 17 - 5 = 12$, demak $x = 6$",
    difficulty: 1,
    topic: "Algebra",
  },
  {
    text: "Uchburchakning ichki burchaklari yig'indisi necha gradus?",
    options: [
      { id: "A", text: "90°", isCorrect: false },
      { id: "B", text: "180°", isCorrect: true },
      { id: "C", text: "270°", isCorrect: false },
      { id: "D", text: "360°", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Geometriya",
  },
  {
    text: "$\\sin^2(x) + \\cos^2(x) = ?$",
    options: [
      { id: "A", text: "0", isCorrect: false },
      { id: "B", text: "1", isCorrect: true },
      { id: "C", text: "2", isCorrect: false },
      { id: "D", text: "tg(x)", isCorrect: false },
    ],
    explanation: "Pifagor identitligi: $\\sin^2 x + \\cos^2 x = 1$",
    difficulty: 2,
    topic: "Trigonometriya",
  },
  {
    text: "Funksiya $f(x) = 3x^2 + 2x$ ning $x = 2$ nuqtadagi qiymati?",
    options: [
      { id: "A", text: "14", isCorrect: false },
      { id: "B", text: "16", isCorrect: true },
      { id: "C", text: "18", isCorrect: false },
      { id: "D", text: "20", isCorrect: false },
    ],
    explanation: "$f(2) = 3 \\cdot 4 + 2 \\cdot 2 = 12 + 4 = 16$",
    difficulty: 2,
    topic: "Algebra",
  },
];

// FIZIKA
export const FIZIKA: SeedQuestion[] = [
  {
    text: "Yorug'lik tezligi vakuumda taxminan necha m/s?",
    options: [
      { id: "A", text: "$3 \\times 10^5$", isCorrect: false },
      { id: "B", text: "$3 \\times 10^6$", isCorrect: false },
      { id: "C", text: "$3 \\times 10^8$", isCorrect: true },
      { id: "D", text: "$3 \\times 10^{10}$", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Optika",
  },
  {
    text: "Nyutonning ikkinchi qonuniga ko'ra $F = ?$",
    options: [
      { id: "A", text: "$ma$", isCorrect: true },
      { id: "B", text: "$\\frac{m}{a}$", isCorrect: false },
      { id: "C", text: "$\\frac{a}{m}$", isCorrect: false },
      { id: "D", text: "$m + a$", isCorrect: false },
    ],
    explanation: "Kuch jismning massasi va tezlanishining ko'paytmasiga teng: F=ma",
    difficulty: 1,
    topic: "Mexanika",
  },
  {
    text: "Erkin tushish tezlanishi g taxminan nechaga teng?",
    options: [
      { id: "A", text: "5.6 m/s²", isCorrect: false },
      { id: "B", text: "9.8 m/s²", isCorrect: true },
      { id: "C", text: "12.5 m/s²", isCorrect: false },
      { id: "D", text: "20 m/s²", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Mexanika",
  },
];

// KIMYO
export const KIMYO: SeedQuestion[] = [
  {
    text: "Suvning kimyoviy formulasi qaysi?",
    options: [
      { id: "A", text: "H₂O", isCorrect: true },
      { id: "B", text: "CO₂", isCorrect: false },
      { id: "C", text: "O₂", isCorrect: false },
      { id: "D", text: "H₂O₂", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Anorganik",
  },
  {
    text: "Mendeleyev davriy sistemasida birinchi element qaysi?",
    options: [
      { id: "A", text: "Geliy (He)", isCorrect: false },
      { id: "B", text: "Vodorod (H)", isCorrect: true },
      { id: "C", text: "Litiy (Li)", isCorrect: false },
      { id: "D", text: "Kislorod (O)", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Anorganik",
  },
  {
    text: "Atomning yadrosi qaysi zarralardan tashkil topgan?",
    options: [
      { id: "A", text: "Faqat protonlar", isCorrect: false },
      { id: "B", text: "Faqat neytronlar", isCorrect: false },
      { id: "C", text: "Proton va neytronlar", isCorrect: true },
      { id: "D", text: "Proton va elektronlar", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Umumiy kimyo",
  },
];

// BIOLOGIYA
export const BIOLOGIYA: SeedQuestion[] = [
  {
    text: "Inson tanasidagi eng katta organ qaysi?",
    options: [
      { id: "A", text: "Yurak", isCorrect: false },
      { id: "B", text: "Jigar", isCorrect: false },
      { id: "C", text: "Teri", isCorrect: true },
      { id: "D", text: "Miya", isCorrect: false },
    ],
    explanation: "Teri inson tanasidagi eng katta organ hisoblanadi",
    difficulty: 1,
    topic: "Anatomiya",
  },
  {
    text: "Fotosintez jarayonida o'simliklar qaysi gazni yutadi?",
    options: [
      { id: "A", text: "Kislorod (O₂)", isCorrect: false },
      { id: "B", text: "Karbonat angidrid (CO₂)", isCorrect: true },
      { id: "C", text: "Azot (N₂)", isCorrect: false },
      { id: "D", text: "Vodorod (H₂)", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Botanika",
  },
];

// ONA-TILI
export const ONA_TILI: SeedQuestion[] = [
  {
    text: "\"Kitob\" so'zining tub shakli qaysi?",
    options: [
      { id: "A", text: "Kitob", isCorrect: true },
      { id: "B", text: "Kitobxon", isCorrect: false },
      { id: "C", text: "Kitobchi", isCorrect: false },
      { id: "D", text: "Kitobcha", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Morfologiya",
  },
  {
    text: "O'zbek tilida nechta unli tovush mavjud?",
    options: [
      { id: "A", text: "5", isCorrect: false },
      { id: "B", text: "6", isCorrect: true },
      { id: "C", text: "7", isCorrect: false },
      { id: "D", text: "8", isCorrect: false },
    ],
    explanation: "O'zbek tilida 6 ta unli tovush bor: a, e, i, o, u, o'",
    difficulty: 1,
    topic: "Fonetika",
  },
];

// ADABIYOT
export const ADABIYOT: SeedQuestion[] = [
  {
    text: "\"O'tkan kunlar\" romanining muallifi kim?",
    options: [
      { id: "A", text: "Cho'lpon", isCorrect: false },
      { id: "B", text: "Abdulla Qodiriy", isCorrect: true },
      { id: "C", text: "Oybek", isCorrect: false },
      { id: "D", text: "G'afur G'ulom", isCorrect: false },
    ],
    difficulty: 1,
    topic: "XX asr",
  },
  {
    text: "Alisher Navoiyning \"Xamsa\" asari nechta dostondan iborat?",
    options: [
      { id: "A", text: "3", isCorrect: false },
      { id: "B", text: "4", isCorrect: false },
      { id: "C", text: "5", isCorrect: true },
      { id: "D", text: "6", isCorrect: false },
    ],
    explanation: "\"Xamsa\" - 5 ta dostonli majmua: Hayrat ul-abror, Farhod va Shirin, Layli va Majnun, Sabbai sayyor, Saddi Iskandariy",
    difficulty: 2,
    topic: "Mumtoz adabiyot",
  },
];

// TARIX
export const TARIX: SeedQuestion[] = [
  {
    text: "O'zbekiston Respublikasi mustaqillik kunini qaysi sanada nishonlaydi?",
    options: [
      { id: "A", text: "1-sentyabr", isCorrect: true },
      { id: "B", text: "8-sentyabr", isCorrect: false },
      { id: "C", text: "9-sentyabr", isCorrect: false },
      { id: "D", text: "1-oktyabr", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Mustaqillik davri",
  },
  {
    text: "Amir Temur saltanati poytaxti qaysi shahar edi?",
    options: [
      { id: "A", text: "Toshkent", isCorrect: false },
      { id: "B", text: "Buxoro", isCorrect: false },
      { id: "C", text: "Samarqand", isCorrect: true },
      { id: "D", text: "Shahrisabz", isCorrect: false },
    ],
    difficulty: 1,
    topic: "O'zbekiston tarixi",
  },
];

// INGLIZ TILI
export const INGLIZ_TILI: SeedQuestion[] = [
  {
    text: "Choose the correct article: ___ apple a day keeps the doctor away.",
    options: [
      { id: "A", text: "A", isCorrect: false },
      { id: "B", text: "An", isCorrect: true },
      { id: "C", text: "The", isCorrect: false },
      { id: "D", text: "—", isCorrect: false },
    ],
    explanation: "Use 'an' before vowel sounds. 'Apple' starts with vowel 'a'.",
    difficulty: 1,
    topic: "Grammar",
  },
  {
    text: "What is the past tense of \"go\"?",
    options: [
      { id: "A", text: "goed", isCorrect: false },
      { id: "B", text: "gone", isCorrect: false },
      { id: "C", text: "went", isCorrect: true },
      { id: "D", text: "going", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Grammar",
  },
];

// RUS TILI
export const RUS_TILI: SeedQuestion[] = [
  {
    text: "Найдите существительное во множественном числе:",
    options: [
      { id: "A", text: "стол", isCorrect: false },
      { id: "B", text: "книга", isCorrect: false },
      { id: "C", text: "дома", isCorrect: true },
      { id: "D", text: "окно", isCorrect: false },
    ],
    difficulty: 1,
    topic: "Грамматика",
  },
];

export const ALL_QUESTIONS: Record<string, SeedQuestion[]> = {
  "matematika": MATEMATIKA,
  "fizika": FIZIKA,
  "kimyo": KIMYO,
  "biologiya": BIOLOGIYA,
  "ona-tili": ONA_TILI,
  "adabiyot": ADABIYOT,
  "tarix": TARIX,
  "ingliz-tili": INGLIZ_TILI,
  "rus-tili": RUS_TILI,
};

// Generator: 200 ta savol uchun matematika misollari
export function generateMathQuestions(count: number): SeedQuestion[] {
  const questions: SeedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
    let correct: number;
    if (op === "+") correct = a + b;
    else if (op === "-") correct = a - b;
    else correct = a * b;

    const wrong1 = correct + Math.floor(Math.random() * 5) + 1;
    const wrong2 = correct - Math.floor(Math.random() * 5) - 1;
    const wrong3 = correct + Math.floor(Math.random() * 10) - 5;

    const opts = [
      { id: "A", text: String(correct), isCorrect: true },
      { id: "B", text: String(wrong1), isCorrect: false },
      { id: "C", text: String(wrong2), isCorrect: false },
      { id: "D", text: String(wrong3), isCorrect: false },
    ];
    // Aralashtirish
    opts.sort(() => Math.random() - 0.5);
    opts.forEach((o, idx) => (o.id = String.fromCharCode(65 + idx)));

    questions.push({
      text: `Hisoblang: $${a} ${op === "*" ? "\\cdot" : op} ${b} = ?$`,
      options: opts,
      difficulty: 1,
      topic: "Algebra",
    });
  }
  return questions;
}
