// src/components/insights/gaps-section.tsx
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type GapsSectionProps = {
  data: {
    topic: string;
    organism: string | null;
    environment: string | null;
    count: number;
  }[];
};

export default function GapsSection({ data }: GapsSectionProps) {
  const createDashboardLink = (gap: GapsSectionProps['data'][0]) => {
    const params = new URLSearchParams();
    params.append('topics', gap.topic);
    if (gap.organism) params.append('organisms', gap.organism);
    if (gap.environment) params.append('environments', gap.environment);
    return `/dashboard?${params.toString()}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Gaps</CardTitle>
        <CardDescription>
          Potentially under-studied areas based on combinations of topics, organisms, and environments with few publications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Organism</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead className="text-center">Count</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((gap, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{gap.topic}</TableCell>
                <TableCell>{gap.organism || '-'}</TableCell>
                <TableCell>{gap.environment || '-'}</TableCell>
                <TableCell className="text-center">{gap.count}</TableCell>
                <TableCell className="text-right">
                   <Button asChild variant="ghost" size="sm">
                     <Link href={createDashboardLink(gap)}>
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
