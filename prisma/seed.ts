import { PrismaClient } from "../src/generated/prisma";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Seeding database...");

  // Create clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: "SmileOS Dental Clinic",
      slug: "smileos-dental",
      email: "info@smileos.com",
      phone: "+1 (555) 123-4567",
      website: "https://smileos.com",
      address: "123 Dental Ave",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      timezone: "America/New_York",
      currency: "USD",
      taxRate: 8.5,
    },
  });

  console.log(`Created clinic: ${clinic.name}`);

  // Create clinic settings
  await prisma.clinicSettings.create({
    data: {
      clinicId: clinic.id,
      slotDuration: 30,
      workingDays: "monday,tuesday,wednesday,thursday,friday",
      openingTime: "09:00",
      closingTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      allowOnlineBooking: true,
      autoReminder: true,
      reminderHours: 24,
      emailEnabled: true,
    },
  });

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        clinicId: clinic.id,
        name: "General Dentistry",
        color: "#3B82F6",
      },
    }),
    prisma.department.create({
      data: {
        clinicId: clinic.id,
        name: "Orthodontics",
        color: "#8B5CF6",
      },
    }),
    prisma.department.create({
      data: {
        clinicId: clinic.id,
        name: "Oral Surgery",
        color: "#EF4444",
      },
    }),
    prisma.department.create({
      data: {
        clinicId: clinic.id,
        name: "Pediatric Dentistry",
        color: "#10B981",
      },
    }),
  ]);

  console.log(`Created ${departments.length} departments`);

  // Create admin user
  const hashedPassword = await hashPassword("password123");
  const adminUser = await prisma.user.create({
    data: {
      name: "Dr. Admin",
      email: "admin@smileos.com",
      emailVerified: true,
      role: "ADMIN",
      accounts: {
        create: [{
          accountId: "admin@smileos.com",
          providerId: "credential",
          password: hashedPassword,
        }],
      },
    },
  });

  // Create admin staff profile
  await prisma.staff.create({
    data: {
      userId: adminUser.id,
      departmentId: departments[0].id,
      employeeId: "EMP001",
      specialization: "General Dentistry",
      licenseNumber: "DEN-001",
      isActive: true,
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // Create dentist users
  const dentistData = [
    { name: "Dr. Sarah Smith", email: "sarah@smileos.com", specialization: "General Dentistry", deptIndex: 0 },
    { name: "Dr. James Wilson", email: "james@smileos.com", specialization: "Orthodontics", deptIndex: 1 },
    { name: "Dr. Emily Lee", email: "emily@smileos.com", specialization: "Oral Surgery", deptIndex: 2 },
  ];

  for (let i = 0; i < dentistData.length; i++) {
    const d = dentistData[i];
    const password = await hashPassword("password123");
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        emailVerified: true,
        role: "DENTIST",
        accounts: {
          create: [{
            accountId: d.email,
            providerId: "credential",
            password: password,
          }],
        },
      },
    });

    await prisma.staff.create({
      data: {
        userId: user.id,
        departmentId: departments[d.deptIndex].id,
        employeeId: `EMP00${i + 2}`,
        specialization: d.specialization,
        licenseNumber: `DEN-00${i + 2}`,
        isActive: true,
      },
    });

    console.log(`Created dentist: ${d.name}`);
  }

  // Create receptionist
  const receptionistPassword = await hashPassword("password123");
  const receptionistUser = await prisma.user.create({
    data: {
      name: "Anna Reception",
      email: "anna@smileos.com",
      emailVerified: true,
      role: "RECEPTIONIST",
      accounts: {
        create: [{
          accountId: "anna@smileos.com",
          providerId: "credential",
          password: receptionistPassword,
        }],
      },
    },
  });

  await prisma.staff.create({
    data: {
      userId: receptionistUser.id,
      employeeId: "EMP005",
      isActive: true,
    },
  });

  console.log("Created receptionist: Anna Reception");

  // Create treatments
  const treatments = await Promise.all([
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "General Checkup",
        description: "Routine dental examination and cleaning",
        duration: 30,
        price: 150,
        cost: 30,
        color: "#3B82F6",
      },
    }),
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "Teeth Cleaning",
        description: "Professional dental cleaning and polishing",
        duration: 45,
        price: 120,
        cost: 20,
        color: "#10B981",
      },
    }),
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "Dental Filling",
        description: "Composite or amalgam filling for cavities",
        duration: 45,
        price: 250,
        cost: 50,
        color: "#F59E0B",
      },
    }),
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "Dental Crown",
        description: "Custom dental crown placement",
        duration: 60,
        price: 1200,
        cost: 200,
        color: "#8B5CF6",
      },
    }),
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "Root Canal",
        description: "Root canal therapy",
        duration: 90,
        price: 900,
        cost: 150,
        color: "#EF4444",
      },
    }),
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "Teeth Whitening",
        description: "Professional teeth whitening treatment",
        duration: 60,
        price: 500,
        cost: 80,
        color: "#EC4899",
      },
    }),
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "Dental Implant",
        description: "Single tooth implant placement",
        duration: 120,
        price: 3000,
        cost: 500,
        color: "#6366F1",
      },
    }),
    prisma.treatment.create({
      data: {
        clinicId: clinic.id,
        name: "Orthodontic Consultation",
        description: "Initial orthodontic assessment",
        duration: 30,
        price: 200,
        cost: 40,
        color: "#06B6D4",
      },
    }),
  ]);

  console.log(`Created ${treatments.length} treatments`);

  // Create chairs
  const chairs = await Promise.all([
    prisma.chair.create({ data: { clinicId: clinic.id, name: "Chair 1", color: "#10B981" } }),
    prisma.chair.create({ data: { clinicId: clinic.id, name: "Chair 2", color: "#3B82F6" } }),
    prisma.chair.create({ data: { clinicId: clinic.id, name: "Chair 3", color: "#8B5CF6" } }),
    prisma.chair.create({ data: { clinicId: clinic.id, name: "Chair 4", color: "#F59E0B" } }),
  ]);

  console.log(`Created ${chairs.length} chairs`);

  // Create sample patients
  const patientData = [
    { firstName: "Sarah", lastName: "Johnson", email: "sarah.j@email.com", phone: "+15551001", gender: "FEMALE" as const },
    { firstName: "Mike", lastName: "Chen", email: "mike.c@email.com", phone: "+15551002", gender: "MALE" as const },
    { firstName: "Emma", lastName: "Davis", email: "emma.d@email.com", phone: "+15551003", gender: "FEMALE" as const },
    { firstName: "James", lastName: "Wilson", email: "james.w@email.com", phone: "+15551004", gender: "MALE" as const },
    { firstName: "Lisa", lastName: "Brown", email: "lisa.b@email.com", phone: "+15551005", gender: "FEMALE" as const },
    { firstName: "Tom", lastName: "Anderson", email: "tom.a@email.com", phone: "+15551006", gender: "MALE" as const },
    { firstName: "Rachel", lastName: "Taylor", email: "rachel.t@email.com", phone: "+15551007", gender: "FEMALE" as const },
    { firstName: "David", lastName: "Martinez", email: "david.m@email.com", phone: "+15551008", gender: "MALE" as const },
  ];

  const patients = [];
  for (const p of patientData) {
    const patient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        gender: p.gender,
        dateOfBirth: new Date("1990-01-01"),
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
      },
    });
    patients.push(patient);
  }

  console.log(`Created ${patients.length} patients`);

  // Create sample reviews
  const reviewData = [
    { name: "Sarah J.", rating: 5, comment: "Excellent service and very professional staff!" },
    { name: "Mike C.", rating: 5, comment: "Best dental experience I've ever had." },
    { name: "Emma D.", rating: 4, comment: "Great clinic, modern equipment." },
    { name: "James W.", rating: 5, comment: "Highly recommend this clinic." },
    { name: "Lisa B.", rating: 4, comment: "Friendly staff and quick service." },
  ];

  for (const r of reviewData) {
    await prisma.review.create({
      data: {
        clinicId: clinic.id,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        source: "google",
      },
    });
  }

  console.log(`Created ${reviewData.length} reviews`);

  // Get all staff
  const staffList = await prisma.staff.findMany();
  const doctors = staffList.filter((s) => {
    const user = dentistData.find((d) => d.email === "admin@smileos.com");
    return s.employeeId !== "EMP005"; // exclude receptionist
  });

  // Create sample appointments
  const today = new Date();
  const appointmentData = [];

  for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);

    const numAppointments = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < numAppointments; i++) {
      const hour = 9 + Math.floor(Math.random() * 7);
      const minute = i % 2 === 0 ? "00" : "30";
      const startTime = `${hour.toString().padStart(2, "0")}:${minute}`;
      const endHour = minute === "00" ? hour : hour + 1;
      const endMinute = minute === "00" ? "30" : "00";
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute}`;

      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = staffList[Math.floor(Math.random() * (staffList.length - 1))];
      const treatment = treatments[Math.floor(Math.random() * treatments.length)];
      const chair = chairs[Math.floor(Math.random() * chairs.length)];

      const statusOptions = ["BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
      const status = dayOffset < 0
        ? statusOptions[Math.floor(Math.random() * 3)] // Past: completed/booked/confirmed
        : dayOffset === 0
          ? ["BOOKED", "CONFIRMED", "IN_PROGRESS"][Math.floor(Math.random() * 3)]
          : "BOOKED"; // Future: all booked

      appointmentData.push({
        clinicId: clinic.id,
        patientId: patient.id,
        doctorId: doctor.id,
        treatmentId: treatment.id,
        chairId: chair.id,
        title: `${patient.firstName} ${patient.lastName} - ${treatment.name}`,
        date: date,
        startTime,
        endTime,
        duration: 30,
        status: status as "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "IN_PROGRESS",
      });
    }
  }

  for (const apt of appointmentData) {
    await prisma.appointment.create({ data: apt });
  }

  console.log(`Created ${appointmentData.length} appointments`);

  // Create sample invoices
  for (let i = 0; i < 5; i++) {
    const patient = patients[i % patients.length];
    const treatment = treatments[i % treatments.length];
    const subtotal = Number(treatment.price);
    const taxAmount = subtotal * 0.085;
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        invoiceNumber: `INV-${String(1001 + i).padStart(5, "0")}`,
        date: new Date(),
        status: i < 3 ? "PAID" : "PENDING",
        subtotal,
        taxAmount,
        totalAmount: total,
        items: {
          create: {
            description: treatment.name,
            quantity: 1,
            unitPrice: treatment.price,
            total: treatment.price,
          },
        },
      },
    });

    if (i < 3) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: total,
          method: i === 0 ? "CASH" : i === 1 ? "CARD" : "ONLINE",
          status: "PAID",
          paidAt: new Date(),
        },
      });
    }
  }

  console.log("Created 5 invoices");

  // Create blog posts
  await Promise.all([
    prisma.blogPost.create({
      data: {
        clinicId: clinic.id,
        title: "5 Tips for Better Oral Hygiene",
        slug: "5-tips-for-better-oral-hygiene",
        excerpt: "Maintaining good oral hygiene is essential for overall health.",
        content: "Maintaining good oral hygiene is essential for overall health...",
        published: true,
        publishedAt: new Date(),
        author: "Dr. Sarah Smith",
      },
    }),
    prisma.blogPost.create({
      data: {
        clinicId: clinic.id,
        title: "When Should You Visit the Dentist?",
        slug: "when-should-you-visit-the-dentist",
        excerpt: "Regular dental visits are important for preventing problems.",
        content: "Regular dental visits are important for preventing problems...",
        published: true,
        publishedAt: new Date(),
        author: "Dr. James Wilson",
      },
    }),
  ]);

  console.log("Created 2 blog posts");

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin:       admin@smileos.com / password123");
  console.log("   Dentist:     sarah@smileos.com / password123");
  console.log("   Receptionist: anna@smileos.com / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
