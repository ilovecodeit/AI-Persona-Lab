export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type PersonaId = 'socrates' | 'jobs' | 'prince' | 'holmes';

export interface Persona {
  id: PersonaId;
  name: string;
  title: string;
  description: string;
  emoji: string;
  color: string; // Tailwind bg color class
  borderColor: string;
  welcomeMessage: string;
}

export interface PersonaChatState {
  personaId: PersonaId;
  messages: Message[];
  isLoading: boolean;
}

export interface ConceptTranslation {
  keyword: string;
  childStyle: string;
  snsStyle: string;
  academicStyle: string;
}

export interface CreativeSynopsis {
  title: string;
  synopsis: string;
  characters: {
    name: string;
    role: string;
    description: string;
  }[];
  openingScene: string;
  keyThemes: string[];
}
