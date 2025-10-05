'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Publication } from '@/lib/publication-type';
import { CalendarDays, Users, BookOpen, FlaskConical, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TargetedSummaryDialog } from './targeted-summary-dialog';

type PublicationCardProps = {
  publication: Publication;
};

export function PublicationCard({ publication }: PublicationCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="font-headline text-xl leading-snug">{publication.title}</CardTitle>
          <CardDescription className="flex items-center gap-4 pt-2 text-xs">
            {publication.authors.length > 0 && (
                <span className="flex items-center gap-1.5">
                <Users className="h-3 w-3" /> {publication.authors.join(', ')}
                </span>
            )}
             {publication.publicationYear && (
                <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" /> {publication.publicationYear}
                </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow text-sm text-muted-foreground">
          <p>{publication.summary}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
           {publication.link && (
            <Button asChild variant="outline" className="w-full">
              <a href={publication.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Source
              </a>
            </Button>
          )}
          <Button onClick={() => setIsDialogOpen(true)} className="w-full bg-primary/90 hover:bg-primary">
            <BookOpen className="mr-2 h-4 w-4" />
            Read & Summarize
          </Button>
        </CardFooter>
      </Card>
      {isDialogOpen && <TargetedSummaryDialog publication={publication} open={isDialogOpen} onOpenChange={setIsDialogOpen} />}
    </>
  );
}
