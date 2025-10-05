'use client';
import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type Publication } from '@/lib/publication-type';
import { generateTargetedSummaryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const SECTIONS_AVAILABLE = ['Introduction', 'Methods', 'Results', 'Conclusion', 'Abstract'];
const SECTIONS_FOR_SUMMARY = ['Introduction', 'Methods', 'Results', 'Conclusion'];


type TargetedSummaryDialogProps = {
  publication: Publication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TargetedSummaryDialog({
  publication,
  open,
  onOpenChange,
}: TargetedSummaryDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedSections, setSelectedSections] = useState<string[]>(['Introduction', 'Results', 'Conclusion']);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleGenerateSummary = () => {
    if (selectedSections.length === 0) {
      toast({
        title: 'No Sections Selected',
        description: 'Please select at least one section to summarize.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      setSummary(null);
      const result = await generateTargetedSummaryAction(
        publication.fullText,
        selectedSections
      );

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setSummary(result.summary);
      }
    });
  };
  
  const publicationSections = [
    { title: 'Abstract', content: publication.abstract },
    { title: 'Introduction', content: publication.introduction },
    { title: 'Methods', content: publication.methods },
    { title: 'Results', content: publication.results },
    { title: 'Conclusion', content: publication.conclusions },
  ].filter(section => section.content && section.content.trim() !== 'No abstract available.');


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl pr-8">{publication.title}</DialogTitle>
          <DialogDescription>
            {publication.authors.join(', ')} - {publication.publicationYear}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 h-full overflow-hidden">
          <div className="flex flex-col gap-4 overflow-hidden">
            <h3 className="font-headline text-lg font-semibold">Full Text</h3>
            <ScrollArea className="flex-grow rounded-md border p-4">
               {publicationSections.map((section, index) => (
                <div key={index} className="mb-6">
                  <h4 className="font-headline text-md font-semibold mb-2">{section.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                </div>
              ))}
              {publicationSections.length === 0 && (
                <p className="text-sm text-muted-foreground">Full text sections for this publication are not available.</p>
              )}
            </ScrollArea>
          </div>
          <div className="flex flex-col gap-4 overflow-hidden">
            <h3 className="font-headline text-lg font-semibold">Targeted Summarization</h3>
            <div className="rounded-md border p-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Select the sections you want the AI to focus on for the summary.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {SECTIONS_FOR_SUMMARY.map(section => (
                  <div key={section} className="flex items-center space-x-2">
                    <Checkbox
                      id={section}
                      checked={selectedSections.includes(section)}
                      onCheckedChange={() => handleSectionToggle(section)}
                      disabled={!publication.fullText || !publication.fullText.includes(`--- ${section} ---`)}
                    />
                    <Label htmlFor={section}>{section}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerateSummary} disabled={isPending || !publication.fullText}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Summary
            </Button>
            
            <div className="flex-grow flex flex-col mt-4 overflow-hidden">
              <Separator />
              <h4 className="font-headline my-4 text-md font-semibold">Generated Summary</h4>
              {isPending ? (
                 <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted"></div>
                </div>
              ) : summary ? (
                <ScrollArea className="flex-grow">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{summary}</p>
                </ScrollArea>
              ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Your AI-generated summary will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
