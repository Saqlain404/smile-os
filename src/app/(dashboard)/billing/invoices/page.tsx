"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceList } from "@/components/billing/invoice-list";
import { InvoiceFormDialog } from "@/components/billing/invoice-form-dialog";

export default function InvoicesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create and manage patient invoices."
        actions={
          <Button onClick={() => setFormOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      <InvoiceList key={refreshKey} />

      <InvoiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          setFormOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
