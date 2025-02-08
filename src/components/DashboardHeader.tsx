import React from "react";
import { Search, Filter, Calendar, Grid } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onViewChange?: (view: "calendar" | "grid") => void;
  currentView?: "calendar" | "grid";
}

const DashboardHeader = ({
  onSearch = () => {},
  onFilterChange = () => {},
  onViewChange = () => {},
  currentView = "calendar",
}: DashboardHeaderProps) => {
  return (
    <header className="w-full h-[72px] px-6 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search trips..."
            className="pl-10 w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <Select onValueChange={onFilterChange} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter trips" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trips</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Sort by Date</DropdownMenuItem>
            <DropdownMenuItem>Sort by Destination</DropdownMenuItem>
            <DropdownMenuItem>Sort by Duration</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={currentView === "calendar" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewChange("calendar")}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewChange("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
