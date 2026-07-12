interface StoreQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  animeTitle?: string;
  animeImage?: string;
}

const dynamicQuestions = new Map<string, StoreQuestion>();

export function storeQuestions(questions: StoreQuestion[]) {
  for (const q of questions) {
    dynamicQuestions.set(q.id, q);
  }
  if (dynamicQuestions.size > 500) {
    const keys = [...dynamicQuestions.keys()].slice(0, 200);
    for (const k of keys) dynamicQuestions.delete(k);
  }
}

export function findQuestion(id: string): StoreQuestion | undefined {
  return dynamicQuestions.get(id);
}
