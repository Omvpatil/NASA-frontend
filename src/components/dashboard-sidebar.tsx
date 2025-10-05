// src/components/dashboard-sidebar.tsx
'use client';
import { useMemo } from 'react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Publication } from '@/lib/publication-type';

type DashboardSidebarProps = {
  selectedTopics: string[];
  selectedOrganisms: string[];
  selectedEnvironments: string[];
  onFilterChange: (filterType: 'topics' | 'organisms' | 'environments', value: string) => void;
  allPublications: Publication[];
};

export default function DashboardSidebar({
  selectedTopics,
  selectedOrganisms,
  selectedEnvironments,
  onFilterChange,
  allPublications,
}: DashboardSidebarProps) {
  const { topics, organisms, environments } = useMemo(() => {
    const allTopics = new Set<string>();
    // These are hardcoded for now as the API doesn't provide this structured data.
    // In a real scenario, this would be derived from the data.
    const allOrganisms = new Set<string>(['Rodent Model']);
    const allEnvironments = new Set<string>(['Spaceflight', 'Microgravity']);

    allPublications.forEach(p => {
      p.topics.forEach(t => allTopics.add(t));
    });

    return {
      topics: [...allTopics].sort(),
      organisms: [...allOrganisms].sort(),
      environments: [...allEnvironments].sort(),
    };
  }, [allPublications]);


  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Filters</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Research Topics</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {topics.map(topic => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      id={`topic-${topic}`}
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => onFilterChange('topics', topic)}
                    />
                    <Label htmlFor={`topic-${topic}`} className="font-normal">
                      {topic}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Organisms</h4>
              <div className="space-y-2">
                {organisms.map(organism => (
                  <div key={organism} className="flex items-center space-x-2">
                    <Checkbox
                      id={`org-${organism}`}
                      checked={selectedOrganisms.includes(organism)}
                      onCheckedChange={() => onFilterChange('organisms', organism)}
                    />
                    <Label htmlFor={`org-${organism}`} className="font-normal">
                      {organism}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Space Environments</h4>
              <div className="space-y-2">
                {environments.map(env => (
                  <div key={env} className="flex items-center space-x-2">
                    <Checkbox
                      id={`env-${env}`}
                      checked={selectedEnvironments.includes(env)}
                      onCheckedChange={() => onFilterChange('environments', env)}
                    />
                    <Label htmlFor={`env-${env}`} className="font-normal">
                      {env}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
