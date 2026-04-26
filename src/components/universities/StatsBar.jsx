import React from "react";
import { GraduationCap, DollarSign, Globe, TrendingUp } from "lucide-react";

export default function StatsBar({ colleges }) {
  const totalColleges = colleges.length;
  const needBlindCount = colleges.filter(c => c.aid_type === "Need-Blind").length;
  const avgAid = colleges.length > 0
    ? Math.round(
        colleges.filter(c => c.avg_aid_intl).reduce((sum, c) => sum + c.avg_aid_intl, 0) /
        colleges.filter(c => c.avg_aid_intl).length || 1
      )
    : 0;
  const avgPct = colleges.length > 0
    ? Math.round(
        colleges.filter(c => c.pct_intl_receiving_aid != null).reduce((sum, c) => sum + c.pct_intl_receiving_aid, 0) /
        (colleges.filter(c => c.pct_intl_receiving_aid != null).length || 1)
      )
    : 0;

  const stats = [
    { icon: GraduationCap, label: "Institutions", value: totalColleges },
    { icon: Globe, label: "Need-Blind", value: needBlindCount },
    { icon: DollarSign, label: "Avg Aid", value: `$${avgAid.toLocaleString()}` },
    { icon: TrendingUp, label: "Avg % Aided", value: `${avgPct}%` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}