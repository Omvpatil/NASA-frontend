// src/components/knowledge-map.tsx
'use client';

import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type Publication } from '@/lib/publications';

type KnowledgeMapProps = {
  publications: Publication[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  selectedNodeId?: string | null;
};

const nodeColor = (type: string) => {
  switch (type) {
    case 'publication':
      return 'hsl(var(--primary))';
    case 'topic':
      return 'hsl(var(--accent))';
    case 'organism':
      return '#3b82f6';
    case 'environment':
      return '#16a34a';
    default:
      return '#A0A0A0';
  }
};

const getNodeType = (topic: string) => {
    const organisms = ['Arabidopsis Thaliana', 'Rodent Model', 'Dwarf Wheat'];
    const environments = ['Spaceflight', 'Lunar Regolith', 'Galactic Cosmic Rays', 'Microgravity'];

    if (organisms.includes(topic)) return 'organism';
    if (environments.includes(topic)) return 'environment';
    return 'topic';
}


export default function KnowledgeMap({
  publications,
  onNodeClick,
  onPaneClick,
  selectedNodeId,
}: KnowledgeMapProps) {
  const { setNodes, setEdges, fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    const topicNodes = new Map<string, Node>();

    publications.forEach((pub) => {
      const pubNode: Node = {
        id: `pub-${pub.id}`,
        type: 'default',
        data: { label: pub.title, type: 'publication', publication: pub },
        position: { x: Math.random() * 1200, y: Math.random() * 800 },
        style: {
          background: nodeColor('publication'),
          color: 'hsl(var(--primary-foreground))',
          width: 180,
          fontSize: '12px',
          textAlign: 'center',
        },
      };
      initialNodes.push(pubNode);

      pub.topics.forEach(topic => {
        let topicNode = topicNodes.get(topic);
        if (!topicNode) {
          const type = getNodeType(topic);
          topicNode = {
            id: `topic-${topic.replace(/\s+/g, '-')}`,
            type: 'default',
            data: { label: topic, type: type },
            position: { x: Math.random() * 1200, y: Math.random() * 800 },
            style: {
              background: nodeColor(type),
              color: 'hsl(var(--accent-foreground))',
            },
          };
          topicNodes.set(topic, topicNode);
        }

        initialEdges.push({
          id: `edge-${pub.id}-${topic.replace(/\s+/g, '-')}`,
          source: pubNode.id,
          target: topicNode.id,
          animated: false,
        });
      });
    });

    initialNodes.push(...Array.from(topicNodes.values()));

    return { nodes: initialNodes, edges: initialEdges };
  }, [publications]);

  useEffect(() => {
    setNodes(
      nodes.map(n => ({
        ...n,
        style: {
          ...n.style,
          opacity: selectedNodeId ? (n.id === selectedNodeId ? 1 : 0.5) : 1,
          border: n.id === selectedNodeId ? '2px solid hsl(var(--ring))' : n.style?.border,
        },
      }))
    );
    setEdges(
      edges.map(e => ({
        ...e,
        style: {
          ...e.style,
          opacity: selectedNodeId ? (e.source === selectedNodeId || e.target === selectedNodeId ? 1 : 0.3) : 1,
        },
         animated: selectedNodeId ? (e.source === selectedNodeId || e.target === selectedNodeId) : false,
      }))
    );
  }, [selectedNodeId, nodes, edges, setNodes, setEdges]);
  
    useEffect(() => {
        setNodes(nodes);
        setEdges(edges);
        setTimeout(() => {
            fitView();
        }, 100);
    }, [nodes, edges, setNodes, setEdges, fitView]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
      >
        <Controls />
        <MiniMap nodeColor={n => nodeColor(n.data.type || '')} />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}
