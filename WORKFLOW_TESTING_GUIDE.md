# Quick Start Guide: Testing Workflow Feature

## 🚀 Steps to Test

### 1. Start Backend Server

```bash
# Navigate to backend folder
cd "/home/om_patil/Desktop/Codes/projects/NASA/NASA Project"

# Activate virtual environment (if not already active)
source .venv/bin/activate.fish

# Start FastAPI server
uvicorn main:app --reload
```

**Expected Output**:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Start Frontend Server

```bash
# Open NEW terminal
cd "/home/om_patil/Desktop/Codes/projects/NASA/NASA-frontend"

# Start Next.js dev server
npm run dev
```

**Expected Output**:

```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in XXXms
```

### 3. Test Workflow Endpoint (Optional - Backend Only)

```bash
# In a third terminal, test the new endpoint directly
curl -X POST http://localhost:8000/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "query": "microgravity bone density",
    "num_results": 5,
    "use_llm": false
  }'
```

**Expected**: JSON response with `nodes` and `edges` arrays

### 4. Test in Browser

1. **Open Browser**: Navigate to `http://localhost:3000/search`

2. **Enter Search Query**:

    - Example: "How does microgravity affect bone density?"
    - Example: "What are the effects of spaceflight on muscle mass?"

3. **Click Search Button** (or press Enter)

4. **Observe**:

    - ✅ **Chat Tab**: Shows AI-generated answer with citations
    - ✅ **Images Tab**: Displays extracted research images
    - ✅ **Workflow Tab**: Should show loading spinner, then diagram

5. **Click "Workflow" Tab**:
    - Should see interactive diagram with:
        - Purple query node at top
        - Gray paper nodes in grid layout
        - Blue animated edges connecting query to papers
        - Dashed edges between related papers
        - Controls panel (zoom +/-, fit view, lock)
        - MiniMap in bottom-right corner

### 5. Test Workflow Interactions

#### Pan the Diagram

-   Click and drag on empty space
-   Should move entire diagram

#### Zoom

-   Use mouse wheel to zoom in/out
-   OR use +/- buttons in controls panel
-   OR pinch-to-zoom on trackpad

#### Drag Nodes

-   Click and drag any paper node
-   Node should move freely
-   Edges should follow the node

#### Fit View

-   Click "Fit View" button in controls
-   Diagram should auto-center and zoom to fit all nodes

#### MiniMap Navigation

-   Click anywhere in MiniMap (bottom-right)
-   View should jump to that area

### 6. Verify Data

#### Check Node Content

-   Hover over paper nodes
-   Should see truncated title (max 50 chars)
-   Metadata includes:
    -   Full title
    -   PMCID
    -   Source URL

#### Check Edge Animations

-   Query → Paper edges should be animated (flowing dots)
-   Paper → Paper edges should be dashed (static)

#### Check Layout

-   Papers should be arranged in 3-column grid
-   Spacing: 300px horizontal, 200px vertical

## 🐛 Troubleshooting

### Issue: Workflow Tab Shows "Search for papers to see research workflow"

**Cause**: No search performed yet
**Solution**: Enter query and click Search

### Issue: Workflow Tab Shows Loading Spinner Forever

**Possible Causes**:

1. Backend not running → Check terminal 1
2. Network error → Check browser console (F12)
3. Backend error → Check backend terminal for errors

**Debug**:

```bash
# Check if endpoint is accessible
curl http://localhost:8000/workflow -X POST -H "Content-Type: application/json" -d '{"query":"test","num_results":5,"use_llm":false}'
```

### Issue: Diagram Appears But No Nodes Visible

**Cause**: Nodes might be outside viewport
**Solution**: Click "Fit View" button in controls

### Issue: TypeScript Errors in Console

**Check**: Browser console (F12) → Console tab
**Look for**: Red error messages
**Common Fix**:

```bash
# Restart frontend with clean cache
rm -rf .next
npm run dev
```

### Issue: CORS Error

**Error**: "Access to fetch blocked by CORS policy"
**Cause**: Backend CORS not configured
**Solution**: Already handled in `main.py` (allow_origins=["*"])

### Issue: 404 Error on /workflow

**Cause**: Backend not updated or not running
**Solution**:

1. Verify `main.py` has `/workflow` endpoint (line 649-755)
2. Restart backend: `uvicorn main:app --reload`

## ✅ Success Checklist

-   [ ] Backend running on port 8000
-   [ ] Frontend running on port 3000
-   [ ] Search page loads without errors
-   [ ] Can enter query and search
-   [ ] Chat tab shows answer
-   [ ] Images tab shows pictures (if available)
-   [ ] Workflow tab shows diagram
-   [ ] Can pan/zoom/drag in workflow
-   [ ] MiniMap displays correctly
-   [ ] Controls panel works (zoom, fit view)

## 📸 Expected Visual

### Workflow Tab - Empty State

```
┌─────────────────────────────────────┐
│         🔗 Network Icon             │
│  Search for papers to see research  │
│           workflow                  │
└─────────────────────────────────────┘
```

### Workflow Tab - Loaded

```
┌─────────────────────────────────────┐
│  [Controls: +/-/⊡]    [MiniMap]     │
│                                     │
│         [Query Node - Purple]       │
│         /      |       \            │
│    [Paper1] [Paper2] [Paper3]       │
│       |        |         |          │
│    [Paper4] [Paper5] [Paper6]       │
│                                     │
└─────────────────────────────────────┘
```

## 🎉 You're Done!

The workflow feature is successfully implemented if you can:

1. Search for papers ✅
2. See workflow diagram in Workflow tab ✅
3. Interact with diagram (pan/zoom/drag) ✅
4. View query and paper nodes ✅
5. See animated edges ✅

## 🔗 Related Documentation

-   `WORKFLOW_FEATURE.md` - Comprehensive feature documentation
-   `WORKFLOW_IMPLEMENTATION_SUMMARY.md` - Implementation details
-   `README.md` - Main project documentation
