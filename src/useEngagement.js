// src/useEngagement.js
// Custom hook — wraps all API calls for saving/loading engagements
// The app state is serialised to JSON and stored in Vercel Postgres via /api/engagements

import { useState } from "react";

const API = "/api/engagements";

// Generate a compact unique ID
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function useEngagement() {
  const [engagementId, setEngagementId] = useState(null);
  const [engagementName, setEngagementName] = useState("My AMS Engagement");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error" | null
  const [savedList, setSavedList] = useState([]);
  const [showList, setShowList] = useState(false);

  // Save current state to DB
  const save = useCallback(async (appState) => {
    setIsSaving(true);
    setSaveStatus(null);
    const id = engagementId || newId();
    if (!engagementId) setEngagementId(id);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: engagementName,
          clientName: appState.clientName || "",
          clientCity: appState.clientCity || "",
          payload: appState,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("saved");
      // Auto-clear status after 3s
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }, [engagementId, engagementName]);

  // Load list of saved engagements
  const loadList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Load failed");
      const data = await res.json();
      setSavedList(data.engagements || []);
      setShowList(true);
    } catch (err) {
      console.error(err);
      setSavedList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load one engagement by ID — returns the payload
  const loadOne = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}?id=${id}`);
      if (!res.ok) throw new Error("Not found");
      const row = await res.json();
      setEngagementId(row.id);
      setEngagementName(row.name);
      setShowList(false);
      return row.payload; // caller merges into app state
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete one engagement
  const deleteOne = useCallback(async (id) => {
    try {
      await fetch(`${API}?id=${id}`, { method: "DELETE" });
      setSavedList((p) => p.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Start a new blank engagement
  const newEngagement = useCallback(() => {
    setEngagementId(null);
    setEngagementName("My AMS Engagement");
    setShowList(false);
  }, []);

  return {
    engagementId,
    engagementName,
    setEngagementName,
    isSaving,
    isLoading,
    saveStatus,
    savedList,
    showList,
    setShowList,
    save,
    loadList,
    loadOne,
    deleteOne,
    newEngagement,
  };
}
