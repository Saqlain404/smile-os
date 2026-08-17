"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { PatientFormDialog } from "./patient-form-dialog";
import { getPatients, deletePatient } from "@/server/actions/patient";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/use-debounce";

interface PatientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  gender: string | null;
  avatar: string | null;
  tags: { id: string; name: string; color: string }[];
  _count: { appointments: number; invoices: number };
  createdAt: Date | string;
  [key: string]: unknown;
}

const genderColors: Record<string, string> = {
  MALE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  FEMALE:
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

export function PatientList() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [sort, setSort] = useState<{ column: string; direction: "asc" | "desc" }>({ column: "createdAt", direction: "desc" });
  const [formOpen, setFormOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<PatientRow | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPatients({
        search: debouncedSearch,
        page,
        pageSize: 20,
        sort: sort.column,
        order: sort.direction,
      });
      setPatients(result.data as PatientRow[]);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, sort]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    await deletePatient(id);
    fetchPatients();
  };

  const columns: Column<PatientRow>[] = [
    {
      id: "name",
      header: "Patient",
      sortable: true,
      accessorFn: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
            {row.firstName.charAt(0)}
            {row.lastName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phone",
    },
    {
      id: "gender",
      header: "Gender",
      accessorFn: (row) => (
        <Badge
          variant="secondary"
          className={`text-xs ${genderColors[row.gender as string] ?? ""}`}
        >
          {row.gender ?? "—"}
        </Badge>
      ),
    },
    {
      id: "tags",
      header: "Tags",
      accessorFn: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: tag.color + "20",
                color: tag.color,
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {(row.tags?.length ?? 0) > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{(row.tags?.length ?? 0) - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "appointments",
      header: "Visits",
      accessorFn: (row) => (
        <span className="text-sm">{row._count?.appointments ?? 0}</span>
      ),
    },
    {
      id: "invoices",
      header: "Invoices",
      accessorFn: (row) => (
        <span className="text-sm">{row._count?.invoices ?? 0}</span>
      ),
    },
  ];

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Gender", "Created At"];
    const rows = patients.map((p) => [
      `${p.firstName} ${p.lastName}`,
      p.email ?? "",
      p.phone,
      p.gender ?? "",
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patients.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Manage your patient records and medical history."
        actions={
          <Button onClick={() => { setEditPatient(null); setFormOpen(true); }} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={patients}
        searchPlaceholder="Search patients by name, email, or phone..."
        onSearch={setSearch}
        pagination={pagination}
        onPageChange={setPage}
        sortBy={sort.column}
        sortOrder={sort.direction}
        onSort={(column, direction) => setSort({ column, direction })}
        loading={loading}
        emptyTitle="No patients found"
        emptyDescription="Add your first patient to get started."
        onExport={exportCSV}
        getRowId={(row) => row.id}
        actions={(row) => (
          <>
            <DropdownMenuItem onClick={() => router.push(`/patients/${row.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditPatient(row);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      />

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editPatient}
        onSuccess={() => {
          fetchPatients();
          setFormOpen(false);
          setEditPatient(null);
        }}
      />
    </div>
  );
}
