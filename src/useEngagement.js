// src/useEngagement.js
// Custom hook — wraps all API calls for saving/loading engagements

import { useState, useRef, useEffect } from "react";

const API = "/api/engagements";

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function useEngagement() {
  const [engagementId, setEngagementId]     = useState(null);
  const [engagementName, setEngagementName] = useState("My AMS Engagement");
  const [isSaving, setIsSaving]             = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [saveStatus, setSaveStatus]         = useState(null); // "saved" | "error" | null
  const [savedList, setSavedList]           = useState([]);
  const [showList, setShowList]             = useState(false);

  // Refs so async callbacks always read the latest values without stale closures
  const idRef   = useRef(engagementId);
  const nameRef = useRef(engagementName);
  useEffect(() => { idRef.current   = engagementId;   }, [engagementId]);
  useEffect(() => { nameRef.current = engagementName; }, [engagementName]);

  // ── Save ──────────────────────────────────────────────────────────────────
  async function save(appState) {
    setIsSaving(true);
    setSaveStatus(null);

    const id = idRef.current || newId();
    if (!idRef.current) {
      setEngagementId(id);
      idRef.current = id;
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name:       nameRef.current,
          clientName: appState.clientName  || "",
          clientCity: appState.clientCity  || "",
          payload:    appState,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Save failed");
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Save error:", err.message);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }

  // ── Load list ─────────────────────────────────────────────────────────────
  async function loadList() {
    setIsLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Load failed");
      const data = await res.json();
      setSavedList(data.engagements || []);
      setShowList(true);
    } catch (err) {
      console.error("Load error:", err.message);
      setSavedList([]);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Load one ──────────────────────────────────────────────────────────────
  async function loadOne(id) {
    setIsLoading(true);
    try {
      const res = await fetch(API + "?id=" + id);
      if (!res.ok) throw new Error("Not found");
      const row = await res.json();
      setEngagementId(row.id);
      setEngagementName(row.name);
      idRef.current   = row.id;
      nameRef.current = row.name;
      setShowList(false);
      return row.payload;
    } catch (err) {
      console.error("LoadOne error:", err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // ── Delete one ────────────────────────────────────────────────────────────
  async function deleteOne(id) {
    try {
      await fetch(API + "?id=" + id, { method: "DELETE" });
      setSavedList(p => p.filter(e => e.id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  }

  // ── New engagement ────────────────────────────────────────────────────────
  function newEngagement() {
    setEngagementId(null);
    setEngagementName("My AMS Engagement");
    idRef.current   = null;
    nameRef.current = "My AMS Engagement";
    setShowList(false);
  }

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
