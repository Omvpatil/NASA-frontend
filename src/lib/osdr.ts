// src/lib/osdr.ts
'use server';
import type { Publication } from './publication-type';
import publicationData from './publications.json';

// A simplified, in-memory cache to avoid re-reading the file on every request during a single server render pass.
let publicationsCache: Publication[] | null = null;

function transformDataToPublication(data: any, index: number): Publication {
  const id = data.link || data.source_link || `pub-${index}`;
  const link = data.link || data.source_link;
  const summary = data.abstract || 'No summary available.';
  const authors = data.authors || ['Unknown Author'];
  
  // Use a regex to find a year in the link, or default to a recent year.
  const yearMatch = link.match(/(\d{4})/);
  const publicationYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

  const fullText = [
    `Title: ${data.title}`,
    `Authors: ${authors.join(', ')}`,
    `Year: ${publicationYear}`,
    `\n--- Introduction ---\n${data.introduction}`,
    `\n--- Methods ---\n${data.methods}`,
    `\n--- Results ---\n${data.results}`,
    `\n--- Conclusion ---\n${data.conclusions}`
  ].join('\n\n');

  const topics = data.keywords && data.keywords.length > 0 ? data.keywords : ['Uncategorized'];

  return {
    ...data,
    id,
    link,
    authors,
    publicationYear,
    summary,
    fullText,
    topics,
  };
}


export async function getPublications(): Promise<Publication[]> {
  if (publicationsCache) {
    return publicationsCache;
  }

  console.log('Loading publications from src/lib/publications.json...');

  try {
    // We assume publicationData is now the array from the new JSON structure.
    const transformedData = publicationData.map(transformDataToPublication);
    publicationsCache = transformedData;
    console.log(`Successfully loaded and transformed ${transformedData.length} publications.`);
    return transformedData;

  } catch (error) {
    console.error('Failed to load or parse publications.json:', error);
    // In case of an error, return an empty array so the app doesn't crash.
    return [];
  }
}
