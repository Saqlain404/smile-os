import { PatientSidebar } from "@/components/patient-portal/patient-sidebar";
import { PatientTopbar } from "@/components/patient-portal/patient-topbar";

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <PatientSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PatientTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
