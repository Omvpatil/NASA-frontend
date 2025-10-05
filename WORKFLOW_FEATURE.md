# Research Workflow Diagram Feature

## Overview

Added a new **Workflow** tab to the search page that displays a visual diagram of research paper relationships using ReactFlow. The diagram shows how papers connect to each other based on the search query.

## What Was Added

### Backend Changes (`main.py`)

#### New Endpoint: `/workflow`

-   **Method**: POST
-   **Purpose**: Generate ReactFlow-compatible JSON schema from search results
-   **Input**: Same as search endpoint (query, num_results, etc.)
-   **Output**:
    ```json
    {
      "nodes": [...],
      "edges": [...],
      "query": "user query",
      "num_papers": 10
    }
    ```

#### Node Structure

```json
{
    "id": "paper_0",
    "type": "default",
    "data": {
        "label": "Paper Title (truncated to 50 chars)",
        "pmcid": "PMC123456",
        "title": "Full Paper Title",
        "source": "https://..."
    },
    "position": { "x": 100, "y": 150 },
    "style": {
        "background": "#f3f4f6",
        "border": "2px solid #e5e7eb",
        "borderRadius": "8px",
        "padding": "10px",
        "width": 250
    }
}
```

#### Edge Structure

```json
{
    "id": "query-paper_0",
    "source": "query",
    "target": "paper_0",
    "type": "smoothstep",
    "animated": true,
    "style": { "stroke": "#6366f1" }
}
```

#### Workflow Generation Logic

1. **Query Node**: Central input node representing the user's search query (purple background)
2. **Paper Nodes**: Grid layout (3 papers per row) showing retrieved papers
3. **Query → Paper Edges**: Animated connections from query to each paper
4. **Paper → Paper Edges**: Dashed connections between related papers (consecutive papers in results)

### Frontend Changes

#### Dependencies Added

-   **reactflow**: `npm install reactflow`
    -   Visual workflow diagram library
    -   Includes nodes, edges, controls, minimap, background

#### Updated Files

##### 1. `src/lib/api-client.ts`

**New Interfaces**:

```typescript
export interface WorkflowNode {
    id: string;
    type?: string;
    data: {
        label: string;
        pmcid?: string;
        title?: string;
        source?: string;
    };
    position: { x: number; y: number };
    style?: Record<string, any>;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
    animated?: boolean;
    style?: Record<string, any>;
}

export interface WorkflowResponse {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    query: string;
    num_papers: number;
}
```

**New Method**:

```typescript
async getWorkflow(query: SearchQuery): Promise<WorkflowResponse>
```

##### 2. `src/app/actions.ts`

**New Server Action**:

```typescript
export async function getWorkflowAction(
    query: string,
    numResults = 10,
    googleApiKey?: string,
    modelName = "gemini-2.5-flash"
);
```

-   Calls `/workflow` endpoint
-   Returns workflow data or error

##### 3. `src/app/search/page.tsx`

**New Imports**:

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network } from "lucide-react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
} from "reactflow";
import "reactflow/dist/style.css";
```

**New State Variables**:

```typescript
const [workflowData, setWorkflowData] = useState<WorkflowResponse | null>(null);
const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
```

**Modified `handleSearch()` Function**:

-   Now also calls `loadWorkflow(query)` in background after search
-   Workflow loads asynchronously without blocking chat response

**New `loadWorkflow()` Function**:

```typescript
const loadWorkflow = async (query: string) => {
  setIsLoadingWorkflow(true);
  try {
    const { result, error } = await getWorkflowAction(...);
    if (result) {
      setWorkflowData(result);
      setNodes(result.nodes as Node[]);
      setEdges(result.edges as Edge[]);
    }
  } finally {
    setIsLoadingWorkflow(false);
  }
};
```

**New Tab Structure**:

```tsx
<Tabs defaultValue="chat" className="flex-1 flex flex-col">
    <TabsList className="grid w-full grid-cols-3 mb-3">
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="workflow">Workflow</TabsTrigger>
    </TabsList>

    <TabsContent value="chat">...</TabsContent>
    <TabsContent value="images">...</TabsContent>
    <TabsContent value="workflow">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
        >
            <Background />
            <Controls />
            <MiniMap />
        </ReactFlow>
    </TabsContent>
</Tabs>
```

## How It Works

### User Flow

1. **User enters search query** → Click "Search"
2. **Search executes** → Chat shows answer, Images tab populated
3. **Workflow loads** (background) → Switch to "Workflow" tab
4. **See visual diagram** → Interactive graph showing paper relationships

### Workflow Visualization

-   **Central Query Node** (purple): User's search query
-   **Paper Nodes** (gray): Retrieved research papers arranged in grid
-   **Animated Edges** (blue): Show connection from query to papers
-   **Relationship Edges** (dashed gray): Show related papers
-   **Interactive Controls**: Pan, zoom, drag nodes
-   **MiniMap**: Overview of entire diagram

### Visual Features

-   **Responsive Layout**: Papers arranged in 3-column grid
-   **Auto-fit View**: Diagram auto-centers on load
-   **Draggable Nodes**: Rearrange diagram manually
-   **Hover Details**: Node shows full title on hover
-   **Loading State**: Spinner while generating workflow
-   **Empty State**: Shows message when no search performed

## Benefits

1. **Visual Understanding**: See research landscape at a glance
2. **Paper Relationships**: Understand how papers connect
3. **Query Context**: Central node shows what question drove the search
4. **Interactive Exploration**: Pan, zoom, drag to explore
5. **Lightweight**: Returns only JSON schema, no heavy computation

## Usage Example

### Search Query

```
"How does microgravity affect bone density?"
```

### Generated Workflow

```
        [Query: microgravity bone density]
               /     |     \
              /      |      \
         Paper1   Paper2   Paper3
           |        |        |
         Paper4   Paper5   Paper6
```

### ReactFlow Schema

```json
{
    "nodes": [
        {
            "id": "query",
            "type": "input",
            "data": { "label": "How does microgravity affect bone density?" },
            "position": { "x": 250, "y": 0 }
        },
        {
            "id": "paper_0",
            "type": "default",
            "data": {
                "label": "Effects of Microgravity on Osteoblast Differ...",
                "pmcid": "PMC7654321",
                "title": "Effects of Microgravity on Osteoblast Differentiation"
            },
            "position": { "x": 100, "y": 150 }
        }
    ],
    "edges": [
        {
            "id": "query-paper_0",
            "source": "query",
            "target": "paper_0",
            "type": "smoothstep",
            "animated": true
        }
    ]
}
```

## Technical Notes

### Performance

-   Workflow generation is **asynchronous** (doesn't block search)
-   Uses same vector search as main query (no additional scraping)
-   Returns lightweight JSON (nodes + edges only)

### Limitations

-   Shows only similarity-based relationships (not citation links)
-   Maximum papers shown = `num_results` setting (5-20)
-   Node positions are auto-calculated (grid layout)

### Future Enhancements

-   **Citation Links**: Show actual paper citations
-   **Clustering**: Group papers by topic
-   **Custom Layouts**: Force-directed, hierarchical, circular
-   **Node Click**: Open paper details in modal
-   **Export**: Save diagram as PNG/SVG
-   **Shared Workflows**: Share diagram URL

## Testing

### Backend Test

```bash
curl -X POST http://localhost:8000/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "query": "microgravity bone density",
    "num_results": 5,
    "use_llm": false
  }'
```

### Frontend Test

1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Navigate to `/search`
4. Enter query and search
5. Click "Workflow" tab
6. Verify interactive diagram appears

## File Changes Summary

### Backend

-   ✅ `main.py`: Added `/workflow` endpoint (lines 649-755)

### Frontend

-   ✅ `package.json`: Added `reactflow` dependency
-   ✅ `src/lib/api-client.ts`: Added WorkflowNode, WorkflowEdge, WorkflowResponse interfaces + getWorkflow() method
-   ✅ `src/app/actions.ts`: Added getWorkflowAction() server action
-   ✅ `src/app/search/page.tsx`: Added Tabs, Workflow tab, ReactFlow visualization

## Dependencies

### Python (Backend)

-   No new dependencies (uses existing vector search)

### TypeScript (Frontend)

-   `reactflow` (^11.x): Main workflow visualization library
    -   Provides Node, Edge, ReactFlow, Background, Controls, MiniMap
    -   Includes CSS styles for diagram rendering
