import React, { useState, useEffect } from "react";
import { 
  Lock, LayoutDashboard, FileText, Settings, Terminal, Shield, RefreshCw, 
  Trash2, Edit, Plus, Save, Sparkles, AlertCircle, CheckCircle, Database, 
  Download, Upload, Eye, ThumbsUp, Calendar, AlertTriangle, HelpCircle, 
  Globe2, Type, ArrowLeft, ArrowUpRight, X
} from "lucide-react";
import { Article, AppSettings, LogEntry, Language } from "../types";

interface AdminProps {
  onBack: () => void;
  allArticles: Article[];
  onRefreshArticles: () => void;
}

export function AdminPanel({ onBack, allArticles, onRefreshArticles }: AdminProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"dashboard" | "articles" | "ai" | "settings" | "logs">("dashboard");
  const [articles, setArticles] = useState<Article[]>(allArticles);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Forms and loaders
  const [fetchingStats, setFetchingStats] = useState(false);
  const [triggeringFetch, setTriggeringFetch] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dbBackupFile, setDbBackupFile] = useState<File | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Manual Article Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [newArticle, setNewArticle] = useState({
    title: "",
    description: "",
    content: "",
    category: "Geopolitics",
    author: "সম্পাদক",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
    tagsString: "Global, Geopolitics",
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    isFactCheck: false,
    factCheckRating: "true" as any,
    factCheckExplanation: "",
    autoTranslate: true
  });

  // Standalone AI Toolboxes
  const [aiHeadlineKeyword, setAiHeadlineKeyword] = useState("");
  const [aiHeadlineResult, setAiHeadlineResult] = useState("");
  const [aiHeadlineLoading, setAiHeadlineLoading] = useState(false);

  const [aiSummaryText, setAiSummaryText] = useState("");
  const [aiSummaryResult, setAiSummaryResult] = useState("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const [aiTranslateText, setAiTranslateText] = useState("");
  const [aiTranslateResult, setAiTranslateResult] = useState<any>(null);
  const [aiTranslateLoading, setAiTranslateLoading] = useState(false);

  // Fetch admin states when authenticated
  useEffect(() => {
    if (!token) return;

    setFetchingStats(true);

    const headers = { "Authorization": `Bearer ${token}` };

    // Fetch stats
    fetch("/api/admin/stats", { headers })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data);
      })
      .catch(console.error);

    // Fetch admin full articles list
    fetch("/api/admin/articles", { headers })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setArticles(data);
      })
      .catch(console.error);

    // Fetch settings
    fetch("/api/admin/settings", { headers })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSettings(data);
      })
      .catch(console.error);

    // Fetch logs
    fetch("/api/admin/logs", { headers })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setLogs(data);
        setFetchingStats(false);
      })
      .catch(() => setFetchingStats(false));
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!username.trim() || !password.trim()) {
      setLoginError("Please supply all login credentials.");
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("adminToken", data.token);
        setToken(data.token);
        onRefreshArticles();
      } else {
        setLoginError(data.error || "Authentication failed.");
      }
    } catch (err: any) {
      setLoginError("Server unavailable.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    onBack();
  };

  // Article Manual Insertion
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!newArticle.title || !newArticle.content) {
      setFormError("Headline and main content body text are strictly required.");
      return;
    }

    setSaveLoading(true);
    const headers = { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    };

    const tagsArray = newArticle.tagsString.split(",").map(t => t.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...newArticle,
          tags: tagsArray
        })
      });
      const data = await res.json();
      if (!data.error) {
        setArticles(prev => [data, ...prev]);
        setShowAddForm(false);
        setNewArticle({
          title: "",
          description: "",
          content: "",
          category: "Geopolitics",
          author: "সম্পাদক",
          image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
          tagsString: "Global, Geopolitics",
          isFeatured: false,
          isTrending: false,
          isBreaking: false,
          isFactCheck: false,
          factCheckRating: "true",
          factCheckExplanation: "",
          autoTranslate: true
        });
        onRefreshArticles();
      } else {
        setFormError(data.error);
      }
    } catch (err: any) {
      setFormError("Server error.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete article
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this news story?")) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
        onRefreshArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Featured status
  const handleToggleFeature = async (art: Article, field: "isFeatured" | "isTrending" | "isBreaking") => {
    try {
      const updatedVal = !art[field];
      const res = await fetch(`/api/admin/articles/${art.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: updatedVal })
      });
      if (res.ok) {
        setArticles(prev => prev.map(a => a.id === art.id ? { ...a, [field]: updatedVal } : a));
        onRefreshArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger immediate GNews force aggregation API pull
  const handleForceFetch = async () => {
    setTriggeringFetch(true);
    try {
      const res = await fetch("/api/admin/settings/force-fetch", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Integration completed! Discovered and processed ${data.newlyAdded} new articles.`);
        onRefreshArticles();
        // Refresh full states
        window.location.reload();
      }
    } catch (err) {
      alert("Aggregation pull failed.");
    } finally {
      setTriggeringFetch(false);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaveLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("System settings saved successfully.");
      }
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordError("Please supply all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError("New password must be at least 6 characters.");
      return;
    }

    setChangePasswordLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setChangePasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setChangePasswordError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setChangePasswordError("Failed to update password.");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm("Permanently clear system trace logs?")) return;
    try {
      const res = await fetch("/api/admin/logs/clear", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setLogs([{ id: "clear", timestamp: new Date().toISOString(), level: "info", message: "Logs cleared by admin." }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Standalone AI - Headline generator
  const runAiHeadline = async () => {
    if (!aiHeadlineKeyword.trim()) return;
    setAiHeadlineLoading(true);
    try {
      const res = await fetch("/api/admin/ai/headline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ keyword: aiHeadlineKeyword, lang: "bn" })
      });
      const data = await res.json();
      if (data.headlines) {
        setAiHeadlineResult(data.headlines);
      }
    } catch (err) {
      setAiHeadlineResult("Failed to query Gemini API.");
    } finally {
      setAiHeadlineLoading(false);
    }
  };

  // Standalone AI - Summarizer
  const runAiSummary = async () => {
    if (!aiSummaryText.trim()) return;
    setAiSummaryLoading(true);
    try {
      const res = await fetch("/api/admin/ai/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: aiSummaryText, lang: "bn" })
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummaryResult(data.summary);
      }
    } catch (err) {
      setAiSummaryResult("Failed to query Gemini API.");
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Standalone AI - Translator
  const runAiTranslate = async () => {
    if (!aiTranslateText.trim()) return;
    setAiTranslateLoading(true);
    try {
      const res = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: aiTranslateText, sourceLang: "en" })
      });
      const data = await res.json();
      if (!data.error) {
        setAiTranslateResult(data);
      }
    } catch (err) {
      setAiTranslateResult({ error: "Failed to query Gemini API." });
    } finally {
      setAiTranslateLoading(false);
    }
  };

  // Database Backup download
  const downloadBackup = () => {
    window.open(`/api/admin/database/backup?authorization=Bearer ${token}`, "_blank");
  };

  // Database Backup Restore upload
  const uploadBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbBackupFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const textStr = event.target?.result as string;
        const parsed = JSON.parse(textStr);

        const res = await fetch("/api/admin/database/restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(parsed)
        });

        if (res.ok) {
          alert("Database successfully restored! Reloading...");
          window.location.reload();
        } else {
          const err = await res.json();
          alert("Restore failed: " + err.error);
        }
      } catch (err) {
        alert("Invalid JSON file uploaded.");
      }
    };
    reader.readAsText(dbBackupFile);
  };


  // ----------------------------------------------------
  // RENDER CARD LOGIN
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12 font-sans" id="admin-login">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black font-serif text-gray-950">
              The Bengali Pedia Admin
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Authenticate to access analytics, settings, AI helpers, and databases
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-red-650 text-white font-bold py-2.5 rounded-lg shadow-md transition cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="text-center">
            <button onClick={onBack} className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center justify-center space-x-1.5 mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans grid grid-cols-1 lg:grid-cols-4 gap-6" id="admin-dashboard">
      
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-1 space-y-4">
        <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-md space-y-3">
          <div className="flex items-center space-x-2 text-red-500">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-widest uppercase">Admin Terminal</h3>
          </div>
          <div className="text-xs space-y-1 opacity-75">
            <p>User: <span className="font-bold font-mono">administrator</span></p>
            <p>Role: <span className="font-bold font-mono">Super Admin</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-750 text-white text-xs font-bold py-2 rounded-lg transition shadow cursor-pointer mt-2"
          >
            Sign Out
          </button>
        </div>

        {/* Tab Buttons Navigation */}
        <nav className="bg-white border border-gray-200 rounded-2xl p-2.5 shadow-sm flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
              activeTab === "dashboard" ? "bg-red-50 text-red-700 border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
              activeTab === "articles" ? "bg-red-50 text-red-700 border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manage News</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
              activeTab === "ai" ? "bg-red-50 text-red-700 border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Gemini AI Toolkit</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
              activeTab === "settings" ? "bg-red-50 text-red-700 border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center space-x-2.5 w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
              activeTab === "logs" ? "bg-red-50 text-red-700 border-l-4 border-red-600" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>System Logs</span>
          </button>
        </nav>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl border border-gray-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Dashboard</span>
        </button>
      </aside>


      {/* Main Panel Content Area */}
      <main className="lg:col-span-3 space-y-6">

        {/* ----------------------------------------------------
            OVERVIEW STATS TAB
            ---------------------------------------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider">
                System Analytics
              </h2>
              <button 
                onClick={handleForceFetch}
                disabled={triggeringFetch}
                className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${triggeringFetch ? "animate-spin" : ""}`} />
                <span>{triggeringFetch ? "Aggregating AI..." : "Fetch & Process News"}</span>
              </button>
            </div>

            {/* Stats Cards */}
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Total Articles</span>
                  <span className="text-2xl font-black font-mono text-gray-900 mt-2">{stats.totalArticles}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Aggregate Views</span>
                  <span className="text-2xl font-black font-mono text-gray-900 mt-2">{stats.totalViews}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Total Likes</span>
                  <span className="text-2xl font-black font-mono text-gray-900 mt-2">{stats.totalLikes}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Added Today</span>
                  <span className="text-2xl font-black font-mono text-emerald-600 mt-2">+{stats.fetchedToday}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">Loading metrics...</div>
            )}

            {/* Interactive Custom SVG Graphs */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SVG Polyline View History Graph */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Page View History (Last 7 Days)
                  </h4>
                  <div className="h-44 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#f3f4f6" strokeWidth="0.5" />
                      
                      {/* View path */}
                      <polyline
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="2"
                        points={stats.viewsHistory.map((h: any, i: number) => {
                          const x = (i / (stats.viewsHistory.length - 1)) * 100;
                          // Max out graph visually safely
                          const y = 90 - (Math.min(h.views / 500, 1) * 70);
                          return `${x},${y}`;
                        }).join(" ")}
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 font-mono">
                    {stats.viewsHistory.map((h: any, i: number) => (
                      <span key={i}>{h.date}</span>
                    ))}
                  </div>
                </div>

                {/* SVG Category Bar Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Category Distribution
                  </h4>
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {Object.entries(stats.categoryBreakdown).map(([cat, count]: any) => (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-gray-700">{cat}</span>
                          <span className="font-bold text-gray-900 font-mono">{count} stories</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((count / stats.totalArticles) * 100 || 5, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ----------------------------------------------------
            MANAGE ARTICLES TAB
            ---------------------------------------------------- */}
        {activeTab === "articles" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider">
                Article Repository
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write Manual Article</span>
              </button>
            </div>

            {/* Manual Article Insertion Wizard Form */}
            {showAddForm && (
              <form onSubmit={handleCreateArticle} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-md space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-red-500" />
                    <span>Story Creation Wizard</span>
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {formError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold border border-red-100">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Headline / Title (English or Bengali)</label>
                    <input
                      type="text"
                      required
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                      placeholder="e.g., Strategic Shifts in West Bengal Politics..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                    <select
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                    >
                      {["Geopolitics", "Indian Politics", "West Bengal Politics", "Current Affairs", "Technology", "Economy", "Defence", "Science", "AI", "Fact Check", "Editorial"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brief Description / Sub-headline</label>
                  <input
                    type="text"
                    value={newArticle.description}
                    onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                    placeholder="Short summary description sentence..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Main Editorial News Content Body Text</label>
                  <textarea
                    rows={6}
                    required
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    placeholder="Type or paste the complete news content here..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Featured Image URL (Unsplash/Web)</label>
                    <input
                      type="text"
                      value={newArticle.image}
                      onChange={(e) => setNewArticle({ ...newArticle, image: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tags / Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={newArticle.tagsString}
                      onChange={(e) => setNewArticle({ ...newArticle, tagsString: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Fact Check Toggle Subform */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3.5">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fact-check-box"
                      checked={newArticle.isFactCheck}
                      onChange={(e) => setNewArticle({ ...newArticle, isFactCheck: e.target.checked })}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fact-check-box" className="text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer">
                      Publish as Fact Check Verification
                    </label>
                  </div>

                  {newArticle.isFactCheck && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-[slideDown_0.15s_ease-out]">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Verdict Rating</label>
                        <select
                          value={newArticle.factCheckRating}
                          onChange={(e) => setNewArticle({ ...newArticle, factCheckRating: e.target.value as any })}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                        >
                          <option value="true">True</option>
                          <option value="false">False / Hoax</option>
                          <option value="misleading">Misleading</option>
                          <option value="half-true">Half-True</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Brief Truth Verification Explanation</label>
                        <input
                          type="text"
                          value={newArticle.factCheckExplanation}
                          onChange={(e) => setNewArticle({ ...newArticle, factCheckExplanation: e.target.value })}
                          placeholder="e.g. This photo was synthesized on Midjourney v6..."
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Magical Gemini AI enrichment checkbox */}
                <div className="flex items-center space-x-2 bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl">
                  <input
                    type="checkbox"
                    id="auto-translate-box"
                    checked={newArticle.autoTranslate}
                    onChange={(e) => setNewArticle({ ...newArticle, autoTranslate: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-translate-box" className="text-xs font-bold text-indigo-900 uppercase tracking-wider cursor-pointer flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>Auto translate and enrich with Gemini AI (generates summaries, key points, and multilingual tags)</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-red-600 hover:bg-red-750 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition flex items-center space-x-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveLoading ? "Processing AI translations..." : "Publish Article"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Articles Repository List Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Title / Headline</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Flags</th>
                      <th className="p-4">Stats</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {articles.map((art) => (
                      <tr key={art.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 max-w-xs md:max-w-md">
                          <div className="space-y-1">
                            <span className="font-bold text-gray-950 line-clamp-2">{art.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>By {art.author}</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded uppercase font-mono text-[9px]">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap space-y-1">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleToggleFeature(art, "isFeatured")}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                                art.isFeatured ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              Featured
                            </button>
                            <button
                              onClick={() => handleToggleFeature(art, "isTrending")}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                                art.isTrending ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              Trending
                            </button>
                            <button
                              onClick={() => handleToggleFeature(art, "isBreaking")}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                                art.isBreaking ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              Breaking
                            </button>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-500 font-mono">
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center space-x-0.5"><Eye className="w-3 h-3" /> <span>{art.views}</span></span>
                            <span className="flex items-center space-x-0.5"><ThumbsUp className="w-3 h-3 text-blue-500" /> <span>{art.likes}</span></span>
                          </div>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ----------------------------------------------------
            GEMINI AI TOOLKITS TAB
            ---------------------------------------------------- */}
        {activeTab === "ai" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>Gemini AI Newsroom Tools</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Headline Brainstormer */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Headline Generator</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter keyword concepts and let Gemini brainstorm 5 sensational, click-friendly headlines in Bengali.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={aiHeadlineKeyword}
                    onChange={(e) => setAiHeadlineKeyword(e.target.value)}
                    placeholder="e.g., West Bengal Industry MSME New Policy..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                  <button
                    onClick={runAiHeadline}
                    disabled={aiHeadlineLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition w-full"
                  >
                    {aiHeadlineLoading ? "Analyzing patterns..." : "Brainstorm Headlines"}
                  </button>
                </div>
                {aiHeadlineResult && (
                  <div className="bg-gray-50 border border-gray-150 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {aiHeadlineResult}
                  </div>
                )}
              </div>

              {/* Box 2: On-the-fly Multilingual Translator */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center space-x-1.5">
                  <Globe2 className="w-4 h-4 text-indigo-600" />
                  <span>Interactive Translator</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Paste any news story title or paragraph in English, and Gemini will output full localized translations.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={aiTranslateText}
                    onChange={(e) => setAiTranslateText(e.target.value)}
                    placeholder="English headline text..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                  <button
                    onClick={runAiTranslate}
                    disabled={aiTranslateLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition w-full"
                  >
                    {aiTranslateLoading ? "Translating..." : "Translate Headline"}
                  </button>
                </div>
                {aiTranslateResult && (
                  <div className="bg-gray-50 border border-gray-150 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed space-y-2">
                    {aiTranslateResult.error ? (
                      <p className="text-red-600">{aiTranslateResult.error}</p>
                    ) : (
                      <>
                        <p><strong className="text-[10px] text-gray-400 uppercase">Bengali (Default)</strong> <br /> {aiTranslateResult.translations?.bn?.title}</p>
                        <p><strong className="text-[10px] text-gray-400 uppercase">Hindi</strong> <br /> {aiTranslateResult.translations?.hi?.title}</p>
                        <p><strong className="text-[10px] text-gray-400 uppercase">English Check</strong> <br /> {aiTranslateResult.translations?.en?.title}</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Box 3: Standalone AI Summarizer */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4 md:col-span-2">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center space-x-1.5">
                  <Type className="w-4 h-4 text-indigo-600" />
                  <span>AI Summary Generator</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter a long article body text and let Gemini construct a 2-sentence analytical, eye-catching summary card.
                </p>
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={aiSummaryText}
                    onChange={(e) => setAiSummaryText(e.target.value)}
                    placeholder="Paste long text content body here..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none font-sans"
                  />
                  <button
                    onClick={runAiSummary}
                    disabled={aiSummaryLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    {aiSummaryLoading ? "Summarizing..." : "Analyze & Summarize"}
                  </button>
                </div>
                {aiSummaryResult && (
                  <div className="bg-gray-50 border border-gray-150 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {aiSummaryResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* ----------------------------------------------------
            CONFIGURATION TAB
            ---------------------------------------------------- */}
        {activeTab === "settings" && settings && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider">
                Platform Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Settings Form */}
              <form onSubmit={handleUpdateSettings} className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-2 border-b border-gray-100">
                  Global Configuration Settings
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GNews API Key</label>
                  <input
                    type="password"
                    value={settings.gnewsApiKey}
                    onChange={(e) => setSettings({ ...settings, gnewsApiKey: e.target.value })}
                    placeholder="Click to insert GNews API Key..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gemini API Key (For Translations & AI Summaries)</label>
                  <input
                    type="password"
                    value={settings.geminiApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="Click to insert Gemini API Key..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Required to translate original English GNews articles automatically to high-quality Bengali and Hindi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Auto Fetch Interval (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={settings.autoFetchIntervalMinutes}
                      onChange={(e) => setSettings({ ...settings, autoFetchIntervalMinutes: parseInt(e.target.value, 10) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-6 flex items-center">
                    <input
                      type="checkbox"
                      id="auto-fetch-enabled"
                      checked={settings.isAutoFetchEnabled}
                      onChange={(e) => setSettings({ ...settings, isAutoFetchEnabled: e.target.checked })}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-fetch-enabled" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-2 cursor-pointer">
                      Enable Background Aggregator Scheduler
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-summary"
                      checked={settings.enableAiSummary}
                      onChange={(e) => setSettings({ ...settings, enableAiSummary: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-summary" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-2 cursor-pointer flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Enable AI Summary cards</span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable-translation"
                      checked={settings.enableAiTranslation}
                      onChange={(e) => setSettings({ ...settings, enableAiTranslation: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="enable-translation" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-2 cursor-pointer flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Enable Automatic AI i18n Translation</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SEO Title Template Pattern</label>
                  <input
                    type="text"
                    value={settings.seoMetaTitleTemplate}
                    onChange={(e) => setSettings({ ...settings, seoMetaTitleTemplate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SEO Description Template Pattern</label>
                  <input
                    type="text"
                    value={settings.seoMetaDescriptionTemplate}
                    onChange={(e) => setSettings({ ...settings, seoMetaDescriptionTemplate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="bg-red-600 hover:bg-red-750 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? "Saving settings..." : "Save Configuration"}</span>
                </button>
              </form>

              {/* Right Column Utilities */}
              <div className="space-y-6">
                {/* Database Backup & Restore Utility */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-2 border-b border-gray-100 flex items-center space-x-1.5">
                      <Database className="w-4 h-4 text-red-500" />
                      <span>Database Operations</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Download the entire system state (including admin credentials, logs, and settings) as a local JSON file or import a previous backup file.
                    </p>
                  </div>

                  {/* Backup Download */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Database Export</h4>
                    <button
                      onClick={downloadBackup}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>

                  {/* Backup Restore */}
                  <form onSubmit={uploadBackup} className="space-y-3.5 pt-4 border-t border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Database Import</h4>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".json"
                        required
                        onChange={(e) => setDbBackupFile(e.target.files?.[0] || null)}
                        className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer w-full"
                      />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload JSON Restore</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-2 border-b border-gray-100 flex items-center space-x-1.5">
                      <Lock className="w-4 h-4 text-red-500" />
                      <span>Change Admin Password</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Update the credentials used to log into the editorial control panel.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    {changePasswordError && (
                      <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{changePasswordError}</span>
                      </div>
                    )}

                    {changePasswordSuccess && (
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{changePasswordSuccess}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changePasswordLoading}
                      className="w-full flex items-center justify-center space-x-1.5 bg-red-600 hover:bg-red-750 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{changePasswordLoading ? "Updating..." : "Update Password"}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ----------------------------------------------------
            SYSTEM LOGS TAB
            ---------------------------------------------------- */}
        {activeTab === "logs" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-wider">
                System Tracer Logs
              </h2>
              <button
                onClick={handleClearLogs}
                className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Clear Log Console
              </button>
            </div>

            {/* Scrolling Logs Terminal */}
            <div className="bg-gray-950 rounded-2xl p-5 border border-gray-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-[10px] text-gray-500 border-b border-gray-900 pb-2">
                <span className="font-mono">Tracing 200 system events...</span>
                <span className="bg-green-950 text-green-400 border border-green-900 px-1.5 py-0.2 rounded font-mono uppercase text-[9px] animate-pulse">
                  Console Connected
                </span>
              </div>

              <div className="font-mono text-xs text-gray-300 space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <p className="text-gray-600 italic">No diagnostic events logged yet.</p>
                ) : (
                  logs.map((log) => {
                    const levelColors = {
                      info: "text-green-400",
                      warning: "text-amber-400",
                      error: "text-red-500"
                    };
                    return (
                      <div key={log.id} className="flex items-start space-x-2 border-b border-gray-900 pb-1">
                        <span className="text-gray-600 select-none text-[10px]">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className={`font-bold select-none text-[10px] uppercase w-16 ${levelColors[log.level]}`}>
                          {log.level}
                        </span>
                        {log.context && (
                          <span className="bg-gray-900 text-gray-400 border border-gray-800 px-1 rounded text-[9px] select-none font-sans mr-1">
                            {log.context}
                          </span>
                        )}
                        <span className="flex-1 text-gray-200 whitespace-pre-wrap">{log.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
