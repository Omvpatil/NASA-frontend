// src/components/insights/consensus-section.tsx
'use client';
import { useState, useTransition, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';
import { analyzeConsensusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Publication } from '@/lib/publication-type';

type ConsensusState = 'consistent' | 'mixed' | 'contradictory' | null;

export default function ConsensusSection({ allPublications }: { allPublications: Publication[] }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [consensus, setConsensus] = useState<{ state: ConsensusState; supportingPublications: string[] } | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const majorTopics = useMemo(() => {
        const topicCounts = allPublications.flatMap(p => p.topics).reduce((acc, topic) => {
            acc[topic] = (acc[topic] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15)
            .map(([name]) => name);
    }, [allPublications]);


    const handleAnalyze = () => {
        if (!selectedTopic) return;
        startTransition(async () => {
            setConsensus(null);
            const result = await analyzeConsensusAction(selectedTopic);
            if(result.error) {
                 toast({
                    title: 'Error Analyzing Consensus',
                    description: result.error,
                    variant: 'destructive',
                });
                setConsensus(null);
            } else {
                setConsensus(result.consensus);
            }
        });
    };

  const getBadgeVariant = (state: ConsensusState) => {
    switch (state) {
      case 'consistent': return 'default';
      case 'mixed': return 'secondary';
      case 'contradictory': return 'destructive';
      default: return 'outline';
    }
  }
  
  const getSupportingPublications = () => {
    if(!consensus?.supportingPublications) return [];
    return allPublications.filter(p => consensus.supportingPublications.includes(p.id));
  }


  if (!isClient) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Consensus vs. Divergence</CardTitle>
                <CardDescription>
                Loading...
                </CardDescription>
            </CardHeader>
             <CardContent className="h-96" />
        </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Consensus vs. Divergence</CardTitle>
        <CardDescription>
          Analyze AI-summarized results to gauge consensus on key topics. This feature is experimental and may produce unexpected results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Select onValueChange={setSelectedTopic} value={selectedTopic}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a major topic" />
            </SelectTrigger>
            <SelectContent>
              {majorTopics.map(topic => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAnalyze} disabled={isPending || !selectedTopic}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze
          </Button>
        </div>
        
        {isPending && (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-24 w-full" />
            </div>
        )}

        {consensus && (
            <div className="pt-4 space-y-4">
                <h4 className="font-semibold">Analysis for: {selectedTopic}</h4>
                <div className="flex items-center gap-2">
                    <span className="font-medium">Consensus State:</span>
                    {consensus.state ? (
                         <Badge variant={getBadgeVariant(consensus.state)} className="text-sm">
                            {consensus.state}
                        </Badge>
                    ) : (
                        <span>Not available</span>
                    )}
                </div>
                 <div>
                    <h5 className="font-medium mb-2">Supporting Publications ({getSupportingPublications().length}):</h5>
                    <div className="space-y-2">
                        {getSupportingPublications().map(pub => (
                            <div key={pub.id} className="p-2 border rounded-md text-sm">
                                <p className="font-semibold">{pub.title}</p>
                                <p className="text-muted-foreground line-clamp-2">{pub.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </CardContent>
    </Card>
  );
}

function Skeleton({className}: {className?: string}) {
    return <div className={`animate-pulse bg-muted rounded-md ${className}`} />;
}
