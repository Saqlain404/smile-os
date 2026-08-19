"use server";

import { prisma } from "@/lib/prisma";

export async function getAIInsights(clinicId?: string) {
  const clinic = clinicId
    ? await prisma.clinic.findUnique({ where: { id: clinicId } })
    : await prisma.clinic.findFirst();

  if (!clinic) return { insights: [], stats: { total: 0, unread: 0, critical: 0 } };

  const [insights, stats] = await Promise.all([
    prisma.aIInsight.findMany({
      where: { clinicId: clinic.id, isDismissed: false },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    prisma.aIInsight.aggregate({
      where: { clinicId: clinic.id, isDismissed: false },
      _count: true,
    }),
  ]);

  const unreadCount = await prisma.aIInsight.count({
    where: { clinicId: clinic.id, isDismissed: false, isRead: false },
  });

  const criticalCount = await prisma.aIInsight.count({
    where: {
      clinicId: clinic.id,
      isDismissed: false,
      severity: "CRITICAL",
    },
  });

  return {
    insights,
    stats: {
      total: stats._count,
      unread: unreadCount,
      critical: criticalCount,
    },
  };
}

export async function generateInsights(clinicId?: string) {
  const clinic = clinicId
    ? await prisma.clinic.findUnique({ where: { id: clinicId } })
    : await prisma.clinic.findFirst();

  if (!clinic) return { generated: 0 };

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalPatients,
    newPatients30d,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    appointmentsThisWeek,
    totalRevenue,
    pendingInvoices,
    overdueInvoices,
    recentConsultations,
    treatments,
  ] = await Promise.all([
    prisma.patient.count({ where: { clinicId: clinic.id } }),
    prisma.patient.count({
      where: { clinicId: clinic.id, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.appointment.count({ where: { clinicId: clinic.id } }),
    prisma.appointment.count({
      where: { clinicId: clinic.id, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: { clinicId: clinic.id, status: "CANCELLED" },
    }),
    prisma.appointment.count({
      where: { clinicId: clinic.id, status: "NO_SHOW" },
    }),
    prisma.appointment.count({
      where: { clinicId: clinic.id, date: { gte: sevenDaysAgo } },
    }),
    prisma.invoice.aggregate({
      where: { clinicId: clinic.id, status: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.count({
      where: { clinicId: clinic.id, status: "PENDING" },
    }),
    prisma.invoice.count({
      where: {
        clinicId: clinic.id,
        status: "PENDING",
        dueDate: { lt: today },
      },
    }),
    prisma.consultation.findMany({
      where: {
        patient: { clinicId: clinic.id },
        createdAt: { gte: sevenDaysAgo },
      },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.treatment.findMany({
      where: { clinicId: clinic.id, isActive: true },
    }),
  ]);

  const appointmentCompletionRate =
    totalAppointments > 0
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0;
  const noShowRate =
    totalAppointments > 0
      ? Math.round((noShowAppointments / totalAppointments) * 100)
      : 0;
  const cancelRate =
    totalAppointments > 0
      ? Math.round((cancelledAppointments / totalAppointments) * 100)
      : 0;

  const insightData: Array<{
    clinicId: string;
    type: "DIAGNOSIS" | "TREATMENT" | "RISK" | "PREDICTION" | "OPTIMIZATION" | "REVENUE";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    title: string;
    description: string;
    metadata?: Record<string, unknown>;
  }> = [];

  if (newPatients30d > 0) {
    insightData.push({
      clinicId: clinic.id,
      type: "PREDICTION",
      severity: "LOW",
      title: "Patient Growth Trend",
      description: `${newPatients30d} new patients joined in the last 30 days. At this rate, expect ${Math.round(newPatients30d * 12)} new patients annually.`,
      metadata: { newPatients30d, projectedAnnual: newPatients30d * 12 },
    });
  }

  if (noShowRate > 15) {
    insightData.push({
      clinicId: clinic.id,
      type: "RISK",
      severity: "HIGH",
      title: "High No-Show Rate Detected",
      description: `No-show rate is ${noShowRate}%, which is above the 15% threshold. Consider implementing automated reminders or overbooking strategies.`,
      metadata: { noShowRate, totalNoShows: noShowAppointments },
    });
  } else if (noShowRate > 10) {
    insightData.push({
      clinicId: clinic.id,
      type: "RISK",
      severity: "MEDIUM",
      title: "Moderate No-Show Rate",
      description: `No-show rate is ${noShowRate}%. Consider sending SMS reminders 24 hours before appointments to reduce no-shows.`,
      metadata: { noShowRate },
    });
  }

  if (cancelRate > 20) {
    insightData.push({
      clinicId: clinic.id,
      type: "RISK",
      severity: "HIGH",
      title: "High Cancellation Rate",
      description: `Cancellation rate is ${cancelRate}%. Review scheduling patterns and consider implementing a cancellation policy.`,
      metadata: { cancelRate, totalCancelled: cancelledAppointments },
    });
  }

  if (pendingInvoices > 5) {
    insightData.push({
      clinicId: clinic.id,
      type: "REVENUE",
      severity: "MEDIUM",
      title: "Pending Invoices Need Attention",
      description: `${pendingInvoices} invoices are pending. Following up on these could improve cash flow significantly.`,
      metadata: { pendingInvoices },
    });
  }

  if (overdueInvoices > 0) {
    insightData.push({
      clinicId: clinic.id,
      type: "REVENUE",
      severity: overdueInvoices > 10 ? "HIGH" : "MEDIUM",
      title: "Overdue Invoices",
      description: `${overdueInvoices} invoice(s) are past their due date. Consider sending payment reminders or offering payment plans.`,
      metadata: { overdueInvoices },
    });
  }

  if (appointmentCompletionRate > 85) {
    insightData.push({
      clinicId: clinic.id,
      type: "OPTIMIZATION",
      severity: "LOW",
      title: "Excellent Appointment Completion",
      description: `Your appointment completion rate is ${appointmentCompletionRate}%, which is excellent. Keep up the great work!`,
      metadata: { completionRate: appointmentCompletionRate },
    });
  }

  if (appointmentsThisWeek > 0) {
    const avgPerDay = Math.round(appointmentsThisWeek / 7);
    insightData.push({
      clinicId: clinic.id,
      type: "OPTIMIZATION",
      severity: "LOW",
      title: "Weekly Schedule Overview",
      description: `${appointmentsThisWeek} appointments scheduled this week (avg ${avgPerDay}/day). ${
        avgPerDay > 8
          ? "Consider adding more slots or staff capacity."
          : "Schedule looks manageable."
      }`,
      metadata: { weeklyAppointments: appointmentsThisWeek, avgPerDay },
    });
  }

  if (totalRevenue._sum.totalAmount) {
    const revenue = Number(totalRevenue._sum.totalAmount);
    insightData.push({
      clinicId: clinic.id,
      type: "REVENUE",
      severity: "LOW",
      title: "Revenue Summary",
      description: `Total collected revenue: $${revenue.toLocaleString()}. ${
        pendingInvoices > 0
          ? `There are ${pendingInvoices} pending invoices that could add to this total.`
          : "All invoices are settled."
      }`,
      metadata: { totalRevenue: revenue, pendingInvoices },
    });
  }

  if (recentConsultations.length > 0) {
    const diagnoses = recentConsultations
      .map((c) => c.diagnosis)
      .filter(Boolean);
    if (diagnoses.length > 0) {
      insightData.push({
        clinicId: clinic.id,
        type: "DIAGNOSIS",
        severity: "LOW",
        title: "Recent Diagnosis Patterns",
        description: `This week's consultations include: ${diagnoses.slice(0, 3).join(", ")}. ${
          diagnoses.length > 3 ? `And ${diagnoses.length - 3} more.` : ""
        } Consider reviewing treatment protocols for these conditions.`,
        metadata: { diagnoses, count: diagnoses.length },
      });
    }
  }

  if (treatments.length > 0) {
    const avgPrice =
      treatments.reduce((sum, t) => sum + Number(t.price), 0) /
      treatments.length;
    insightData.push({
      clinicId: clinic.id,
      type: "TREATMENT",
      severity: "LOW",
      title: "Treatment Portfolio Analysis",
      description: `You offer ${treatments.length} active treatments with an average price of $${Math.round(avgPrice)}. ${
        treatments.length < 5
          ? "Consider expanding your treatment offerings."
          : "Good treatment variety for comprehensive care."
      }`,
      metadata: {
        treatmentCount: treatments.length,
        avgPrice: Math.round(avgPrice),
      },
    });
  }

  // Clear old insights and insert new ones
  await prisma.aIInsight.deleteMany({
    where: { clinicId: clinic.id },
  });

  if (insightData.length > 0) {
    await prisma.aIInsight.createMany({
      data: insightData.map((d) => ({
        ...d,
        metadata: d.metadata ? JSON.parse(JSON.stringify(d.metadata)) : undefined,
      })),
    });
  }

  return { generated: insightData.length };
}

export async function markInsightRead(id: string) {
  return prisma.aIInsight.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function dismissInsight(id: string) {
  return prisma.aIInsight.update({
    where: { id },
    data: { isDismissed: true },
  });
}

export async function getAIDiagnosisSuggestions(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      consultationHistory: {
        orderBy: { date: "desc" },
        take: 10,
      },
      prescriptions: {
        orderBy: { date: "desc" },
        take: 5,
        include: { items: true },
      },
      appointments: {
        orderBy: { date: "desc" },
        take: 20,
        include: { treatment: true },
      },
      medicalRecords: true,
    },
  });

  if (!patient) return null;

  const suggestions: Array<{
    category: string;
    title: string;
    description: string;
    confidence: number;
    priority: "low" | "medium" | "high";
  }> = [];

  if (patient.allergies) {
    suggestions.push({
      category: "Safety Alert",
      title: "Allergy Consideration",
      description: `Patient has recorded allergies: ${patient.allergies}. Ensure all prescribed medications and treatment materials are cross-referenced.`,
      confidence: 0.99,
      priority: "high",
    });
  }

  if (patient.medicalHistory) {
    const history = patient.medicalHistory.toLowerCase();
    if (history.includes("diabetes")) {
      suggestions.push({
        category: "Medical Consideration",
        title: "Diabetes Management",
        description:
          "Patient has diabetes. May require modified treatment plans, extended healing time, and antibiotic prophylaxis for invasive procedures.",
        confidence: 0.95,
        priority: "high",
      });
    }
    if (history.includes("heart") || history.includes("cardiac")) {
      suggestions.push({
        category: "Medical Consideration",
        title: "Cardiac History",
        description:
          "Patient has cardiac history. Consider antibiotic prophylaxis before invasive dental procedures. Monitor stress levels during treatment.",
        confidence: 0.93,
        priority: "high",
      });
    }
  }

  if (patient.dentalHistory) {
    const dental = patient.dentalHistory.toLowerCase();
    if (dental.includes("gum") || dental.includes("periodontal")) {
      suggestions.push({
        category: "Dental History",
        title: "Periodontal Concern",
        description:
          "Patient has a history of gum disease. Recommend regular periodontal maintenance every 3-4 months.",
        confidence: 0.85,
        priority: "medium",
      });
    }
  }

  if (patient.appointments.length > 3) {
    const statuses = patient.appointments.map((a) => a.status);
    const cancelled = statuses.filter((s) => s === "CANCELLED").length;
    const noShow = statuses.filter((s) => s === "NO_SHOW").length;
    if (cancelled + noShow > 2) {
      suggestions.push({
        category: "Behavioral",
        title: "Attendance Pattern",
        description: `Patient has ${cancelled} cancellations and ${noShow} no-shows out of ${patient.appointments.length} appointments. Consider implementing reminder calls or requiring confirmation.`,
        confidence: 0.8,
        priority: "medium",
      });
    }
  }

  if (patient.prescriptions.length > 0) {
    const recentMeds = patient.prescriptions[0]?.items.map(
      (i) => i.medication
    );
    if (recentMeds && recentMeds.length > 0) {
      suggestions.push({
        category: "Medication Review",
        title: "Current Medications",
        description: `Patient is currently on: ${recentMeds.join(", ")}. Check for drug interactions with any new prescriptions.`,
        confidence: 0.9,
        priority: "medium",
      });
    }
  }

  const age = patient.dateOfBirth
    ? Math.floor(
        (Date.now() -
          new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  if (age && age > 60) {
    suggestions.push({
      category: "Preventive Care",
      title: "Age-Related Considerations",
      description:
        "Patient is over 60. Consider screening for oral cancer, checking for dry mouth medications side effects, and evaluating bone density for implant planning.",
      confidence: 0.7,
      priority: "low",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      category: "General",
      title: "Routine Checkup Recommended",
      description:
        "No significant risk factors detected. Continue with regular 6-month checkups and cleanings.",
      confidence: 0.6,
      priority: "low",
    });
  }

  return {
    patient: {
      name: `${patient.firstName} ${patient.lastName}`,
      age,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
    },
    suggestions,
  };
}

export async function getAITreatmentPlan(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      consultationHistory: { orderBy: { date: "desc" }, take: 5 },
      appointments: {
        orderBy: { date: "desc" },
        take: 10,
        include: { treatment: true },
      },
      prescriptions: {
        orderBy: { date: "desc" },
        take: 3,
        include: { items: true },
      },
    },
  });

  if (!patient) return null;

  const clinic = await prisma.clinic.findFirst();
  const treatments = clinic
    ? await prisma.treatment.findMany({
        where: { clinicId: clinic.id, isActive: true },
      })
    : [];

  const recentDiagnoses = patient.consultationHistory
    .map((c) => c.diagnosis)
    .filter(Boolean);
  const recentTreatments = patient.appointments
    .map((a) => a.treatment?.name)
    .filter(Boolean);

  const recommendations: Array<{
    treatment: string;
    reason: string;
    estimatedCost: number;
    estimatedDuration: number;
    urgency: "routine" | "soon" | "urgent";
    phase: number;
  }> = [];

  if (recentDiagnoses.some((d) => d?.toLowerCase().includes("cavity"))) {
    const filling = treatments.find((t) =>
      t.name.toLowerCase().includes("filling")
    );
    if (filling) {
      recommendations.push({
        treatment: filling.name,
        reason: "Treatment for detected cavity",
        estimatedCost: Number(filling.price),
        estimatedDuration: filling.duration,
        urgency: "soon",
        phase: 1,
      });
    }
  }

  if (recentDiagnoses.some((d) => d?.toLowerCase().includes("root canal"))) {
    const rootCanal = treatments.find((t) =>
      t.name.toLowerCase().includes("root canal")
    );
    if (rootCanal) {
      recommendations.push({
        treatment: rootCanal.name,
        reason: "Root canal therapy for infected tooth",
        estimatedCost: Number(rootCanal.price),
        estimatedDuration: rootCanal.duration,
        urgency: "urgent",
        phase: 1,
      });
    }
  }

  const hasCheckup = recentTreatments.some((t) =>
    t?.toLowerCase().includes("checkup")
  );
  if (!hasCheckup) {
    const checkup = treatments.find((t) =>
      t.name.toLowerCase().includes("checkup")
    );
    if (checkup) {
      recommendations.push({
        treatment: checkup.name,
        reason: "Regular dental checkup (overdue)",
        estimatedCost: Number(checkup.price),
        estimatedDuration: checkup.duration,
        urgency: "soon",
        phase: 0,
      });
    }
  }

  const hasCleaning = recentTreatments.some((t) =>
    t?.toLowerCase().includes("cleaning")
  );
  if (!hasCleaning) {
    const cleaning = treatments.find((t) =>
      t.name.toLowerCase().includes("cleaning")
    );
    if (cleaning) {
      recommendations.push({
        treatment: cleaning.name,
        reason: "Professional dental cleaning (recommended every 6 months)",
        estimatedCost: Number(cleaning.price),
        estimatedDuration: cleaning.duration,
        urgency: "routine",
        phase: 0,
      });
    }
  }

  if (recommendations.length === 0) {
    const checkup = treatments.find((t) =>
      t.name.toLowerCase().includes("checkup")
    );
    if (checkup) {
      recommendations.push({
        treatment: checkup.name,
        reason: "Routine maintenance - no urgent issues detected",
        estimatedCost: Number(checkup.price),
        estimatedDuration: checkup.duration,
        urgency: "routine",
        phase: 0,
      });
    }
  }

  const totalCost = recommendations.reduce(
    (sum, r) => sum + r.estimatedCost,
    0
  );
  const totalDuration = recommendations.reduce(
    (sum, r) => sum + r.estimatedDuration,
    0
  );

  return {
    patient: {
      name: `${patient.firstName} ${patient.lastName}`,
      diagnoses: recentDiagnoses,
    },
    recommendations,
    summary: {
      totalProcedures: recommendations.length,
      totalEstimatedCost: totalCost,
      totalEstimatedDuration: totalDuration,
      urgencyBreakdown: {
        urgent: recommendations.filter((r) => r.urgency === "urgent").length,
        soon: recommendations.filter((r) => r.urgency === "soon").length,
        routine: recommendations.filter((r) => r.urgency === "routine").length,
      },
    },
  };
}

export async function getAIScheduleOptimization(clinicId?: string) {
  const clinic = clinicId
    ? await prisma.clinic.findUnique({ where: { id: clinicId } })
    : await prisma.clinic.findFirst();

  if (!clinic) return null;

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  const [
    upcomingAppointments,
    recentAppointments,
    doctors,
    chairs,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        clinicId: clinic.id,
        date: { gte: today, lte: nextWeek },
      },
      include: { doctor: { include: { user: true } }, chair: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.appointment.findMany({
      where: {
        clinicId: clinic.id,
        date: { gte: lastMonth, lt: today },
        status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] },
      },
      include: { doctor: { include: { user: true } } },
    }),
    prisma.staff.findMany({
      where: { isActive: true, departmentId: { not: null } },
      include: { user: true, department: true },
    }),
    prisma.chair.findMany({
      where: { clinicId: clinic.id, isActive: true },
    }),
  ]);

  // Calculate peak hours from historical data
  const hourDistribution: Record<string, number> = {};
  recentAppointments.forEach((apt) => {
    const hour = apt.startTime.split(":")[0];
    hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
    }));

  // Doctor utilization
  const doctorUtilization = doctors.map((doc) => {
    const docAppointments = upcomingAppointments.filter(
      (a) => a.doctorId === doc.id
    );
    return {
      name: doc.user.name,
      specialization: doc.specialization,
      upcomingCount: docAppointments.length,
      utilization:
        chairs.length > 0
          ? Math.round((docAppointments.length / (chairs.length * 8)) * 100)
          : 0,
    };
  });

  // Chair utilization for the upcoming week
  const chairUtilization = chairs.map((chair) => {
    const chairAppointments = upcomingAppointments.filter(
      (a) => a.chairId === chair.id
    );
    return {
      name: chair.name,
      color: chair.color,
      upcomingCount: chairAppointments.length,
    };
  });

  // Identify gaps
  const dailyDistribution: Record<string, number> = {};
  upcomingAppointments.forEach((apt) => {
    const date = new Date(apt.date).toISOString().split("T")[0];
    dailyDistribution[date] = (dailyDistribution[date] || 0) + 1;
  });

  const lowDays = Object.entries(dailyDistribution)
    .filter(([, count]) => count < 3)
    .map(([date, count]) => ({ date, appointments: count }));

  return {
    summary: {
      upcomingTotal: upcomingAppointments.length,
      doctorCount: doctors.length,
      chairCount: chairs.length,
    },
    peakHours,
    doctorUtilization,
    chairUtilization,
    recommendations: [
      ...lowDays.map((d) => ({
        type: "low_bookings" as const,
        message: `${d.date} has only ${d.appointments} appointments. Consider running promotions or reaching out to patients with overdue checkups.`,
      })),
      ...doctorUtilization
        .filter((d) => d.utilization > 80)
        .map((d) => ({
          type: "overbooked" as const,
          message: `Dr. ${d.name} is at ${d.utilization}% utilization. Consider redistributing appointments or adding availability.`,
        })),
      ...doctorUtilization
        .filter((d) => d.utilization < 20 && d.upcomingCount > 0)
        .map((d) => ({
          type: "underutilized" as const,
          message: `Dr. ${d.name} has low utilization (${d.utilization}%). Consider reassigning patients or adjusting schedules.`,
        })),
    ],
  };
}

export async function createAIConversation(userId: string, title?: string) {
  return prisma.aIConversation.create({
    data: { userId, title: title || "New Conversation" },
  });
}

export async function getAIConversations(userId: string) {
  return prisma.aIConversation.findMany({
    where: { userId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAIConversation(conversationId: string) {
  return prisma.aIConversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function sendAIMessage(
  conversationId: string,
  content: string
) {
  const userMessage = await prisma.aIMessage.create({
    data: {
      conversationId,
      role: "user",
      content,
    },
  });

  const response = await generateAIResponse(content);

  const assistantMessage = await prisma.aIMessage.create({
    data: {
      conversationId,
      role: "assistant",
      content: response,
    },
  });

  await prisma.aIConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return { userMessage, assistantMessage };
}

async function generateAIResponse(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase();

  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return "I'm unable to access clinic data right now. Please try again later.";

  if (lower.includes("patient") && (lower.includes("count") || lower.includes("how many"))) {
    const count = await prisma.patient.count({ where: { clinicId: clinic.id } });
    return `Your clinic currently has **${count} registered patients**. ${
      count > 100
        ? "That's a great patient base! Focus on retention and reactivation campaigns."
        : count > 50
          ? "Good growth! Consider patient referral programs to accelerate growth."
          : "There's room for growth. Consider marketing campaigns and community outreach."
    }`;
  }

  if (lower.includes("revenue") || lower.includes("income") || lower.includes("money")) {
    const revenue = await prisma.invoice.aggregate({
      where: { clinicId: clinic.id, status: "PAID" },
      _sum: { totalAmount: true },
    });
    const pending = await prisma.invoice.aggregate({
      where: { clinicId: clinic.id, status: "PENDING" },
      _sum: { totalAmount: true },
    });
    return `**Revenue Summary:**\n- Collected: **$${Number(revenue._sum.totalAmount || 0).toLocaleString()}**\n- Pending: **$${Number(pending._sum.totalAmount || 0).toLocaleString()}**\n\n${
      Number(pending._sum.totalAmount || 0) > 0
        ? "I recommend following up on pending invoices to improve cash flow."
        : "All invoices are settled. Great job managing receivables!"
    }`;
  }

  if (lower.includes("appointment") && (lower.includes("today") || lower.includes("schedule"))) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointments = await prisma.appointment.findMany({
      where: { clinicId: clinic.id, date: { gte: today, lt: tomorrow } },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { startTime: "asc" },
    });
    if (appointments.length === 0) return "No appointments scheduled for today.";
    return `**Today's Schedule (${appointments.length} appointments):**\n${appointments.map((a, i) => `${i + 1}. **${a.startTime}** - ${a.patient.firstName} ${a.patient.lastName} with Dr. ${a.doctor.user.name} (${a.status})`).join("\n")}`;
  }

  if (lower.includes("no-show") || lower.includes("no show")) {
    const noShows = await prisma.appointment.count({
      where: { clinicId: clinic.id, status: "NO_SHOW" },
    });
    const total = await prisma.appointment.count({
      where: { clinicId: clinic.id },
    });
    const rate = total > 0 ? Math.round((noShows / total) * 100) : 0;
    return `**No-Show Analysis:**\n- Total no-shows: **${noShows}**\n- No-show rate: **${rate}%**\n\n${
      rate > 15
        ? "This is above the recommended threshold of 15%. I suggest implementing automated reminders 24 hours before appointments."
        : rate > 10
          ? "This is moderate. Consider adding SMS reminders to reduce no-shows further."
          : "Your no-show rate is within a healthy range. Keep up the good work!"
    }`;
  }

  if (lower.includes("treatment") || lower.includes("procedure")) {
    const treatments = await prisma.treatment.findMany({
      where: { clinicId: clinic.id, isActive: true },
      orderBy: { price: "desc" },
    });
    return `**Available Treatments (${treatments.length}):**\n${treatments.map((t) => `- **${t.name}** - $${Number(t.price)} (${t.duration} min)`).join("\n")}\n\nWould you like me to analyze which treatments are most popular or suggest new ones to add?`;
  }

  if (lower.includes("help") || lower.includes("what can you do")) {
    return `I'm your **AI Practice Assistant**. Here's what I can help with:\n\n📊 **Analytics** - Ask about patients, revenue, appointments, or no-shows\n📅 **Schedule** - Check today's appointments or weekly overview\n🦷 **Treatments** - View and analyze treatment offerings\n💡 **Insights** - Get AI-powered recommendations for your practice\n🔍 **Patient Info** - Look up patient counts and trends\n\nJust ask me anything about your dental practice!`;
  }

  const patientCount = await prisma.patient.count({ where: { clinicId: clinic.id } });
  const appointmentCount = await prisma.appointment.count({
    where: { clinicId: clinic.id },
  });

  return `I understand you're asking about "${userMessage}". Here's what I can tell you:\n\n📊 **Quick Stats:**\n- ${patientCount} patients registered\n- ${appointmentCount} total appointments\n\nCould you be more specific? Try asking about:\n- "How many patients do we have?"\n- "What's our revenue?"\n- "Show me today's schedule"\n- "What's our no-show rate?"\n- "List our treatments"`;
}

export async function getAIGlobalStats(clinicId?: string) {
  const clinic = clinicId
    ? await prisma.clinic.findUnique({ where: { id: clinicId } })
    : await prisma.clinic.findFirst();

  if (!clinic) return null;

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [
    totalPatients,
    newPatientsThisMonth,
    totalAppointments,
    completedThisMonth,
    cancelledThisMonth,
    noShowThisMonth,
    totalRevenue,
    revenueThisMonth,
    pendingAmount,
    conversations,
  ] = await Promise.all([
    prisma.patient.count({ where: { clinicId: clinic.id } }),
    prisma.patient.count({
      where: { clinicId: clinic.id, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.appointment.count({ where: { clinicId: clinic.id } }),
    prisma.appointment.count({
      where: { clinicId: clinic.id, status: "COMPLETED", date: { gte: lastMonth } },
    }),
    prisma.appointment.count({
      where: { clinicId: clinic.id, status: "CANCELLED", date: { gte: lastMonth } },
    }),
    prisma.appointment.count({
      where: { clinicId: clinic.id, status: "NO_SHOW", date: { gte: lastMonth } },
    }),
    prisma.invoice.aggregate({
      where: { clinicId: clinic.id, status: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        clinicId: clinic.id,
        status: "PAID",
        createdAt: { gte: lastMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: { clinicId: clinic.id, status: "PENDING" },
      _sum: { totalAmount: true },
    }),
    prisma.aIConversation.count(),
  ]);

  const monthAppointments = completedThisMonth + cancelledThisMonth + noShowThisMonth;
  const aiInsights = await prisma.aIInsight.count({
    where: { clinicId: clinic.id, isDismissed: false },
  });

  return {
    patients: {
      total: totalPatients,
      newThisMonth: newPatientsThisMonth,
    },
    appointments: {
      total: totalAppointments,
      thisMonth: {
        completed: completedThisMonth,
        cancelled: cancelledThisMonth,
        noShow: noShowThisMonth,
        completionRate:
          monthAppointments > 0
            ? Math.round((completedThisMonth / monthAppointments) * 100)
            : 0,
      },
    },
    revenue: {
      total: Number(totalRevenue._sum.totalAmount || 0),
      thisMonth: Number(revenueThisMonth._sum.totalAmount || 0),
      pending: Number(pendingAmount._sum.totalAmount || 0),
    },
    ai: {
      insights: aiInsights,
      conversations,
    },
  };
}
