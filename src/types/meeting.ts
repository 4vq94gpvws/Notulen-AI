export interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  done: boolean;
}

export interface Decision {
  id: string;
  text: string;
  context?: string;
}

export interface FollowUp {
  id: string;
  text: string;
  deadline?: string;
  responsible?: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  audioBlob?: Blob;
  transcript?: string;
  summary?: string;
  decisions: Decision[];
  actionItems: ActionItem[];
  followUps: FollowUp[];
  status: 'recording' | 'transcribing' | 'analyzing' | 'done' | 'error';
  error?: string;
}

export interface ApiKeys {
  groqKey: string;
  openRouterKey: string;
}
