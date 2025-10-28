
export interface Prompt {
  id: number;
  fullPrompt: string;
  category: string;

  // New fields for prompt creation. Made optional for backward compatibility with stored data.
  // New prompts will always have these populated (except referenceImage).
  mainCategory?: string;
  subCategory?: string;
  referenceImage?: string;

  // Old fields for backward compatibility.
  persona?: string;
  task?: string;
  format?: string;
  context?: string;
  examples?: string;
}

export interface Profile {
  prompts: Prompt[];
}

export interface ProfilesData {
  currentUser: string | null;
  profiles: Record<string, Profile>;
}
