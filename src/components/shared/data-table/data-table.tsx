"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// DataTable uses inline checkbox, no import needed
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  hidden?: boolean;
}

export interface BulkAction<T = Record<string, unknown>> {
  label: string;
  icon?: React.ReactNode;
  onClick: (selected: T[]) => void;
  variant?: "default" | "destructive";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: string;
  onSearch?: (value: string) => void;
  bulkActions?: BulkAction[];
  actions?: (row: T) => React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onExport?: () => void;
  getRowId?: (row: T) => string;
}

function CheckboxComponent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} className="flex items-center">
      {checked ? (
        <CheckSquare className="h-4 w-4 text-primary" />
      ) : (
        <Square className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = "Search...",
  onSearch,
  bulkActions,
  actions,
  pagination,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  loading,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyAction,
  onExport,
  getRowId,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [internalSort, setInternalSort] = useState<{
    column: string;
    direction: "asc" | "desc";
  }>({ column: "", direction: "asc" });

  const sortColumn = sortBy ?? internalSort.column;
  const sortDirection = sortOrder ?? internalSort.direction;

  const visibleColumns = useMemo(
    () => columns.filter((c) => !c.hidden),
    [columns]
  );

  const allSelected = data.length > 0 && selected.size === data.length;
  const someSelected = selected.size > 0 && selected.size < data.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      const ids = data.map((row, i) =>
        getRowId ? getRowId(row) : String(i)
      );
      setSelected(new Set(ids));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handleSort = (columnId: string) => {
    const nextDir =
      sortColumn === columnId && sortDirection === "asc" ? "desc" : "asc";

    if (onSort) {
      onSort(columnId, nextDir);
    } else {
      setInternalSort({ column: columnId, direction: nextDir });
    }
  };

  const selectedRows = data.filter((row, i) => {
    const id = getRowId ? getRowId(row) : String(i);
    return selected.has(id);
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-9 h-9 bg-muted/50 border-transparent focus:border-primary/20"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
          {selected.size > 0 && bulkActions && (
            <div className="flex items-center gap-2 animate-fade-in">
              <Badge variant="secondary">{selected.size} selected</Badge>
              {bulkActions.map((action, i) => (
                <Button
                  key={i}
                  variant={
                    action.variant === "destructive" ? "destructive" : "outline"
                  }
                  size="sm"
                  onClick={() => action.onClick(selectedRows)}
                  className="gap-1.5"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b transition-colors">
              {bulkActions && (
                <th className="h-10 w-10 px-3 text-left">
                  <CheckboxComponent
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                    col.sortable &&
                      "cursor-pointer select-none hover:text-foreground",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sortColumn === col.id ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="h-10 w-10 px-3" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {bulkActions && (
                    <td className="h-14 px-3">
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td key={col.id} className="h-14 px-4">
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                  {actions && <td className="h-14 px-3" />}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length + (bulkActions ? 1 : 0) + (actions ? 1 : 0)
                  }
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={
                      emptyAction
                        ? { label: "", onClick: () => {} }
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = getRowId ? getRowId(row) : String(rowIndex);
                return (
                  <tr
                    key={rowId}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/30",
                      selected.has(rowId) && "bg-primary/5"
                    )}
                  >
                    {bulkActions && (
                      <td className="h-14 px-3">
                        <CheckboxComponent
                          checked={selected.has(rowId)}
                          onChange={() => toggleRow(rowId)}
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.id} className={cn("h-14 px-4", col.className)}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorFn
                            ? col.accessorFn(row)
                            : col.accessorKey
                              ? String(row[col.accessorKey] ?? "")
                              : null}
                      </td>
                    ))}
                    {actions && (
                      <td className="h-14 px-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions(row)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }).map(
              (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => onPageChange?.(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
