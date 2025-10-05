# Workflow Diagram Implementation Summary

## 🎯 Feature Overview

Added an interactive **Research Workflow Diagram** visualization to the search interface using ReactFlow. Users can now see a visual representation of how research papers relate to their search query and to each other.

## 📋 Changes Made

### 1. Backend (Python/FastAPI)

#### File: `main.py`

**New Endpoint Added**: `POST /workflow`

-   **Location**: Lines 649-755
-   **Purpose**: Generate ReactFlow-compatible JSON schema from database search results
-   **Input**: OnDemandSearchQuery (same as /search endpoint)
-   **Output**:
    ```python
    {
        "nodes": [...],  # ReactFlow nodes
        "edges": [...],  # ReactFlow edges
        "query": str,
        "num_papers": int
    }
    ```

**Implementation Details**:

-   Uses existing vector store search (no additional scraping)
-   Creates query node as central starting point
-   Generates paper nodes in 3-column grid layout
-   Auto-calculates positions (x, y coordinates)
-   Creates animated edges from query to papers
-   Creates relationship edges between consecutive papers
-   Returns lightweight JSON (no heavy LLM processing)

### 2. Frontend (Next.js/React/TypeScript)

#### File: `package.json`

**New Dependency**:

```json
"reactflow": "^11.x"
```

Installed via: `npm install reactflow`

#### File: `src/lib/api-client.ts`

**New TypeScript Interfaces**:

```typescript
export interface WorkflowNode {
    id: string;
    type?: string;
    data: { label: string; pmcid?: string; title?: string; source?: string };
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

**New API Method**:

```typescript
async getWorkflow(query: SearchQuery): Promise<WorkflowResponse>
```

-   Calls POST /workflow endpoint
-   Returns workflow diagram data

#### File: `src/app/actions.ts`

**New Server Action**:

```typescript
export async function getWorkflowAction(
    query: string,
    numResults = 10,
    googleApiKey?: string,
    modelName = "gemini-2.5-flash"
);
```

-   Server-side wrapper for workflow API call
-   Handles errors gracefully
-   Returns `{ result, error }` tuple

#### File: `src/app/search/page.tsx`

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

**New Functions**:

```typescript
const loadWorkflow = async (query: string) => {
    // Loads workflow data asynchronously
    // Updates nodes and edges state
};

const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);
```

**UI Changes**:

-   Replaced single CardContent with **Tabs component**
-   Added 3 tabs: **Chat**, **Images**, **Workflow**
-   Tab structure:
    ```tsx
    <Tabs defaultValue="chat">
        <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">{/* Chat messages */}</TabsContent>
        <TabsContent value="images">{/* Image gallery */}</TabsContent>
        <TabsContent value="workflow">
            <ReactFlow nodes={nodes} edges={edges}>
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </TabsContent>
    </Tabs>
    ```

**Workflow Tab Features**:

-   **Loading State**: Shows spinner while generating diagram
-   **Empty State**: Message when no search performed
-   **Interactive Diagram**:
    -   Pan and zoom controls
    -   Draggable nodes
    -   MiniMap for navigation
    -   Background grid pattern
-   **Auto-fit View**: Diagram centers automatically on load

### 3. Documentation

#### File: `WORKFLOW_FEATURE.md`

Comprehensive documentation including:

-   Feature overview
-   Implementation details
-   API specifications
-   Usage examples
-   Testing instructions
-   Future enhancements

## 🔄 How It Works

### User Flow

1. User enters search query → clicks "Search"
2. **Chat Tab**: Displays AI answer and citations
3. **Images Tab**: Shows extracted research images
4. **Workflow Tab**: (loads in background)
    - Backend generates ReactFlow schema from search results
    - Frontend renders interactive diagram
    - User can pan, zoom, drag nodes

### Workflow Generation Algorithm

```
1. Create central "query" node (purple, input type)
2. For each paper in search results:
   - Create paper node with title, PMCID, source
   - Calculate grid position (3 papers per row)
   - Add animated edge from query to paper
3. Connect related papers (consecutive in results)
4. Return JSON with nodes + edges
```

### Visual Layout

```
                [Query Node]
               /      |      \
          Paper1   Paper2   Paper3
             |        |        |
          Paper4   Paper5   Paper6
```

## ✅ Features Implemented

-   ✅ Backend `/workflow` endpoint
-   ✅ ReactFlow integration
-   ✅ Three-tab interface (Chat/Images/Workflow)
-   ✅ Interactive diagram with pan/zoom
-   ✅ Auto-generated node positions
-   ✅ Animated edges
-   ✅ Loading and empty states
-   ✅ MiniMap for navigation
-   ✅ Background grid pattern
-   ✅ Async workflow loading (non-blocking)

## 🧪 Testing

### Backend Test

```bash
# Terminal 1: Start backend
cd "NASA Project"
source .venv/bin/activate.fish
uvicorn main:app --reload

# Terminal 2: Test workflow endpoint
curl -X POST http://localhost:8000/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "query": "microgravity bone density",
    "num_results": 5,
    "use_llm": false
  }'
```

**Expected Response**:

```json
{
    "nodes": [
        {
            "id": "query",
            "type": "input",
            "data": { "label": "microgravity bone density" },
            "position": { "x": 250, "y": 0 }
        }
        // ... paper nodes
    ],
    "edges": [
        {
            "id": "query-paper_0",
            "source": "query",
            "target": "paper_0",
            "type": "smoothstep",
            "animated": true
        }
        // ... more edges
    ],
    "query": "microgravity bone density",
    "num_papers": 5
}
```

### Frontend Test

```bash
# Terminal: Start frontend
cd NASA-frontend
npm run dev

# Browser: http://localhost:3000/search
1. Enter query: "How does microgravity affect bone density?"
2. Click "Search"
3. Wait for results
4. Click "Workflow" tab
5. Verify interactive diagram appears
6. Test pan/zoom/drag functionality
```

## 📊 Performance Notes

-   **Non-blocking**: Workflow loads asynchronously (doesn't delay search)
-   **Lightweight**: Returns only JSON schema (no images, minimal data)
-   **Reuses Data**: Uses same vector search as main query
-   **No Extra Scraping**: Works with existing database

## 🔮 Future Enhancements

Potential improvements documented in `WORKFLOW_FEATURE.md`:

-   Citation link visualization (actual paper references)
-   Topic-based clustering
-   Alternative layouts (force-directed, hierarchical, circular)
-   Node click → paper details modal
-   Export diagram as PNG/SVG
-   Shareable workflow URLs
-   Custom node styling based on relevance score

## 📁 Files Modified

### Backend

-   `main.py` (+107 lines) - Added /workflow endpoint

### Frontend

-   `package.json` (+1 dependency) - Added reactflow
-   `src/lib/api-client.ts` (+40 lines) - Added workflow interfaces + method
-   `src/app/actions.ts` (+18 lines) - Added getWorkflowAction
-   `src/app/search/page.tsx` (+150 lines) - Added Tabs, Workflow visualization

### Documentation

-   `WORKFLOW_FEATURE.md` (new file) - Comprehensive feature docs
-   `WORKFLOW_IMPLEMENTATION_SUMMARY.md` (this file) - Quick reference

## 🚀 Ready to Use!

The workflow diagram feature is now fully implemented and ready for testing. Just:

1. Start backend: `uvicorn main:app --reload` (in NASA Project folder)
2. Start frontend: `npm run dev` (in NASA-frontend folder)
3. Navigate to `/search`
4. Enter a query and click "Search"
5. Switch to "Workflow" tab to see the diagram

Enjoy the visual research exploration! 🎉
