# Image Gallery & Chat Layout Fixes

## Issues Fixed

### 1. ✅ Chat Box Layout Fixed

**Problem**: Search input was positioned incorrectly inside the Tabs component
**Solution**: Moved search input outside Tabs, directly inside CardContent at the bottom

### 2. 🔍 Images Tab Debugging Added

**Problem**: Images not showing up in the Images tab
**Solution**: Added comprehensive debugging and better error handling

## Changes Made

### Layout Structure (Fixed)

```tsx
<Card>
    <CardContent>
        <Tabs>
            <TabsList>...</TabsList>
            <TabsContent value="results">...</TabsContent>
            <TabsContent value="images">...</TabsContent>
        </Tabs>

        {/* Search Input - Now correctly positioned */}
        <div className="border-t pt-4">
            <Input />
            <Button />
        </div>
    </CardContent>
</Card>
```

### Image Debugging Features Added

#### 1. Console Logging

```typescript
console.log("Search Result:", message.searchResult);
console.log("Source Documents:", message.searchResult.source_documents);
console.log("Document metadata:", doc.metadata);
console.log("Image URLs:", doc.metadata.image_urls);
console.log("All Images:", allImages);
```

#### 2. Array Type Check

```typescript
if (doc.metadata.image_urls && Array.isArray(doc.metadata.image_urls) && doc.metadata.image_urls.length > 0) {
    // Process images
}
```

#### 3. Empty State Message

```typescript
if (allImages.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-4">
            <p>No images found in this query</p>
        </div>
    );
}
```

#### 4. Image Load Error Handling

```typescript
<img
    src={img.url}
    onError={e => {
        console.error("Image failed to load:", img.url);
        e.currentTarget.src = "data:image/svg+xml,..."; // Fallback placeholder
    }}
/>
```

#### 5. Image Count in Separator

```typescript
<span>
    Query {msgIndex + 1} - {allImages.length} images
</span>
```

## How to Debug Image Issues

### Step 1: Check Browser Console

After searching, open Developer Tools (F12) and check the Console tab for:

```
Search Result: { answer: "...", source_documents: [...], ... }
Source Documents: [{...}, {...}, ...]
Document metadata: { title: "...", pmcid: "...", image_urls: [...] }
Image URLs: ["url1", "url2", ...]
All Images: [{url: "...", title: "...", pmcid: "..."}, ...]
```

### Step 2: Verify API Response Structure

**Expected Structure**:

```json
{
  "answer": "...",
  "source_documents": [
    {
      "page_content": "...",
      "metadata": {
        "title": "Paper Title",
        "pmcid": "PMC123456",
        "source": "https://...",
        "image_urls": ["url1", "url2", "url3"]  // ← Must be array
      }
    }
  ],
  "images_found": [...],
  "papers_newly_scraped": 0,
  "papers_already_loaded": 5
}
```

### Step 3: Check Network Tab

1. Open Network tab in DevTools
2. Search for a query
3. Find the `/search` request
4. Check the Response
5. Verify `source_documents[].metadata.image_urls` exists and is an array

### Step 4: Common Issues & Solutions

#### Issue: `image_urls` is undefined

**Cause**: Backend not returning image URLs
**Solution**: Check backend `main.py` - ensure JSON parsing is working:

```python
image_urls_json = doc.metadata.get("image_urls_json", "")
try:
    image_urls = json.loads(image_urls_json) if image_urls_json else []
except:
    image_urls = []
```

#### Issue: `image_urls` is a string

**Cause**: Backend returning JSON string instead of parsed array
**Solution**: Frontend needs to parse JSON:

```typescript
let imageUrls = doc.metadata.image_urls;
if (typeof imageUrls === "string") {
    try {
        imageUrls = JSON.parse(imageUrls);
    } catch (e) {
        imageUrls = [];
    }
}
```

#### Issue: `image_urls` is empty array

**Cause**: Papers don't have images or images not scraped
**Solution**:

-   Check if papers actually have figures
-   Verify backend scraping is working
-   Check `images_found` field in response

#### Issue: Images fail to load (broken image icon)

**Cause**: Invalid URLs or CORS issues
**Solution**:

-   Check console for "Image failed to load" messages
-   Verify URLs are accessible
-   Check if URLs need authentication

## Testing Checklist

-   [ ] Search for a query with images
-   [ ] Check Console for logs
-   [ ] Verify "Images" tab shows count badge
-   [ ] Click Images tab - should see grid
-   [ ] If no images, message should say "No images found"
-   [ ] Click image - should open in new tab
-   [ ] Hover image - should show overlay
-   [ ] Search input should be at bottom, always visible
-   [ ] Results tab scrolls properly
-   [ ] Images tab scrolls properly

## Quick Fix for String Image URLs

If backend is returning `image_urls` as a JSON string, add this parsing:

```typescript
message.searchResult.source_documents.forEach(doc => {
    let imageUrls = doc.metadata.image_urls;

    // Parse if string
    if (typeof imageUrls === "string" && imageUrls) {
        try {
            imageUrls = JSON.parse(imageUrls);
        } catch (e) {
            console.error("Failed to parse image_urls:", e);
            imageUrls = [];
        }
    }

    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        imageUrls.forEach(url => {
            allImages.push({
                url,
                title: doc.metadata.title,
                pmcid: doc.metadata.pmcid,
            });
        });
    }
});
```

## Expected Console Output (Success Case)

```
Search Result: Object { answer: "...", source_documents: Array(5), ... }
Source Documents: Array(5) [ {…}, {…}, {…}, {…}, {…} ]
Document metadata: Object { title: "Validation of...", pmcid: "PMC7012842", source: "...", image_urls: Array(8) }
Image URLs: Array(8) [ "https://...", "https://...", ... ]
Document metadata: Object { title: "Mice in Bion...", ... }
Image URLs: Array(6) [ ... ]
...
All Images: Array(42) [ {…}, {…}, {…}, ... ]
```

## Files Modified

-   `/home/om_patil/Desktop/Codes/projects/NASA/NASA-frontend/src/app/search/page.tsx`
    -   Added debug logging
    -   Fixed chat layout (moved search input outside Tabs)
    -   Added image error handling
    -   Added empty state for no images
    -   Added image count display
