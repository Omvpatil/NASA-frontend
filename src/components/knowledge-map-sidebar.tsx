// src/components/knowledge-map-sidebar.tsx
'use client';
import { type Node } from 'reactflow';
import { type Publication } from '@/lib/publication-type';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Book, FlaskConical, Dna, Rocket, Download, ExternalLink } from 'lucide-react';
import { handleExport } from '@/lib/export';

type KnowledgeMapSidebarProps = {
  node: Node;
  publications: Publication[];
  onNodeSelectById: (nodeId: string) => void;
};

export default function KnowledgeMapSidebar({ node, publications, onNodeSelectById }: KnowledgeMapSidebarProps) {
  const { type, label } = node.data;

  const getRelatedPublications = () => {
    if (type === 'publication') {
      return [node.data.publication as Publication];
    }
    // This will likely not work well until topics are properly tagged
    return publications.filter(p => p.topics.includes(label as string));
  };
  
  const relatedPublications = getRelatedPublications();

  const onExport = (format: 'pdf' | 'csv') => {
    handleExport(format, node, relatedPublications);
  };


  const renderPublicationDetails = () => {
    const pub = node.data.publication as Publication;
    if (!pub) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-start gap-2">
            <Book className="h-5 w-5 mt-1 text-primary" />
            <span>{pub.title}</span>
          </CardTitle>
          <CardDescription>{pub.authors.join(', ')} ({pub.publicationYear})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">{pub.summary}</p>
          {pub.link && (
             <Button asChild variant="outline" className="w-full">
                <a href={pub.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Source Publication
                </a>
            </Button>
          )}
          {pub.topics && pub.topics.length > 0 && pub.topics[0] !== 'Uncategorized' && (
            <div>
              <h4 className="font-semibold mb-2">Related Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {pub.topics.map(topic => (
                  <Button
                    key={topic}
                    variant="outline"
                    size="sm"
                    className="h-auto"
                    onClick={() => onNodeSelectById(`topic-${topic.replace(/\s+/g, '-')}`)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTopicDetails = () => {
    const icon = {
        'topic': <FlaskConical className="h-5 w-5 mt-1 text-accent" />,
        'organism': <Dna className="h-5 w-5 mt-1 text-blue-500" />,
        'environment': <Rocket className="h-5 w-5 mt-1 text-green-600" />
    }[type] || <FlaskConical className="h-5 w-5 mt-1 text-accent" />;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-start gap-2">
            {icon}
            <span>{label}</span>
          </CardTitle>
           <CardDescription>
            <Badge variant={type === 'topic' ? 'default' : 'secondary'}>{type}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-2">Related Publications ({relatedPublications.length}):</h4>
          <ScrollArea className="h-96">
            <div className="space-y-2">
            {relatedPublications.map(pub => (
              <Button
                key={pub.id}
                variant="ghost"
                className="w-full h-auto justify-start text-left"
                onClick={() => onNodeSelectById(`pub-${pub.id}`)}
              >
                {pub.title}
              </Button>
            ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-4 flex flex-col h-full">
      <h3 className="font-headline text-xl font-bold">Details</h3>
      <div className="flex-grow">
        {type === 'publication' ? renderPublicationDetails() : renderTopicDetails()}
      </div>
      <div className="flex-shrink-0">
          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Export</CardTitle>
                <CardDescription>Export the current selection and related data.</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-4">
                 <Button onClick={() => onExport('pdf')} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
                <Button onClick={() => onExport('csv')} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}
