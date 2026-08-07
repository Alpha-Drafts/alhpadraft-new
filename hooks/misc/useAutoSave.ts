// This file provides a custom React hook for auto-saving editor content
// It caches changes every 5 minutes and saves to backend every 30 minutes
// Note: Does not handle unsaved changes modal - that should be implemented in the component

import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseAutoSaveProps {
  content: string;
  projectId: string;
  postId?: string;
  onSave: () => Promise<string | null>;
  enabled?: boolean;
}

interface CachedContent {
  content: string;
  timestamp: number;
  lastBackendSave: number;
}

export const useAutoSave = ({
  content,
  projectId,
  postId,
  onSave,
  enabled = true,
}: UseAutoSaveProps) => {
  const queryClient = useQueryClient();
  const cacheIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backendIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const CACHE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const BACKEND_INTERVAL = 30 * 60 * 1000; // 30 minutes
  const CACHE_KEY = `autosave_${projectId}_${postId || "new"}`;

  // Store latest content and onSave in refs to avoid resetting intervals
  const contentRef = useRef(content);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Check if content has changed
  const hasContentChanged = useCallback(() => {
    return content !== lastContentRef.current && content.trim() !== "";
  }, [content]);

  // Cache content to React Query
  const cacheContent = useCallback(() => {
    if (!hasContentChanged()) return;

    const cachedData: CachedContent = {
      content,
      timestamp: Date.now(),
      lastBackendSave: Date.now(),
    };

    // Get existing cache to preserve lastBackendSave if it exists
    const existingCache = queryClient.getQueryData<CachedContent>([CACHE_KEY]);
    if (existingCache) {
      cachedData.lastBackendSave = existingCache.lastBackendSave;
    }

    queryClient.setQueryData([CACHE_KEY], cachedData);
    lastContentRef.current = content;
    setHasUnsavedChanges(true);
  }, [content, queryClient, CACHE_KEY, hasContentChanged]);

  // Auto-save logic
  useEffect(() => {
    if (!enabled) return;

    // Cache content every 5 minutes
    cacheIntervalRef.current = setInterval(() => {
      if (
        contentRef.current !== lastContentRef.current &&
        contentRef.current.trim() !== ""
      ) {
        const cachedData: CachedContent = {
          content: contentRef.current,
          timestamp: Date.now(),
          lastBackendSave: Date.now(),
        };

        const existingCache = queryClient.getQueryData<CachedContent>([
          CACHE_KEY,
        ]);
        if (existingCache) {
          cachedData.lastBackendSave = existingCache.lastBackendSave;
        }

        queryClient.setQueryData([CACHE_KEY], cachedData);
        lastContentRef.current = contentRef.current;
        setHasUnsavedChanges(true);
      }
    }, CACHE_INTERVAL);

    // Check for backend save every minute
    backendIntervalRef.current = setInterval(() => {
      const cachedData = queryClient.getQueryData<CachedContent>([CACHE_KEY]);
      if (cachedData) {
        const timeSinceLastBackendSave =
          Date.now() - cachedData.lastBackendSave;
        if (
          timeSinceLastBackendSave >= BACKEND_INTERVAL &&
          contentRef.current !== lastContentRef.current
        ) {
          onSaveRef
            .current()
            .then(savedPostId => {
              if (savedPostId) {
                const updatedCache: CachedContent = {
                  content: contentRef.current,
                  timestamp: Date.now(),
                  lastBackendSave: Date.now(),
                };
                queryClient.setQueryData([CACHE_KEY], updatedCache);
                lastContentRef.current = contentRef.current;
                setHasUnsavedChanges(false);
              }
            })
            .catch(error => {
              console.error("Auto-save to backend failed:", error);
            });
        }
      }
    }, 60 * 1000);

    return () => {
      if (cacheIntervalRef.current) {
        clearInterval(cacheIntervalRef.current);
      }
      if (backendIntervalRef.current) {
        clearInterval(backendIntervalRef.current);
      }
    };
  }, [enabled, CACHE_INTERVAL, BACKEND_INTERVAL, CACHE_KEY, queryClient]);

  // Store latest cacheContent in a ref to avoid stale closures
  const cacheContentRef = useRef(cacheContent);

  useEffect(() => {
    cacheContentRef.current = cacheContent;
  }, [cacheContent]);

  // Handle document visibility change to cache content when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && hasUnsavedChanges) {
        // Use the latest cacheContent function from the ref
        cacheContentRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasUnsavedChanges]);

  // Update hasUnsavedChanges when content changes
  useEffect(() => {
    setHasUnsavedChanges(hasContentChanged());
  }, [content, hasContentChanged]);

  // Get cached content
  const getCachedContent = useCallback(() => {
    return queryClient.getQueryData<CachedContent>([CACHE_KEY]);
  }, [queryClient, CACHE_KEY]);

  return {
    hasUnsavedChanges,
    getCachedContent,
    cacheContent: () => {
      if (hasContentChanged()) {
        cacheContent();
      }
    },
  };
};
