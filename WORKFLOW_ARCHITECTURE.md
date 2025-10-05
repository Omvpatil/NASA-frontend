# Workflow Feature Architecture

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                            │
│                         (Next.js Frontend)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
            ┌───────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
            │   Chat Tab   │ │ Images │ │  Workflow  │
            │              │ │  Tab   │ │    Tab     │
            │  - AI Answer │ │- Image │ │ - ReactFlow│
            │  - Citations │ │ Gallery│ │ - Diagram  │
            └───────┬──────┘ └───┬────┘ └─────┬──────┘
                    │            │            │
                    └────────────┼────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Server Actions        │
                    │  - searchPapersAction   │
                    │  - getWorkflowAction    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    API Client           │
                    │  - search()             │
                    │  - getWorkflow()        │
                    └────────────┬────────────┘
                                 │
                                 │ HTTP
                                 │
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND API                                 │
│                      (FastAPI Python)                               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────┐
            │  /search     │ │ /workflow │ │ Database  │
            │              │ │           │ │           │
            │- Vector DB   │ │- Same     │ │- Papers   │
            │- Scraping    │ │  Search   │ │- Metadata │
            │- LLM Answer  │ │- Generate │ │           │
            │- Images      │ │  Nodes    │ │           │
            │              │ │- Generate │ │           │
            │              │ │  Edges    │ │           │
            └──────────────┘ └───────────┘ └───────────┘
                    │            │
                    └────────────┼────────────┐
                                 │            │
                    ┌────────────▼────────┐   │
                    │   ChromaDB          │   │
                    │  Vector Store       │   │
                    │  - Embeddings       │   │
                    │  - Similarity Search│   │
                    └─────────────────────┘   │
                                              │
                            ┌─────────────────▼───────────┐
                            │   SQLite Database           │
                            │  - Paper tracking           │
                            │  - Load status              │
                            │  - Metadata                 │
                            └─────────────────────────────┘
```

## 🔄 Data Flow

### Search Flow (Traditional)

```
User Query → searchPapersAction() → POST /search
                                        │
                                        ├─> Vector Search (ChromaDB)
                                        ├─> Scrape Papers (if needed)
                                        ├─> Extract Images
                                        ├─> Generate LLM Answer
                                        │
                                        ▼
                            SearchResponse (JSON)
                                        │
                                        ├─> Chat Tab (answer + citations)
                                        └─> Images Tab (image gallery)
```

### Workflow Flow (New Feature)

```
User Query → getWorkflowAction() → POST /workflow
                                      │
                                      ├─> Vector Search (ChromaDB)
                                      ├─> Generate Query Node
                                      ├─> Generate Paper Nodes
                                      ├─> Calculate Positions
                                      ├─> Generate Edges
                                      │
                                      ▼
                          WorkflowResponse (JSON)
                              {
                                nodes: [...],
                                edges: [...]
                              }
                                      │
                                      ▼
                          ReactFlow Diagram
                                      │
                                      └─> Workflow Tab (interactive visualization)
```

## 🏗️ Component Hierarchy

### Frontend Component Tree

```
SearchPage
├── Settings Sidebar (Card)
│   ├── Results Count (Select)
│   ├── AI Answer Toggle (Checkbox)
│   ├── Model Selection (Select)
│   └── API Key Input
│
└── Main Content (Card)
    ├── Tabs Component
    │   ├── TabsList
    │   │   ├── Chat TabsTrigger
    │   │   ├── Images TabsTrigger
    │   │   └── Workflow TabsTrigger
    │   │
    │   ├── Chat TabsContent
    │   │   ├── ScrollArea
    │   │   │   └── Messages (User + Assistant)
    │   │   │       ├── Avatar
    │   │   │       ├── Card
    │   │   │       ├── MarkdownRenderer
    │   │   │       └── Source Documents
    │   │   └── (inherited Search Input below)
    │   │
    │   ├── Images TabsContent
    │   │   └── Image Grid
    │   │       └── Cards (images)
    │   │
    │   └── Workflow TabsContent
    │       └── ReactFlow
    │           ├── Nodes (query + papers)
    │           ├── Edges (connections)
    │           ├── Background (grid)
    │           ├── Controls (zoom, pan)
    │           └── MiniMap
    │
    └── Search Input (outside tabs)
        ├── Input field
        └── Search Button
```

## 📦 Module Dependencies

### Backend Dependencies

```
FastAPI ──> Endpoints
   │
   ├─> langchain ──> Text splitting, prompts
   ├─> langchain_community ──> ChromaDB, embeddings
   ├─> langchain_google_genai ──> Gemini LLM
   ├─> BeautifulSoup ──> Web scraping
   ├─> pandas ──> CSV processing
   └─> database_manager ──> SQLite tracking
```

### Frontend Dependencies

```
Next.js (React)
   │
   ├─> reactflow ──> Workflow visualization (NEW)
   ├─> @radix-ui/react-tabs ──> Tab component
   ├─> lucide-react ──> Icons (Network, Bot, etc.)
   ├─> @/components/ui ──> shadcn components
   └─> Server Actions ──> API communication
```

## 🔌 API Endpoints

### Existing Endpoints

| Method | Path              | Purpose                     |
| ------ | ----------------- | --------------------------- |
| POST   | `/search`         | Main search with LLM answer |
| GET    | `/papers`         | List all papers             |
| GET    | `/database/stats` | Database statistics         |
| POST   | `/load-papers`    | Load papers to vector store |

### New Endpoint (Added)

| Method | Path        | Purpose                   | Input               | Output           |
| ------ | ----------- | ------------------------- | ------------------- | ---------------- |
| POST   | `/workflow` | Generate workflow diagram | OnDemandSearchQuery | WorkflowResponse |

## 📝 Data Schemas

### WorkflowResponse Schema

```typescript
{
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  query: string,
  num_papers: number
}
```

### WorkflowNode Schema

```typescript
{
  id: string,                    // "query" or "paper_0", "paper_1"...
  type?: string,                 // "input" (query) or "default" (paper)
  data: {
    label: string,               // Display text
    pmcid?: string,              // PMC ID (papers only)
    title?: string,              // Full title (papers only)
    source?: string              // URL (papers only)
  },
  position: {
    x: number,                   // X coordinate
    y: number                    // Y coordinate
  },
  style?: {
    background: string,          // Node color
    border: string,              // Border style
    borderRadius: string,        // Corner radius
    padding: string,             // Internal padding
    width: number                // Node width
  }
}
```

### WorkflowEdge Schema

```typescript
{
  id: string,                    // "query-paper_0" or "paper_0-paper_1"
  source: string,                // Source node ID
  target: string,                // Target node ID
  type?: string,                 // "smoothstep" (curved)
  label?: string,                // Edge label (e.g., "related")
  animated?: boolean,            // Flowing dots animation
  style?: {
    stroke: string,              // Line color
    strokeDasharray?: string     // Dashed pattern
  }
}
```

## 🎨 Visual Design

### Color Scheme

```
Query Node:    #6366f1 (Indigo/Purple)  - Input node
Paper Nodes:   #f3f4f6 (Gray)           - Default nodes
Query Edges:   #6366f1 (Indigo)         - Animated, solid
Related Edges: #9ca3af (Gray)           - Static, dashed
Background:    Grid pattern             - Light gray
```

### Layout Algorithm

```python
# Grid Layout (3 columns)
papers_per_row = 3
x_offset = 100
y_offset = 150
x_spacing = 300
y_spacing = 200

for idx, paper in enumerate(papers):
    row = idx // papers_per_row
    col = idx % papers_per_row
    x = x_offset + (col * x_spacing)
    y = y_offset + (row * y_spacing)

    create_node(x, y)
```

### Node Positioning Example

```
Query (250, 0)

Paper0      Paper1      Paper2
(100,150)   (400,150)   (700,150)

Paper3      Paper4      Paper5
(100,350)   (400,350)   (700,350)
```

## 🔐 State Management

### Frontend State Variables

```typescript
// Search state
const [messages, setMessages] = useState<SearchMessage[]>([]);
const [inputValue, setInputValue] = useState("");
const [numResults, setNumResults] = useState(10);

// Workflow state (NEW)
const [workflowData, setWorkflowData] = useState<WorkflowResponse | null>(null);
const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);
```

### State Update Flow

```
User enters query
    ↓
handleSearch() called
    ↓
├─> searchPapersAction()
│   └─> Update messages state
│       └─> Chat + Images tabs refresh
│
└─> loadWorkflow() [async, non-blocking]
    └─> getWorkflowAction()
        └─> Update workflowData, nodes, edges
            └─> Workflow tab refreshes
```

## 🧠 Algorithm Details

### Workflow Generation (Backend)

```python
def generate_workflow(query, papers):
    nodes = []
    edges = []

    # 1. Create query node
    nodes.append({
        "id": "query",
        "type": "input",
        "data": {"label": query},
        "position": {"x": 250, "y": 0}
    })

    # 2. Create paper nodes (grid layout)
    for idx, paper in enumerate(papers):
        row = idx // 3
        col = idx % 3
        nodes.append({
            "id": f"paper_{idx}",
            "data": {
                "label": paper.title[:50],
                "pmcid": paper.pmcid,
                "title": paper.title
            },
            "position": {
                "x": 100 + col * 300,
                "y": 150 + row * 200
            }
        })

        # 3. Connect query to paper
        edges.append({
            "id": f"query-paper_{idx}",
            "source": "query",
            "target": f"paper_{idx}",
            "animated": True
        })

    # 4. Connect related papers
    for i in range(len(papers) - 1):
        for j in range(i + 1, min(i + 2, len(papers))):
            edges.append({
                "id": f"paper_{i}-paper_{j}",
                "source": f"paper_{i}",
                "target": f"paper_{j}",
                "label": "related",
                "style": {"strokeDasharray": "5,5"}
            })

    return {"nodes": nodes, "edges": edges}
```

## 🚀 Performance Characteristics

| Metric           | Value     | Notes                           |
| ---------------- | --------- | ------------------------------- |
| Endpoint Latency | ~500ms    | Same as /search (vector search) |
| JSON Size        | ~5-20KB   | For 5-20 papers                 |
| Frontend Render  | <100ms    | ReactFlow initial render        |
| State Updates    | Real-time | No lag on interactions          |
| Memory Usage     | Low       | Only JSON + React state         |

## 🔄 Async Execution Flow

```
User clicks "Search"
    │
    ├─> [Blocking] searchPapersAction()
    │   └─> Shows loading spinner
    │       └─> Updates Chat tab
    │           └─> Hides spinner
    │
    └─> [Non-blocking] loadWorkflow()
        └─> Shows workflow loading state
            └─> Updates Workflow tab
                └─> Shows diagram
```

This ensures:

-   Chat answer appears immediately
-   Workflow loads in background
-   No blocking of UI thread
-   Better user experience

## 📚 Related Files

### Backend

-   `main.py` - Workflow endpoint implementation
-   `database_manager.py` - Paper database operations

### Frontend

-   `src/app/search/page.tsx` - Main search UI with tabs
-   `src/lib/api-client.ts` - API client methods
-   `src/app/actions.ts` - Server actions
-   `src/components/ui/tabs.tsx` - Tab component

### Documentation

-   `WORKFLOW_FEATURE.md` - Feature documentation
-   `WORKFLOW_IMPLEMENTATION_SUMMARY.md` - Implementation guide
-   `WORKFLOW_TESTING_GUIDE.md` - Testing instructions
-   `WORKFLOW_ARCHITECTURE.md` - This file
