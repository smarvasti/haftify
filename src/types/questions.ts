export interface Answer {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Question {
  id: string;
  text: string;
  points: number;
  answers: Answer[];
  explanation?: string;
  isMultipleChoice?: boolean;
}

export interface Category {
  id: string;
  title: string;
  questions: Question[];
}

export interface Module {
  id: string;
  title: string;
  categories: Category[];
}

export interface Catalog {
  id: string;
  year: number;
  title: string;
  modules: Module[];
}

export interface QuestionProgress {
  questionId: string;
  isCorrect: boolean;
  selectedAnswers: string[];
} 