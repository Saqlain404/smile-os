"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  ClipboardList,
  Users,
  Shield,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { getPatient } from "@/server/actions/patient";
import { PatientFormDialog } from "./patient-form-dialog";
import {
  APPOINTMENT_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/constants";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  dateOfBirth: Date | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  bloodGroup: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  dentalHistory: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  referredBy: string | null;
  notes: string | null;
  avatar: string | null;
  createdAt: Date;
  tags: { id: string; name: string; color: string }[];
  familyMembers: {
    id: string;
    name: string;
    relation: string;
    phone: string | null;
    email: string | null;
  }[];
  insurance: {
    id: string;
    provider: string;
    policyNumber: string;
    memberName: string;
    coveragePercent: number;
    expiryDate: Date | null;
  } | null;
  appointments: {
    id: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: string;
    doctor: {
      user: { name: string };
    };
    treatment: {
      name: string;
      color: string;
    } | null;
  }[];
  invoices: {
    id: string;
    invoiceNumber: string;
    date: Date;
    status: string;
    totalAmount: number;
    payments: {
      id: string;
      amount: number;
      method: string;
      paidAt: Date;
    }[];
  }[];
  medicalRecords: {
    id: string;
    title: string;
    type: string;
    content: string | null;
    createdAt: Date;
  }[];
  prescriptions: {
    id: string;
    date: Date;
    doctorName: string;
    diagnosis: string | null;
    items: {
      id: string;
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
  }[];
  documents: {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
  }[];
  _count: {
    appointments: number;
    invoices: number;
    medicalRecords: number;
    prescriptions: number;
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientDetail({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPatient(patientId);
        setPatient(data as unknown as PatientData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!patient) {
    return (
      <EmptyState
        title="Patient not found"
        description="This patient record could not be found."
        action={{
          label: "Back to Patients",
          onClick: () => router.push("/patients"),
        }}
      />
    );
  }

  const age = patient.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const totalPaid = patient.invoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + paid;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/patients")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
            {patient.firstName.charAt(0)}
            {patient.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {patient.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {patient.phone}
              </span>
              {patient.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {patient.city}, {patient.state}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {patient.tags.map((tag) => (
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
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="Total Visits"
          value={patient._count.appointments}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          icon={DollarSign}
          label="Total Paid"
          value={`$${totalPaid.toLocaleString()}`}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          icon={FileText}
          label="Medical Records"
          value={patient._count.medicalRecords}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          icon={ClipboardList}
          label="Prescriptions"
          value={patient._count.prescriptions}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "—"} />
                <InfoRow label="Age" value={age ? `${age} years` : "—"} />
                <InfoRow label="Gender" value={patient.gender ?? "—"} />
                <InfoRow label="Blood Group" value={patient.bloodGroup ?? "—"} />
                <InfoRow label="Referred By" value={patient.referredBy ?? "—"} />
                <InfoRow label="Registered" value={new Date(patient.createdAt).toLocaleDateString()} />
              </CardContent>
            </Card>

            {/* Emergency & Medical */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency & Medical</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Emergency Contact" value={patient.emergencyContact ?? "—"} />
                <InfoRow label="Emergency Phone" value={patient.emergencyPhone ?? "—"} />
                <Separator className="my-2" />
                <InfoRow label="Allergies" value={patient.allergies ?? "None reported"} />
                <InfoRow label="Medical History" value={patient.medicalHistory ?? "None reported"} />
                <InfoRow label="Dental History" value={patient.dentalHistory ?? "None reported"} />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {patient.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Appointments</CardTitle>
              <Badge variant="secondary">{patient.appointments.length}</Badge>
            </CardHeader>
            <CardContent>
              {patient.appointments.length === 0 ? (
                <EmptyState
                  type="empty"
                  title="No appointments"
                  description="This patient has no appointment history."
                />
              ) : (
                <div className="space-y-2">
                  {patient.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs text-muted-foreground">
                          {new Date(apt.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm font-medium">{apt.startTime}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{apt.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {apt.doctor.user.name}
                          {apt.treatment && ` · ${apt.treatment.name}`}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${APPOINTMENT_STATUS_COLORS[apt.status] ?? ""}`}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Tab */}
        <TabsContent value="medical" className="space-y-4">
          {/* Medical Records */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Medical Records</CardTitle>
              <Badge variant="secondary">{patient.medicalRecords.length}</Badge>
            </CardHeader>
            <CardContent>
              {patient.medicalRecords.length === 0 ? (
                <EmptyState
                  type="empty"
                  title="No medical records"
                  description="No medical records on file."
                />
              ) : (
                <div className="space-y-2">
                  {patient.medicalRecords.map((record) => (
                    <div key={record.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{record.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {record.type}
                        </Badge>
                      </div>
                      {record.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {record.content}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Prescriptions</CardTitle>
              <Badge variant="secondary">{patient.prescriptions.length}</Badge>
            </CardHeader>
            <CardContent>
              {patient.prescriptions.length === 0 ? (
                <EmptyState
                  type="empty"
                  title="No prescriptions"
                  description="No prescriptions on file."
                />
              ) : (
                <div className="space-y-3">
                  {patient.prescriptions.map((rx) => (
                    <div key={rx.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {rx.diagnosis ?? "Prescription"}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rx.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Dr. {rx.doctorName}
                      </p>
                      <div className="space-y-1">
                        {rx.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="font-medium">{item.medication}</span>
                            <span className="text-muted-foreground">
                              {item.dosage} · {item.frequency} · {item.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Invoices</CardTitle>
              <Badge variant="secondary">{patient.invoices.length}</Badge>
            </CardHeader>
            <CardContent>
              {patient.invoices.length === 0 ? (
                <EmptyState
                  type="empty"
                  title="No invoices"
                  description="No billing history."
                />
              ) : (
                <div className="space-y-2">
                  {patient.invoices.map((inv) => {
                    const paid = inv.payments.reduce(
                      (s, p) => s + Number(p.amount),
                      0
                    );
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {inv.invoiceNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(inv.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${Number(inv.totalAmount).toLocaleString()}
                          </p>
                          {paid < Number(inv.totalAmount) && (
                            <p className="text-xs text-muted-foreground">
                              ${paid.toLocaleString()} paid
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${PAYMENT_STATUS_COLORS[inv.status] ?? ""}`}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {patient.documents.length === 0 ? (
                <EmptyState
                  type="empty"
                  title="No documents"
                  description="Upload X-rays, reports, or other documents."
                />
              ) : (
                <div className="space-y-2">
                  {patient.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} · {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Family Members</CardTitle>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {patient.familyMembers.length === 0 ? (
                <EmptyState
                  type="empty"
                  title="No family members"
                  description="Link family members to this patient."
                />
              ) : (
                <div className="space-y-2">
                  {patient.familyMembers.map((fm) => (
                    <div
                      key={fm.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {fm.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{fm.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {fm.relation}
                          {fm.phone && ` · ${fm.phone}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Insurance</CardTitle>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                {patient.insurance ? "Edit" : "Add"}
              </Button>
            </CardHeader>
            <CardContent>
              {!patient.insurance ? (
                <EmptyState
                  type="empty"
                  title="No insurance"
                  description="Add insurance details for this patient."
                />
              ) : (
                <div className="space-y-3">
                  <InfoRow label="Provider" value={patient.insurance.provider} />
                  <InfoRow label="Policy Number" value={patient.insurance.policyNumber} />
                  <InfoRow label="Member Name" value={patient.insurance.memberName} />
                  <InfoRow label="Coverage" value={`${patient.insurance.coveragePercent}%`} />
                  {patient.insurance.expiryDate && (
                    <InfoRow
                      label="Expiry Date"
                      value={new Date(patient.insurance.expiryDate).toLocaleDateString()}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PatientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={{ ...patient } as { id: string; [key: string]: unknown }}
        onSuccess={() => {
          setEditOpen(false);
          window.location.reload();
        }}
      />
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
