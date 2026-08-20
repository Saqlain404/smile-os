"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { staffSchema, type StaffFormData } from "@/lib/validations";
import { createStaff, updateStaff, getDepartments } from "@/server/actions/staff";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Record<string, unknown> | null;
  onSuccess: () => void;
}

interface Department {
  id: string;
  name: string;
  color: string;
}

const ROLES = [
  { value: "DENTIST", label: "Dentist" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "ADMIN", label: "Admin" },
];

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffFormDialogProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");

  const isEdit = !!staff;

  // Parse staff names
  const userName = (staff?.user as { name: string } | undefined)?.name ?? "";
  const firstName = isEdit ? userName.split(" ")[0] : "";
  const lastName = isEdit ? userName.split(" ").slice(1).join(" ") : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(staffSchema) as never,
    defaultValues: {
      firstName,
      lastName,
      email: (staff?.user as { email: string } | undefined)?.email ?? "",
      phone: (staff?.phone as string) ?? "",
      role: (staff?.user as { role: string } | undefined)?.role ?? "DENTIST",
      departmentId: (staff?.departmentId as string) ?? "",
      specialization: (staff?.specialization as string) ?? "",
      licenseNumber: (staff?.licenseNumber as string) ?? "",
      bio: (staff?.bio as string) ?? "",
      salary: (staff?.salary as number) ?? undefined,
    },
  });

  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await getDepartments();
        setDepartments(data as Department[]);
      } catch (err) {
      }
    }
    if (open) loadDepts();
  }, [open]);

  useEffect(() => {
    if (open) {
      const name = (staff?.user as { name: string } | undefined)?.name ?? "";
      reset({
        firstName: isEdit ? name.split(" ")[0] : "",
        lastName: isEdit ? name.split(" ").slice(1).join(" ") : "",
        email: (staff?.user as { email: string } | undefined)?.email ?? "",
        phone: (staff?.phone as string) ?? "",
        role: (staff?.user as { role: string } | undefined)?.role ?? "DENTIST",
        departmentId: (staff?.departmentId as string) ?? "",
        specialization: (staff?.specialization as string) ?? "",
        licenseNumber: (staff?.licenseNumber as string) ?? "",
        bio: (staff?.bio as string) ?? "",
        salary: (staff?.salary as number) ?? undefined,
      });
    }
  }, [open, staff, isEdit, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setError("");
    try {
      if (isEdit) {
        await updateStaff(staff!.id as string, {
          firstName: data.firstName as string,
          lastName: data.lastName as string,
          email: data.email as string,
          phone: (data.phone as string) || undefined,
          role: data.role as string,
          departmentId: (data.departmentId as string) || undefined,
          specialization: (data.specialization as string) || undefined,
          licenseNumber: (data.licenseNumber as string) || undefined,
          bio: (data.bio as string) || undefined,
          salary: (data.salary as number) || undefined,
        });
      } else {
        await createStaff({
          firstName: data.firstName as string,
          lastName: data.lastName as string,
          email: data.email as string,
          phone: (data.phone as string) || undefined,
          role: data.role as string,
          departmentId: (data.departmentId as string) || undefined,
          specialization: (data.specialization as string) || undefined,
          licenseNumber: (data.licenseNumber as string) || undefined,
          bio: (data.bio as string) || undefined,
          salary: (data.salary as number) || undefined,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save staff member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Staff Member" : "Add Staff Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Name & Email */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register("firstName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register("lastName")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Role & Department</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={watch("role") ?? ""}
                  onValueChange={(v) => v && setValue("role", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={watch("departmentId") ?? ""}
                  onValueChange={(v) => setValue("departmentId", v as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Professional Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" {...register("specialization")} placeholder="e.g. Orthodontics" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input id="licenseNumber" {...register("licenseNumber")} placeholder="e.g. DEN-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary (Annual)</Label>
              <Input id="salary" type="number" step="100" min="0" {...register("salary", { valueAsNumber: true })} />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" {...register("bio")} rows={2} placeholder="Brief bio or notes..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Staff Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
