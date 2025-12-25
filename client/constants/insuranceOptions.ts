// تم استخراج الخيارات من ملف syrian_insurance_calculator_v2.html

export const INSURANCE_CATEGORIES = [
  { value: "01", label: "خاصة (أفراد)" },
  { value: "02", label: "عامة (تجارية)" },
  { value: "03", label: "حكومية" },
  { value: "04", label: "تأجير (تاكسي)" },
] as const;

export const CLASSIFICATIONS = [
  { value: "0", label: "غير حكومية (عادي)" },
  { value: "1", label: "حكومية (خصم خاص)" },
  { value: "2", label: "تخفيض طابع" },
  { value: "3", label: "إعفاء طابع" },
] as const;

export const PERIODS_MONTHS = [
  { value: 12, label: "سنة كاملة (12 شهر)" },
  { value: 6, label: "ستة أشهر" },
  { value: 3, label: "ثلاثة أشهر" },
] as const;

export const INTERNAL_VEHICLE_TYPES = [
  { value: "01a", label: "سيارات سياحية – أقل من 14 راكب – أقل من 1600cc" },
  { value: "01b", label: "سيارات سياحية – أقل من 14 راكب – 1600cc إلى 2000cc" },
  { value: "01c", label: "سيارات سياحية – أقل من 14 راكب – أكثر من 2000cc" },
  { value: "02a", label: "نقل – أقل من 14 راكب – أقل من 1600cc" },
  { value: "02b", label: "نقل – أقل من 14 راكب – 1600cc إلى 2000cc" },
  { value: "02c", label: "نقل – أقل من 14 راكب – أكثر من 2000cc" },
  { value: "03a", label: "تكسي – أقل من 14 راكب – أقل من 1600cc" },
  { value: "03b", label: "تكسي – أقل من 14 راكب – 1600cc إلى 2000cc" },
  { value: "03c", label: "تكسي – أقل من 14 راكب – أكثر من 2000cc" },
  { value: "04a", label: "دراجة نارية – أقل من 200cc" },
  { value: "04b", label: "دراجة نارية – 200cc إلى 400cc" },
  { value: "04c", label: "دراجة نارية – أكثر من 400cc" },
  { value: "05a", label: "بولمان – 14 راكب فما فوق – حتى 24 راكب" },
  { value: "05b", label: "بولمان – 25 راكب فما فوق" },
  { value: "06", label: "شاحنات وحمولات – حتى 2 طن" },
  { value: "07", label: "شاحنات وحمولات – 2 إلى 5 طن" },
  { value: "08", label: "شاحنات وحمولات – أكثر من 5 طن" },
  { value: "09", label: "جرارات زراعية" },
  { value: "10", label: "آليات إنشائية" },
  { value: "11", label: "سيارات إسعاف" },
  { value: "12", label: "سيارات إطفاء" },
  { value: "13", label: "سيارات حكومية" },
  { value: "14", label: "سيارات أجرة" },
  { value: "15", label: "مركبات خاصة أخرى" },
  { value: "16", label: "مركبات عامة أخرى" },
  { value: "17", label: "مركبات حكومية أخرى" },
  { value: "18", label: "مركبات تأجير أخرى" },
  { value: "19", label: "مقطورات" },
  { value: "20", label: "نصف مقطورة" },
  { value: "21", label: "سيارات سياحية – كهربائية" },
  { value: "22", label: "دراجة نارية – كهربائية" },
  { value: "23", label: "بولمان – كهربائي" },
  { value: "24", label: "شاحنات – كهربائي" },
  { value: "25", label: "آليات إنشائية – كهربائي" },
  { value: "26", label: "سيارات خاصة – ديزل" },
  { value: "27", label: "سيارات عامة – ديزل" },
  { value: "28", label: "تكسي – ديزل" },
  { value: "29", label: "بولمان – ديزل" },
  { value: "30", label: "شاحنات – ديزل" },
  { value: "31", label: "آليات إنشائية – ديزل" },
  { value: "32", label: "جرارات – ديزل" },
  { value: "33", label: "سيارات سياحية – أكثر من 14 راكب" },
  { value: "34", label: "نقل – أكثر من 14 راكب" },
  { value: "35", label: "تكسي – أكثر من 14 راكب" },
  { value: "36", label: "مركبات أخرى – خاصة" },
] as const;

export const BORDER_VEHICLE_TYPES = [
  { value: "tourist", label: "سيارات سياحية (حدودي)" },
  { value: "motorcycle", label: "دراجات نارية (حدودي)" },
  { value: "bus", label: "باصات نقل (حدودي)" },
  { value: "other", label: "بقية الفئات (حدودي)" },
] as const;
