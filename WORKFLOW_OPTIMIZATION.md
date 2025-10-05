# 🚀 Workflow Diagram Optimization & Theme Toggle

## ✨ What's New

### 1. **Intelligent LLM-Powered Workflow Analysis**

The workflow diagram now uses AI to analyze paper relationships and create meaningful visualizations.

#### Features:

-   **Theme Identification**: AI extracts main research themes from papers
-   **Methodology Categorization**: Papers are grouped by research stage/methodology
-   **Smart Relationships**: AI identifies how papers relate (builds_on, validates, contradicts, extends)
-   **Key Contributions**: Each paper's main contribution is identified

#### Backend Changes (`main.py`):

```python
@app.post("/workflow")
async def generate_workflow(request: OnDemandSearchQuery):
    """
    Generate intelligent ReactFlow workflow using LLM analysis
    - Analyzes paper relationships
    - Categorizes by methodology
    - Creates hierarchical node structure
    """
```

**LLM Prompt Structure:**

```json
{
    "main_themes": ["theme1", "theme2", "theme3"],
    "methodology_stages": ["stage1", "stage2", "stage3"],
    "paper_categorization": {
        "0": {
            "category": "experimental_study",
            "stage": "data_collection",
            "key_contribution": "brief description"
        }
    },
    "relationships": [
        {
            "from": 0,
            "to": 1,
            "type": "builds_on|validates|contradicts|extends",
            "description": "brief explanation"
        }
    ]
}
```

### 2. **Dark/Light Theme Toggle for Workflow**

Added independent theme control for workflow diagrams.

#### UI Changes:

-   ✅ **Theme Toggle Button**: Switch between light and dark mode for workflow
-   ✅ **Separate from App Theme**: Workflow theme is independent
-   ✅ **Dual Control**: Available in both regular and fullscreen modes
-   ✅ **Custom Styling**: Professional monochrome color scheme

#### Buttons Added:

```tsx
<Button onClick={() => setWorkflowTheme(theme === "light" ? "dark" : "light")}>
    {theme === "light" ? <Moon /> : <Sun />}
    {theme === "light" ? "Dark" : "Light"}
</Button>
```

### 3. **Enhanced Visual Design**

#### Node Types:

1. **Query Node** (Starting Point)

    - Light: Black background, white text
    - Dark: White background, black text
    - Larger size, bold text

2. **Theme Nodes** (Research Themes)

    - Light: Gray background
    - Dark: Dark gray background
    - Medium size

3. **Paper Nodes** (Research Papers)
    - Light: White background, gray border
    - Dark: Dark background, lighter border
    - Shows: Title, PMCID, Category, Contribution
    - Hover effects with shadow

#### Edge Types:

1. **Query Edges**: Connect query to themes

    - Animated flow
    - Bold stroke

2. **Theme-Paper Edges**: Connect themes to papers

    - Standard flow

3. **Relationship Edges**: Connect related papers
    - `builds_on`: Green, animated
    - `extends`: Blue, animated
    - `validates`: Purple
    - `contradicts`: Red, dashed

### 4. **Smart Layout Algorithm**

Papers are positioned intelligently:

-   **By Category**: Papers in same category are grouped
-   **By Methodology Stage**: Vertical positioning by research stage
-   **Theme Hierarchy**: Query → Themes → Papers structure
-   **Auto-spacing**: Prevents overlapping

## 📁 Files Modified

### Backend:

-   ✅ `main.py` - Enhanced `/workflow` endpoint with LLM analysis

### Frontend:

-   ✅ `src/app/search/page.tsx` - Added theme toggle and state management
-   ✅ `src/app/search/workflow-styles.css` - Custom workflow styling (NEW)

## 🎨 Color Scheme

### Light Mode:

-   **Query**: `#000000` (Black)
-   **Themes**: `#f3f4f6` (Gray 100)
-   **Papers**: `#ffffff` (White)
-   **Edges**: `#9ca3af` (Gray 400)
-   **Relationships**: Green/Blue/Purple/Red

### Dark Mode:

-   **Query**: `#ffffff` (White)
-   **Themes**: `#1f2937` (Gray 800)
-   **Papers**: `#111827` (Gray 900)
-   **Edges**: `#6b7280` (Gray 500)
-   **Relationships**: Lighter variants

## 🔧 How to Use

### 1. Search for Papers

```
Enter query → Click Search
```

### 2. View Workflow

```
Click "Workflow" tab
```

### 3. Toggle Theme

```
Click Moon/Sun icon button
```

### 4. Fullscreen Mode

```
Click "Fullscreen" button → Theme toggle available
```

## 🎯 Benefits

1. **Better Understanding**: AI reveals hidden relationships between papers
2. **Visual Clarity**: Theme-based organization shows research landscape
3. **Flexible Viewing**: Light/dark modes for different environments
4. **Rich Metadata**: Each node shows paper contribution and category
5. **Interactive**: Hover effects and smooth animations

## 🔄 API Response Structure

The `/workflow` endpoint now returns:

```json
{
    "nodes": [
        {
            "id": "query",
            "type": "input",
            "data": {
                "label": "search query",
                "type": "query"
            },
            "className": "query-node"
        },
        {
            "id": "paper_0",
            "data": {
                "label": "Paper Title",
                "pmcid": "PMC123456",
                "category": "experimental",
                "stage": "methodology",
                "contribution": "Key finding",
                "type": "paper"
            },
            "className": "paper-node"
        }
    ],
    "edges": [
        {
            "source": "paper_0",
            "target": "paper_1",
            "type": "smoothstep",
            "label": "builds on",
            "className": "relationship-builds_on",
            "animated": true
        }
    ],
    "analysis": {
        "main_themes": [...],
        "methodology_stages": [...],
        "paper_categorization": {...},
        "relationships": [...]
    }
}
```

## 🚀 Future Enhancements

1. **Export Diagram**: Save as PNG/SVG
2. **Filter by Category**: Show/hide specific paper types
3. **Timeline View**: Chronological arrangement
4. **Citation Links**: Click to view paper details
5. **Collaborative Annotations**: Add notes to nodes

---

**Status**: ✅ Complete and Working
**Backend**: Enhanced with LLM analysis
**Frontend**: Theme toggle + custom styling
**Testing**: Ready for use
