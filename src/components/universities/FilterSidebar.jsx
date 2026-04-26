import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West", "Mid-Atlantic"];

export default function FilterSidebar({ filters, onFilterChange, onReset }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground h-7 px-2">
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="pl-9 rounded-xl text-sm h-10 bg-muted/30"
          />
        </div>
      </div>

      {/* State */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">State</Label>
        <Select value={filters.state || "all"} onValueChange={(v) => handleChange("state", v)}>
          <SelectTrigger className="rounded-xl h-10 text-sm bg-muted/30">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Region</Label>
        <Select value={filters.region || "all"} onValueChange={(v) => handleChange("region", v)}>
          <SelectTrigger className="rounded-xl h-10 text-sm bg-muted/30">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Aid Type */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Aid Policy</Label>
        <Select value={filters.aid_type || "all"} onValueChange={(v) => handleChange("aid_type", v)}>
          <SelectTrigger className="rounded-xl h-10 text-sm bg-muted/30">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Need-Blind">Need-Blind</SelectItem>
            <SelectItem value="Need-Aware">Need-Aware</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Control Type */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Institution Type</Label>
        <Select value={filters.control_type || "all"} onValueChange={(v) => handleChange("control_type", v)}>
          <SelectTrigger className="rounded-xl h-10 text-sm bg-muted/30">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Public">Public</SelectItem>
            <SelectItem value="Private Non-Profit">Private Non-Profit</SelectItem>
            <SelectItem value="Private For-Profit">Private For-Profit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Min Aid Amount */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Minimum Avg Aid</Label>
          <span className="text-xs font-semibold text-primary">
            ${(filters.minAid || 0).toLocaleString()}
          </span>
        </div>
        <Slider
          value={[filters.minAid || 0]}
          onValueChange={([v]) => handleChange("minAid", v)}
          min={0}
          max={80000}
          step={5000}
          className="py-1"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>$0</span>
          <span>$80,000</span>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Sort By</Label>
        <Select value={filters.sortBy || "name_asc"} onValueChange={(v) => handleChange("sortBy", v)}>
          <SelectTrigger className="rounded-xl h-10 text-sm bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A–Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z–A)</SelectItem>
            <SelectItem value="aid_desc">Aid (High → Low)</SelectItem>
            <SelectItem value="aid_asc">Aid (Low → High)</SelectItem>
            <SelectItem value="pct_desc">% Intl Aid (High → Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}