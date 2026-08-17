import { type Session } from "@/lib/auth";

export type User = Session["user"];

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface TableColumn<T = unknown> {
  id: string;
  header: string;
  accessorKey?: string;
  accessorFn?: (row: T) => string | number | boolean | null;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SortState {
  column: string;
  direction: "asc" | "desc";
}

export interface FilterState {
  column: string;
  value: string | number | boolean;
  operator: "eq" | "contains" | "gt" | "lt" | "gte" | "lte" | "in";
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationState;
  success: boolean;
  error?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalAppointments: number;
  appointmentsChange: number;
  newPatients: number;
  newPatientsChange: number;
  returningPatients: number;
  returningPatientsChange: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface PatientWithRelations {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  dateOfBirth: Date | null;
  gender: string | null;
  avatar: string | null;
  tags: { id: string; name: string; color: string }[];
  _count: {
    appointments: number;
    invoices: number;
  };
  createdAt: Date;
}

export interface AppointmentWithRelations {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  color: string | null;
  notes: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string | null;
  };
  doctor: {
    id: string;
    user: {
      name: string;
      image: string | null;
    };
  };
  treatment?: {
    id: string;
    name: string;
    color: string;
  } | null;
  chair?: {
    id: string;
    name: string;
  } | null;
}

export interface InvoiceWithRelations {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date | null;
  status: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  payments: {
    id: string;
    amount: number;
    method: string;
    paidAt: Date;
  }[];
}

export interface StaffWithRelations {
  id: string;
  employeeId: string;
  specialization: string | null;
  avatar: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
  department?: {
    id: string;
    name: string;
    color: string;
  } | null;
  _count: {
    appointments: number;
    consultations: number;
  };
}
