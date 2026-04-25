export interface TestListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  totalMarks: number;
  passingScore: number;
  visibility: string;
}

export interface TestOption {
  id: string;
  text: string;
}

export interface TestQuestionNode {
  id: string;
  marks: number;
  question: {
    title: string;
    description: string;
  };
  options: TestOption[];
}

export interface TestDetail extends TestListItem {
  questions: TestQuestionNode[];
}

export interface AttemptStartResponse {
  id: string;
  testId: string;
  startedAt: string;
  status: string;
}
