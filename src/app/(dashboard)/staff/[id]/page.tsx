"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getStaffMember, deleteStaff } from "@/server/actions/staff";
import { StaffFormDialog } from "@/components/staff/staff-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface StaffData {
  id: string;
  employeeId: string;
  specialization: string | null;
  licenseNumber: string | null;
  bio: string | null;
  phone: string | null;
  joinDate: string;
  isActive: boolean;
  salary: number | null;
  user: { id: string; name: string; email: string; image: string | null; role: string };
  department: { id: string; name: string; color: string } | null;
  schedules: { id: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[];
  attendance: { id: string; date: string; clockIn: string | null; clockOut: string | null; status: string }[];
  leaves: { id: string; startDate: string; endDate: string; reason: string; status: string }[];
  _count: { appointments: number; consultations: number };
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-amber-100 text-amber-800",
  DENTIST: "bg-blue-100 text-blue-800",
  RECEPTIONIST: "bg-green-100 text-green-800",
  ASSISTANT: "bg-purple-100 text-purple-800",
};

const ATTENDANCE_COLORS: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-800",
  ABSENT: "bg-red-100 text-red-800",
  LATE: "bg-amber-100 text-amber-800",
  HALF_DAY: "bg-orange-100 text-orange-800",
  ON_LEAVE: "bg-blue-100 text-blue-800",
};

const LEAVE_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [staff, setStaff] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      const data = await getStaffMember(id);
      setStaff(data as unknown as StaffData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleDelete = async () => {
    try {
      await deleteStaff(id);
      toast.success("Staff member deactivated");
      router.push("/staff");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Staff member not found.</p>
        <Button variant="link" className="mt-2">
          <Link href="/staff">Back to staff</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Link href="/staff" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-medium">
              {staff.user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{staff.user.name}</h1>
                <Badge variant="secondary" className={`text-xs ${ROLE_COLORS[staff.user.role] ?? ""}`}>
                  {staff.user.role}
                </Badge>
                {!staff.isActive && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{staff.employeeId}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(true)} className="gap-1.5 text-destructive">
            <Trash2 className="h-4 w-4" />
            Deactivate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Professional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact & Professional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.department?.name || "No department"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(staff.joinDate).toLocaleDateString()}</span>
                </div>
                {staff.specialization && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.specialization}</span>
                  </div>
                )}
                {staff.licenseNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>License: {staff.licenseNumber}</span>
                  </div>
                )}
              </div>
              {staff.bio && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{staff.bio}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Work Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {staff.schedules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No schedule configured.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DAYS.map((day, i) => {
                    const schedule = staff.schedules.find((s) => s.dayOfWeek === i);
                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          !schedule || !schedule.isActive ? "opacity-50" : ""
                        }`}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        {schedule && schedule.isActive ? (
                          <span className="text-sm text-muted-foreground">
                            {schedule.startTime} — {schedule.endTime}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Off</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {staff.attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records yet.</p>
              ) : (
                <div className="space-y-2">
                  {staff.attendance.slice(0, 10).map((att) => (
                    <div key={att.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {new Date(att.date).toLocaleDateString()}
                        </span>
                        <Badge variant="secondary" className={`text-xs ${ATTENDANCE_COLORS[att.status] ?? ""}`}>
                          {att.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {att.clockIn && (
                          <span>In: {new Date(att.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                        {att.clockOut && (
                          <span> · Out: {new Date(att.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Appointments</span>
                <span className="font-medium">{staff._count.appointments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consultations</span>
                <span className="font-medium">{staff._count.consultations}</span>
              </div>
              {staff.salary && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Salary</span>
                    <span className="font-medium">
                      ${Number(staff.salary).toLocaleString()}/yr
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Leaves */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              {staff.leaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave requests.</p>
              ) : (
                <div className="space-y-2">
                  {staff.leaves.map((leave) => (
                    <div key={leave.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                        <Badge variant="secondary" className={`text-xs ${LEAVE_STATUS_COLORS[leave.status] ?? ""}`}>
                          {leave.status}
                        </Badge>
                      </div>
                      <p className="text-sm">{leave.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this staff member? They will no longer be able to log in or be assigned to appointments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StaffFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        staff={staff as unknown as Record<string, unknown>}
        onSuccess={() => {
          setEditOpen(false);
          loadStaff();
        }}
      />
    </div>
  );
}
