'use client';
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { PublicationCard } from '@/components/publication-card';
import { type Publication } from '@/lib/publications';
import { Search } from 'lucide-react';

type PublicationListProps = {
  publications: Publication[];
};

export default function PublicationList({ publications }: PublicationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPublications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return publications;
    }
    return publications.filter(
      pub =>
        pub.title.toLowerCase().includes(query) ||
        pub.summary.toLowerCase().includes(query) ||
        pub.authors.join(' ').toLowerCase().includes(query) ||
        pub.topics.join(' ').toLowerCase().includes(query)
    );
  }, [publications, searchQuery]);

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4 text-center px-4">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Explore NASA Bioscience
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Search, discover, and summarize decades of space biology research.
        </p>
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by keyword, topic, author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-full pl-10 py-6 text-base shadow-inner"
          />
        </div>
      </div>

      {filteredPublications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
          {filteredPublications.map(pub => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-lg font-semibold text-foreground">No results found</p>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}
