# 🚀 Quick Start: Workflow Feature

## ✨ What's New

Your NASA Knowledge Engine now has an **interactive research workflow diagram** with:

-   🔗 Visual paper relationship mapping
-   🖥️ **Fullscreen mode** for detailed viewing
-   📊 Optimized UI with efficient space usage
-   🎨 Professional design and smooth interactions

---

## 🏃 Quick Test (2 Minutes)

### 1. Start Backend

```bash
cd "/home/om_patil/Desktop/Codes/projects/NASA/NASA Project"
source .venv/bin/activate.fish
uvicorn main:app --reload
```

### 2. Start Frontend

```bash
# New terminal
cd "/home/om_patil/Desktop/Codes/projects/NASA/NASA-frontend"
npm run dev
```

### 3. Test in Browser

1. Open: `http://localhost:3000/search`
2. Enter query: **"How does microgravity affect bone density?"**
3. Click **Search** (or press Enter)
4. Wait for results
5. Click **"Workflow"** tab
6. See the interactive diagram! 🎉
7. Click **"Fullscreen"** button (top-right)
8. Explore in full viewport
9. Click **"Exit Fullscreen"** to return

---

## 🎯 What to Expect

### Normal View

```
┌─────────────────────────────┐
│  Chat | Images | Workflow   │  ← Click Workflow
├─────────────────────────────┤
│          [🔲 Fullscreen]    │  ← Click to expand
│ ┌─────────────────────────┐ │
│ │   [Query Node]          │ │
│ │   /    |    \           │ │
│ │ [P1] [P2] [P3]          │ │
│ │                         │ │
│ │ [Controls]  [MiniMap]   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Fullscreen View

```
┌───────────────────────────────────┐
│ 🔗 Research Workflow  [Exit]      │
│ Query: "..." • 10 papers          │
├───────────────────────────────────┤
│                                   │
│    [Large Interactive Diagram]    │
│                                   │
└───────────────────────────────────┘
```

---

## 🎮 Controls

### Mouse

-   **Pan**: Click & drag on empty space
-   **Zoom**: Mouse wheel or trackpad pinch
-   **Move Nodes**: Click & drag any node
-   **MiniMap**: Click to jump to area

### Buttons

-   **Fullscreen**: Expand to full viewport
-   **Exit Fullscreen**: Return to normal view
-   **Fit View**: Center and zoom to fit (in Controls)
-   **Zoom +/-**: In Controls panel

---

## 📋 Features Checklist

Test these features:

### Basic Functionality

-   [ ] Search returns results in Chat tab
-   [ ] Images tab shows extracted images
-   [ ] Workflow tab loads diagram
-   [ ] Diagram shows query node + paper nodes
-   [ ] Edges connect query to papers

### Workflow Interactions

-   [ ] Can pan the diagram
-   [ ] Can zoom in/out
-   [ ] Can drag nodes
-   [ ] MiniMap updates when panning
-   [ ] Controls work (zoom, fit view)

### Fullscreen Mode

-   [ ] Fullscreen button visible (top-right)
-   [ ] Clicking shows fullscreen overlay
-   [ ] Header shows query and paper count
-   [ ] Diagram renders correctly
-   [ ] Can interact (pan, zoom, drag)
-   [ ] Exit button returns to normal view
-   [ ] Diagram state preserved

### UI/UX

-   [ ] No excessive empty space
-   [ ] Diagram fills available height
-   [ ] Loading spinner shows while generating
-   [ ] Empty state message when no search
-   [ ] Professional look and feel

---

## 🔧 Troubleshooting

### Workflow tab is empty

**Issue**: "Search for papers to see research workflow"
**Solution**: Perform a search first, then click Workflow tab

### Diagram not visible

**Issue**: Blank white area
**Solution**:

1. Check browser console (F12) for errors
2. Ensure backend is running
3. Try clicking "Fit View" in Controls

### Fullscreen not working

**Issue**: Button doesn't respond
**Solution**:

1. Check if workflow loaded (must have data)
2. Refresh page and try again
3. Check browser console for errors

### Layout looks wrong

**Issue**: UI elements misaligned
**Solution**:

1. Clear browser cache
2. Restart frontend: `rm -rf .next && npm run dev`
3. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)

---

## 📚 Documentation

For more details, see:

-   **COMPLETE_WORKFLOW_SUMMARY.md** - Full overview
-   **WORKFLOW_VISUAL_GUIDE.md** - Before/after comparison
-   **FULLSCREEN_WORKFLOW_UPDATE.md** - Fullscreen feature details
-   **WORKFLOW_TESTING_GUIDE.md** - Detailed testing

---

## 🎉 Success!

If you can:

1. ✅ Search for papers
2. ✅ See workflow diagram in Workflow tab
3. ✅ Toggle fullscreen mode
4. ✅ Interact with diagram (pan, zoom, drag)

**Congratulations!** The workflow feature is working perfectly! 🚀

---

## 📸 Expected Result

Your search page should now have three tabs, and the Workflow tab should show an interactive diagram like this:

```
          [Query: Your Search Query]
                 /    |    \
            [Paper 1] [Paper 2] [Paper 3]
               |         |         |
            [Paper 4] [Paper 5] [Paper 6]
```

With:

-   Purple query node at top
-   Gray paper nodes in grid
-   Blue animated edges
-   Controls for zoom/pan
-   MiniMap in corner
-   Fullscreen button

Enjoy exploring research visually! 🔬📊
