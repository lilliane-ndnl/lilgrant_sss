import { db } from '@/api/base44Client';
import React from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Favorites() {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => db.entities.Favorite.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return (
    <div className="min-h-screen pt-10 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">❤️</div>
          <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Colleges you've saved for your application journey.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/50" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
              You haven't saved any colleges yet.
            </p>
            <Link
              to="/universities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Browse Universities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {favorites.map((fav) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="flex items-center justify-between px-5 py-4 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.17)" }}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 flex-shrink-0" style={{ fill: "#f472b6", color: "#f472b6" }} />
                    <Link
                      to={`/universities/${fav.college_id}`}
                      className="text-sm font-medium text-white hover:opacity-80 transition-opacity"
                    >
                      {fav.college_name || "Unknown College"}
                    </Link>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(fav.id)}
                    className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}