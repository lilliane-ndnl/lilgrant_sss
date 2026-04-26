import { db } from '@/api/base44Client';
import React, { useState, useEffect } from "react";

import { Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Export() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllColleges = async () => {
      setLoading(true);
      setError("");
      try {
        let allRecords = [];
        let page = 0;
        const PAGE_SIZE = 100;

        // Paginate through all records
        while (true) {
          const batch = await db.entities.College.list("-created_date", PAGE_SIZE, page * PAGE_SIZE);
          if (batch.length === 0) break;
          allRecords = allRecords.concat(batch);
          page++;
        }

        setColleges(allRecords);
        toast.success(`Loaded ${allRecords.length} colleges`);
      } catch (err) {
        const msg = err.message || "Failed to fetch colleges";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchAllColleges();
  }, []);

  const handleDownload = async () => {
    if (colleges.length === 0) {
      toast.error("No colleges to export");
      return;
    }

    setDownloading(true);
    try {
      const jsonStr = JSON.stringify(colleges, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `colleges-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${colleges.length} colleges`);
    } catch (err) {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">College Database Export</h1>
          <p style={{ color: "rgba(255,255,255,0.65)" }}>Download all colleges as JSON</p>
        </div>

        <div
          className="rounded-2xl p-8 mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
              <p style={{ color: "rgba(255,255,255,0.65)" }}>Loading colleges...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6 p-4 rounded-lg" style={{ backgroundColor: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-semibold text-white">{colleges.length} colleges loaded</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem" }}>Ready to export</p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.88)",
                  color: "#7a5a9d",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.95)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.88)")}
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download {colleges.length} Colleges
                  </>
                )}
              </button>

              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", marginTop: "1rem", textAlign: "center" }}>
                File: colleges-[date].json
              </p>
            </>
          )}
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1rem" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
            This export includes all {colleges.length} college records with complete data. Verify the count matches your database.
          </p>
        </div>
      </div>
    </div>
  );
}