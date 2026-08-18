"use client";

import { useState, useEffect } from "react";
import { Search, Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import { NotificationCenter } from "@/components/notifications/notification-center";

export function PatientTopbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { data: session } = useSession();

  useEffect(() => {
    const saved = localStorage.getItem("smileos-theme") as
      | "light"
      | "dark"
      | null;
    const initial = saved ?? "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("smileos-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search appointments, invoices..."
            className="pl-9 h-9 bg-muted/50 border-transparent focus:border-primary/20 focus:bg-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationCenter />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm" className="gap-2 h-9">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? "P"}
              </div>
              <span className="text-sm font-medium hidden md:inline-block">
                {session?.user?.name ?? "Patient"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
