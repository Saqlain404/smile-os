"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations";
import { createInvoice, updateInvoice } from "@/server/actions/billing";
import { getTreatments } from "@/server/actions/appointment";
import { getPatients } from "@/server/actions/patient";

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Record<string, unknown> | null;
  onSuccess: () => void;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Treatment {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: InvoiceFormDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(invoiceSchema) as never,
    defaultValues: {
      patientId: "",
      dueDate: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      discount: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  useEffect(() => {
    async function loadData() {
      try {
        const [patientResult, treatmentResult] = await Promise.all([
          getPatients({ pageSize: 200 }),
          getTreatments(),
        ]);
        setPatients(patientResult.data as Patient[]);
        setTreatments((treatmentResult as unknown as Treatment[]).map((t) => ({ ...t, price: Number(t.price) })));
      } catch (err) {
      }
    }
    if (open) loadData();
  }, [open]);

  useEffect(() => {
    if (invoice) {
      reset({
        patientId: invoice.patientId as string,
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate as string).toISOString().split("T")[0]
          : "",
        items: (invoice.items as { description: string; quantity: number; unitPrice: number }[])?.map(
          (item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          })
        ) || [{ description: "", quantity: 1, unitPrice: 0 }],
        discount: Number(invoice.discount) || 0,
        notes: (invoice.notes as string) ?? "",
      });
    } else {
      reset({
        patientId: "",
        dueDate: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
        discount: 0,
        notes: "",
      });
    }
  }, [invoice, reset, open]);

  const onSubmit = async (data: InvoiceFormData) => {
    setError("");
    try {
      if (invoice) {
        await updateInvoice(invoice.id as string, {
          patientId: data.patientId,
          dueDate: data.dueDate || undefined,
          items: data.items,
          discount: data.discount,
          notes: data.notes,
        });
      } else {
        await createInvoice({
          patientId: data.patientId,
          dueDate: data.dueDate || undefined,
          items: data.items,
          discount: data.discount,
          notes: data.notes,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save invoice");
    }
  };

  const addTreatmentItem = (treatmentId: string | null) => {
    if (!treatmentId) return;
    const treatment = treatments.find((t) => t.id === treatmentId);
    if (treatment) {
      append({ description: treatment.name, quantity: 1, unitPrice: treatment.price });
    }
  };

  const subtotal = watchItems?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) ?? 0;
  const discount = watch("discount") ?? 0;
  const total = subtotal - discount;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? "Edit Invoice" : "New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Patient & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select
                value={watch("patientId") ?? ""}
                onValueChange={(v) => v && setValue("patientId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          {/* Quick-add from treatments */}
          <div className="space-y-2">
            <Label>Quick-add from treatments</Label>
            <Select onValueChange={(v) => { addTreatmentItem(v as string); }}>
              <SelectTrigger>
                <SelectValue placeholder="Add a treatment as line item..." />
              </SelectTrigger>
              <SelectContent>
                {treatments.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} — {formatCurrency(t.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Line Items</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3 rounded-lg border p-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Description *</Label>
                  <Input
                    {...register(`items.${index}.description`)}
                    placeholder="Service description"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs">Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs">Total</Label>
                  <div className="h-9 flex items-center text-sm font-medium">
                    {formatCurrency(
                      (watchItems?.[index]?.quantity || 0) * (watchItems?.[index]?.unitPrice || 0)
                    )}
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-28 text-right h-8"
                  {...register("discount", { valueAsNumber: true })}
                />
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={2} placeholder="Additional notes..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : invoice ? (
                "Save Changes"
              ) : (
                "Create Invoice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
