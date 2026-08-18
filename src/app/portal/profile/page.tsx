"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, MapPin, Heart, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { getPatientByUserId } from "@/server/actions/patient-portal";

const DEMO_USER_ID = "current-user";

interface ProfilePatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  dateOfBirth: Date | null;
  bloodGroup: string | null;
  isActive: boolean;
  allergies: string | null;
  medicalHistory: string | null;
  dentalHistory: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  insurance: {
    provider: string;
    policyNumber: string;
  } | null;
  clinic: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;
  _count: {
    appointments: number;
  };
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PatientProfilePage() {
  const [patient, setPatient] = useState<ProfilePatient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPatientByUserId(DEMO_USER_ID);
        if (data) setPatient(data as unknown as ProfilePatient);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const firstName = patient?.firstName ?? "";
  const lastName = patient?.lastName ?? "";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title="My Profile"
          description="View and manage your personal information."
        />
      </motion.div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      ) : !patient ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <User className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">No profile found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please contact your clinic to set up your patient profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Header Card */}
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                    {(firstName[0] ?? "P").toUpperCase()}{(lastName[0] ?? "").toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {firstName} {lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Patient ID: {patient.id.slice(0, 8)}...
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {patient.isActive && (
                        <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </Badge>
                      )}
                      {patient.bloodGroup && (
                        <Badge variant="secondary" className="text-[10px]">
                          Blood: {patient.bloodGroup}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{patient.email ?? "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{patient.phone ?? "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">
                        {[patient.address, patient.city, patient.state, patient.zipCode]
                          .filter(Boolean)
                          .join(", ") || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-sm font-medium">
                        {patient.dateOfBirth
                          ? new Date(patient.dateOfBirth).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Medical Information */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                  <p className="text-sm">{patient.allergies ?? "None on file"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Medical History</p>
                  <p className="text-sm">{patient.medicalHistory ?? "None on file"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dental History</p>
                  <p className="text-sm">{patient.dentalHistory ?? "None on file"}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Emergency Contact */}
          {(patient.emergencyContact || patient.emergencyPhone) && (
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">
                        {(patient.emergencyContact) ?? "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">
                        {(patient.emergencyPhone) ?? "Not provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Insurance */}
            {patient.insurance && (
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="text-sm font-medium">
                        {patient.insurance?.provider ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Policy Number</p>
                      <p className="text-sm font-medium">
                        {patient.insurance?.policyNumber ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
