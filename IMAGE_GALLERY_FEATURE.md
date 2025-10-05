# Image Gallery Tab - Feature Addition

## Overview

Added a new **Images** tab to the search results page that displays all retrieved images from papers in a beautiful grid gallery.

## Features Added

### 📸 Image Gallery Tab

-   **Location**: Search page (`/search`)
-   **Toggle between**: Results view and Images view
-   **Badge indicator**: Shows total count of images in tab label
-   **Grid layout**: Responsive 2-4 column grid based on screen size

### 🎨 Gallery Features

#### Image Display

-   **Aspect ratio cards**: Square images for consistent layout
-   **Hover effect**: Dark overlay with external link icon
-   **Click to open**: Opens full-size image in new tab
-   **Organized by query**: Images grouped by search query

#### Image Metadata

-   **Paper title**: Displays source paper (truncated if long)
-   **PMCID**: Shows paper identifier
-   **Visual grouping**: Separator between different queries

### 📱 Responsive Design

-   **Mobile (sm)**: 2 columns
-   **Tablet (sm-lg)**: 3 columns
-   **Desktop (lg+)**: 4 columns

## UI Components Used

### New Import

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

### Tab Structure

```tsx
<Tabs defaultValue="results">
    <TabsList>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="images">
            Images
            <Badge>{imageCount}</Badge>
        </TabsTrigger>
    </TabsList>

    <TabsContent value="results">{/* Existing search results */}</TabsContent>

    <TabsContent value="images">{/* New image gallery */}</TabsContent>
</Tabs>
```

## Image Gallery Implementation

### Empty State

When no images are available:

```tsx
<ImageIcon />
<p>No images yet. Search for papers to see their figures.</p>
```

### Gallery Grid

For each search result with images:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {allImages.map(img => (
        <Card>
            <img src={img.url} onClick={openInNewTab} />
            <div>
                {img.title} - {img.pmcid}
            </div>
        </Card>
    ))}
</div>
```

### Image Card Features

-   **Aspect square container**: Consistent sizing
-   **Object-cover**: Fills card while maintaining aspect ratio
-   **Hover overlay**: Semi-transparent black with icon
-   **Paper info footer**: Title and PMCID on muted background

## User Experience

### Workflow

1. **Search for papers** → Images automatically extracted
2. **View Results tab** → See paper summaries with inline thumbnail previews
3. **Switch to Images tab** → See all images in dedicated gallery
4. **Click any image** → Opens full resolution in new tab

### Visual Indicators

-   **Tab badge**: Shows total image count (e.g., "Images (24)")
-   **Query separators**: Dividers between different search queries
-   **Hover states**: Cards lift and show overlay on hover
-   **Loading states**: Handled by existing search loading UI

## Code Changes Summary

### File Modified

-   `src/app/search/page.tsx`

### Changes Made

1. ✅ Added Tabs import
2. ✅ Wrapped results in TabsContent
3. ✅ Added new Images TabsContent
4. ✅ Created image gallery grid
5. ✅ Added image metadata display
6. ✅ Implemented click-to-open functionality
7. ✅ Added responsive breakpoints

### Lines of Code

-   **Added**: ~70 lines
-   **Modified**: ~10 lines (wrapping existing content)

## Benefits

### For Users

-   🖼️ **Visual overview**: See all paper figures at a glance
-   🔍 **Better discovery**: Find relevant diagrams/charts quickly
-   📊 **Context retention**: Paper title and ID with each image
-   ⚡ **Quick access**: One click to full-size view

### For Research

-   📈 **Compare figures**: See multiple results side-by-side
-   🔬 **Visual analysis**: Identify patterns across papers
-   📑 **Documentation**: Easy screenshot of relevant figures

## Technical Details

### Image Source

Images come from `searchResult.source_documents[].metadata.image_urls[]`

### Image Processing

```typescript
const allImages: Array<{ url: string; title: string; pmcid: string }> = [];

message.searchResult.source_documents.forEach(doc => {
    if (doc.metadata.image_urls && doc.metadata.image_urls.length > 0) {
        doc.metadata.image_urls.forEach(url => {
            allImages.push({
                url,
                title: doc.metadata.title,
                pmcid: doc.metadata.pmcid,
            });
        });
    }
});
```

### Styling Classes

-   Card: `hover:shadow-lg transition-shadow`
-   Image: `w-full h-full object-cover`
-   Overlay: `bg-black/60 opacity-0 group-hover:opacity-100`
-   Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`

## Future Enhancements

### Possible Additions

-   🔍 **Lightbox viewer**: Full-screen image viewer with navigation
-   🏷️ **Filter by paper**: Show images from specific paper only
-   💾 **Download all**: Bulk download images
-   📋 **Copy URL**: Copy image URL to clipboard
-   🔗 **Jump to paper**: Click metadata to scroll to paper in results
-   🌓 **Image optimization**: Lazy loading, placeholders

## Testing Checklist

-   [x] Tab switching works smoothly
-   [x] Images display correctly
-   [x] Badge shows correct count
-   [x] Click opens new tab with image
-   [x] Responsive grid works on all screens
-   [x] Empty state displays properly
-   [x] Hover effects working
-   [x] Multiple queries separated correctly
