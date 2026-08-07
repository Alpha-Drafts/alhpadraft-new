# Auto-Save Implementation

This document explains the auto-save functionality implemented in the Editor component.

## Overview

The auto-save system provides:

- **Cache every 5 minutes**: Content is automatically cached using React Query
- **Backend save every 30 minutes**: Content is saved to the backend database
- **Unsaved changes modal**: Warns users when they try to close the browser with unsaved changes

## Files Created/Modified

### New Files

1. `hooks/misc/useAutoSave.ts` - Custom hook for auto-save functionality
2. `components/dashboard/project-draft/UnsavedChangesModal.tsx` - Modal for unsaved changes warning

### Modified Files

1. `components/dashboard/project-draft/Editor.tsx` - Integrated auto-save functionality
2. `hooks/misc/index.ts` - Export the new auto-save hook

## How It Works

### Auto-Save Hook (`useAutoSave`)

- Monitors content changes in the editor
- Caches content to React Query every 5 minutes if there are changes
- Saves to backend every 30 minutes (checks every minute for precision)
- Tracks unsaved changes state
- Handles browser close/refresh events

### Cache Strategy

- Uses React Query to cache content with a unique key: `autosave_${projectId}_${postId || 'new'}`
- Stores content, timestamp, and last backend save time
- Preserves cache across browser sessions

### Backend Save Strategy

- Checks if 30 minutes have passed since last backend save
- Only saves to backend if there are actual content changes
- Updates the cache with new backend save timestamp after successful save

### Browser Events

- Listens to `beforeunload` event to detect browser close/refresh
- Shows native browser warning if there are unsaved changes
- Caches content when tab becomes hidden (`visibilitychange` event)

### UI Indicators

- Shows "Auto-saved to cache" indicator when there are unsaved changes
- Displays standard "Last saved" timestamp for backend saves
- Loading states during save operations

## Usage

The auto-save is automatically enabled in the Editor component when:

- User is authenticated (`token` exists)
- Project ID is available
- Editor content is present

## API Integration

The auto-save uses the existing `saveDraft` function from the Editor component, ensuring consistency with manual save operations.

## Benefits

1. **Reduced Backend Load**: Only saves to backend every 30 minutes instead of every 5 minutes
2. **Data Safety**: Content is cached frequently to prevent data loss
3. **User Experience**: Clear indicators of save status and warnings for unsaved changes
4. **Performance**: Uses React Query's efficient caching mechanism

## Error Handling

- Gracefully handles save failures
- Continues auto-save cycle even if individual saves fail
- Logs errors to console for debugging
- Shows error modals for critical save failures
