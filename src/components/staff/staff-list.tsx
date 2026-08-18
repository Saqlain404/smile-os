"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/shared/data-table/data-table";
import { getStaff, deleteStaff } from "@/server/actions/staff";

interface StaffRow {
  id: string;
  employeeId: string;
  specialization: string | null;
  isActive: boolean;
  joinDate: string;
  user: { id: string; name: string; email: string; image: string | null; role: string };
  department: { id: string; name: string; color: string } | null;
  _count: { appointments: number; consultations: number };
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-amber-100 text-amber-800",
  DENTIST: "bg-blue-100 text-blue-800",
  RECEPTIONIST: "bg-green-100 text-green-800",
  ASSISTANT: "bg-purple-100 text-purple-800",
};

export function StaffList() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStaff({ search, page, pageSize: 20 });
      setStaff(result.data as unknown as StaffRow[]);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They won't be able to log in.`)) return;
    try {
      await deleteStaff(id);
      loadStaff();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to deactivate");
    }
  };

  const columns: Column<StaffRow>[] = [
    {
      id: "name",
      header: "Staff Member",
      accessorFn: (row) => (
        <Link href={`/staff/${row.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
            {row.user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{row.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{row.user.email}</p>
          </div>
        </Link>
      ),
      sortable: true,
    },
    {
      id: "role",
      header: "Role",
      accessorFn: (row) => (
        <Badge variant="secondary" className={`text-xs ${ROLE_COLORS[row.user.role] ?? ""}`}>
          {row.user.role}
        </Badge>
      ),
    },
    {
      id: "department",
      header: "Department",
      accessorFn: (row) =>
        row.department ? (
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: row.department.color }}
            />
            <span className="text-sm">{row.department.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "employeeId",
      header: "Employee ID",
      accessorFn: (row) => <span className="text-sm font-mono">{row.employeeId}</span>,
    },
    {
      id: "specialization",
      header: "Specialization",
      accessorFn: (row) => (
        <span className="text-sm">{row.specialization || "—"}</span>
      ),
    },
    {
      id: "appointments",
      header: "Appointments",
      accessorFn: (row) => (
        <span className="text-sm">{row._count.appointments}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => (
        <Badge
          variant="secondary"
          className={`text-xs ${row.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const actions = (row: StaffRow) => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/staff/${row.id}`} />}>
          <Eye className="h-4 w-4" /> View Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/staff/${row.id}?edit=true`} />}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(row.id, row.user.name)}
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" /> Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DataTable
      columns={columns as unknown as Column<Record<string, unknown>>[]}
      data={staff as unknown as Record<string, unknown>[]}
      searchPlaceholder="Search by name, email, ID, or specialization..."
      onSearch={handleSearch}
      pagination={pagination}
      onPageChange={setPage}
      actions={(row) => actions(row as unknown as StaffRow)}
      loading={loading}
      emptyTitle="No staff members"
      emptyDescription="Add your first team member to get started."
      getRowId={(row) => (row as Record<string, unknown>).id as string}
    />
  );
}
