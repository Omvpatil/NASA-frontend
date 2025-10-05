# 🖼️ Image Rendering in Chat Responses

## Overview

The system now supports **inline image rendering** directly in chat responses. When the AI mentions figures or images from research papers, they are automatically displayed as beautiful image cards.

## How It Works

### 1. **Backend (Python/FastAPI)**

The backend includes image URLs in the context when generating LLM responses:

```python
# In main.py - /search endpoint
context = f"[Document {i}]\nTitle: {title}\nPMCID: {pmcid}\n"
if img_urls:
    context += f"Images: {', '.join(img_urls[:3])}\n"
context += f"Content: {doc.page_content}\n"
```

The LLM prompt now instructs the AI to use markdown image syntax:

```python
prompt_template = PromptTemplate(
    template=(
        "You are an expert assistant analyzing NASA space biology research papers. "
        "Use the following papers to answer the question. "
        "ALWAYS cite paper Title and PMCID.\n\n"
        "When referencing images/figures from papers, use this EXACT format:\n"
        "![Figure from PMCID](IMAGE_URL)\n\n"
        "Available Papers:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer with citations in markdown format. When mentioning figures, "
        "use the markdown image syntax above with actual image URLs from the context."
    ),
    input_variables=["context", "question"],
)
```

### 2. **Frontend (React/TypeScript)**

The enhanced `MarkdownRenderer` component now:

-   Detects markdown image syntax: `![alt text](url)`
-   Extracts PMCID from alt text
-   Renders beautiful image cards

```tsx
// Image detection regex
const imageMatch = line.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g);

// Render as Card component
<Card className="my-4 overflow-hidden border-gray-200 dark:border-gray-800 group hover:shadow-lg">
    <img
        src={url}
        alt={alt}
        className="w-full h-auto max-h-64 object-contain cursor-pointer"
        onClick={() => window.open(url, "_blank")}
    />
    <CardContent className="p-3">
        <p className="text-xs font-medium">{title}</p>
        {pmcid && <Badge>{pmcid}</Badge>}
    </CardContent>
</Card>;
```

## Usage Examples

### Example 1: AI Response with Images

**User Query:**

```
"What are the key findings about muscle atrophy in microgravity?"
```

**AI Response (with markdown images):**

```markdown
Based on the research papers, muscle atrophy in microgravity shows several key patterns:

1. **Significant muscle loss**: Studies show up to 20% muscle mass reduction (PMCID: PMC123456)

![Figure 1: Muscle fiber changes in microgravity from PMC123456](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC123456/bin/figure1.jpg)

2. **Protein degradation pathways**: The ubiquitin-proteasome pathway is upregulated

![Proteolysis pathway diagram from PMC789012](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC789012/bin/figure3.jpg)

3. **Mitochondrial dysfunction**: Reduced oxidative capacity observed

These findings are from multiple studies including PMC123456 and PMC789012.
```

**Rendered Output:**

-   Text appears normally
-   Images are rendered as clickable cards
-   PMCID badges show paper source
-   Hover effects enhance interactivity

### Example 2: Multiple Images

```markdown
The experimental setup involved three stages:

![Stage 1 apparatus from PMC111111](https://example.com/img1.jpg)

Followed by analysis:

![Results graph from PMC111111](https://example.com/img2.jpg)

Final comparison:

![Comparison chart from PMC222222](https://example.com/img3.jpg)
```

All three images will be rendered as separate, clickable cards.

## Image Card Features

### Visual Design

-   ✅ **Monochrome Theme**: Gray borders, clean styling
-   ✅ **Dark Mode Support**: Adapts to theme
-   ✅ **Hover Effects**: Shadow and opacity changes
-   ✅ **Responsive**: Max height limits, object-fit contain
-   ✅ **Click to Enlarge**: Opens full image in new tab

### Error Handling

-   ✅ **Graceful Fallback**: Hides broken images
-   ✅ **State Management**: Tracks failed loads
-   ✅ **No Duplication**: Same URL won't retry

### Metadata Display

-   ✅ **Title/Caption**: From alt text
-   ✅ **PMCID Badge**: Extracted automatically
-   ✅ **Source Attribution**: Clear paper reference

## Markdown Image Syntax Support

The renderer supports standard markdown image syntax:

### Basic Format

```markdown
![alt text](image-url)
```

### With Title

```markdown
![alt text](image-url "Optional title")
```

### Best Practice for AI

```markdown
![Figure 1 from PMC123456](https://full-url-to-image.jpg)
```

## Files Modified

### Backend

-   ✅ `main.py` - Updated LLM prompt template

### Frontend

-   ✅ `src/components/markdown-renderer.tsx` - Added image parsing and rendering
    -   Import Card and Badge components
    -   Image regex detection
    -   Error state management
    -   Card-based rendering
    -   Link support (bonus!)

## Advanced Features

### 1. **Smart PMCID Extraction**

```tsx
const pmcidMatch = alt.match(/PMC\d+/i);
const pmcid = pmcidMatch ? pmcidMatch[0] : "";
```

### 2. **Click to Open**

```tsx
onClick={() => window.open(url, "_blank")}
```

### 3. **Error Recovery**

```tsx
const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

onError={() => handleImageError(url)}

if (!imageErrors.has(url)) {
  // Render image
}
```

### 4. **Enhanced Text Rendering**

Also improved:

-   **Links**: `[text](url)` now clickable
-   **Bold**: Better contrast in dark mode
-   **Code**: Monochrome background
-   **Lists**: Cleaner styling

## Testing

### Test Query 1: Request Images

```
"Show me figures demonstrating the effects of radiation on plant growth"
```

### Test Query 2: Specific PMCID

```
"What are the key graphs in PMC8675309 about bone density?"
```

### Test Query 3: Multiple Papers

```
"Compare the experimental setups across papers about DNA damage in space"
```

## Troubleshooting

### Images Not Showing?

1. **Check Backend Response**

    - Ensure image URLs are in context
    - Verify LLM includes markdown syntax
    - Check console for response format

2. **Check Frontend**

    - Open browser DevTools
    - Look for image load errors
    - Verify regex is matching

3. **Check Image URLs**
    - Must be publicly accessible
    - CORS headers must allow embedding
    - HTTPS recommended

### Styling Issues?

-   Check `className` props match monochrome theme
-   Verify dark mode classes are applied
-   Test both light and dark modes

## Future Enhancements

### Potential Additions

1. **Image Gallery View**: Group images from same paper
2. **Zoom Modal**: Lightbox-style viewer
3. **Download Button**: Save images locally
4. **Caption Overlay**: Show title on hover
5. **Lazy Loading**: Improve performance
6. **Image Thumbnails**: Preview in source documents

### AI Improvements

1. **Better Figure Selection**: AI chooses most relevant
2. **Figure Descriptions**: AI explains what's shown
3. **Multi-modal Analysis**: AI analyzes image content
4. **Figure Comparison**: Side-by-side layouts

## Example Complete Flow

1. **User searches**: "muscle atrophy microgravity"
2. **Backend finds papers** with images
3. **Context includes** image URLs
4. **LLM generates** markdown with `![...](...)`
5. **Frontend parses** markdown
6. **Images render** as beautiful cards
7. **User clicks** to view full size

---

**Status**: ✅ Implemented and Working  
**Backend**: Simplified prompt with markdown instructions  
**Frontend**: Enhanced markdown renderer with image cards  
**Theme**: Monochrome with dark mode support  
**Testing**: Ready to use in search queries
