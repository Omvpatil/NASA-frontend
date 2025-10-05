// src/lib/publication-type.ts

export type Publication = {
  // From the provided JSON schema
  title: string;
  link: string;
  source: string;
  authors: string[];
  publicationYear: number;
  abstract: string;
  introduction: string;
  methods: string;
  results: string;
  conclusions: string;
  keywords: string[];

  // Fields derived for application use
  id: string; // A unique ID for each publication, can be derived from the link or title
  summary: string; // Derived from abstract
  fullText: string; // A combination of all sections for summarization
  topics: string[]; // Derived from keywords
};
