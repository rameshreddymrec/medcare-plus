import { PrismaClient, Role, AppointmentStatus, AppointmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding comprehensive database...');

  // 1. Initial Admin
  const adminEmail = 'admin@medcareplus.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Admin',
        passwordHash,
        role: Role.ADMIN,
        phoneNumber: '+919999988888',
      },
    });
    console.log('Admin user seeded: admin@medcareplus.com / admin123');
  }

  // 1.5. Initial Patient
  const patientEmail = 'patient@medcareplus.com';
  const existingPatient = await prisma.user.findUnique({ where: { email: patientEmail } });
  if (!existingPatient) {
    const passwordHash = await bcrypt.hash('patient123', 10);
    const user = await prisma.user.create({
      data: {
        email: patientEmail,
        name: 'John Patient',
        passwordHash,
        role: Role.PATIENT,
        phoneNumber: '+919876543219',
      },
    });
    await prisma.patient.create({
      data: {
        userId: user.id,
        bloodGroup: 'A+',
        walletBalance: 10000.0,
      },
    });
    console.log('Patient user seeded: patient@medcareplus.com / patient123');
  }

  // 2. Medicine Categories
  const categoriesData = [
    { name: 'Cardiology', description: 'Heart health medicines' },
    { name: 'Pediatrics', description: 'Child care health products' },
    { name: 'Antibiotics', description: 'Bacterial infection treatments' },
    { name: 'Pain Relief', description: 'Analgesics and muscle relaxants' },
    { name: 'General Wellness', description: 'Vitamins, supplements and daily wellness' },
  ];

  const categoriesMap: { [key: string]: string } = {};

  for (const cat of categoriesData) {
    const record = await prisma.medicineCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
    categoriesMap[cat.name] = record.id;
  }
  console.log('Medicine categories seeded.');

  // 3. Medicines (seeded inside categories)
  const medicinesData = [
    {
      name: 'Lipitor (Atorvastatin) 10mg',
      description: 'Used to lower cholesterol and reduce the risk of heart disease or stroke.',
      price: 185.50,
      stock: 120,
      prescriptionRequired: true,
      categoryName: 'Cardiology',
    },
    {
      name: 'Cardivas (Carvedilol) 6.25mg',
      description: 'Beta-blocker used to treat high blood pressure and heart failure.',
      price: 98.00,
      stock: 80,
      prescriptionRequired: true,
      categoryName: 'Cardiology',
    },
    {
      name: 'Concor (Bisoprolol) 5mg',
      description: 'Used to treat hypertension and chronic heart failure.',
      price: 142.00,
      stock: 100,
      prescriptionRequired: true,
      categoryName: 'Cardiology',
    },
    {
      name: 'Calpol (Paracetamol) Pediatric Suspension',
      description: 'Provides relief from mild-to-moderate pain and fever in children.',
      price: 45.00,
      stock: 150,
      prescriptionRequired: false,
      categoryName: 'Pediatrics',
    },
    {
      name: 'Crocin (Paracetamol) Drops 15ml',
      description: 'Effective analgesic and antipyretic drops for infants under 1 year.',
      price: 32.50,
      stock: 90,
      prescriptionRequired: false,
      categoryName: 'Pediatrics',
    },
    {
      name: 'Augmentin 625 Duo',
      description: 'Broad-spectrum antibiotic combining Amoxicillin and Clavulanic Acid for bacterial infections.',
      price: 223.50,
      stock: 200,
      prescriptionRequired: true,
      categoryName: 'Antibiotics',
    },
    {
      name: 'Azithral 500 (Azithromycin)',
      description: 'Macrolide antibiotic used for respiratory tract infections and throat inflammation.',
      price: 119.00,
      stock: 110,
      prescriptionRequired: true,
      categoryName: 'Antibiotics',
    },
    {
      name: 'Taxim-O 200 (Cefixime)',
      description: 'Cephalosporin antibiotic prescribed for urinary tract infections and typhoid.',
      price: 168.00,
      stock: 130,
      prescriptionRequired: true,
      categoryName: 'Antibiotics',
    },
    {
      name: 'Combiflam (Ibuprofen 400mg + Paracetamol 325mg)',
      description: 'Popular anti-inflammatory pain reliever for muscle pain, headache, and fever.',
      price: 42.00,
      stock: 300,
      prescriptionRequired: false,
      categoryName: 'Pain Relief',
    },
    {
      name: 'Zerodol-SP',
      description: 'Combines Aceclofenac, Paracetamol, and Serratiopeptidase for severe joint and muscle swelling.',
      price: 125.00,
      stock: 140,
      prescriptionRequired: true,
      categoryName: 'Pain Relief',
    },
    {
      name: 'Revital H Capsules 30s',
      description: 'Daily multivitamin health supplement with Ginseng, minerals, and vitamins for energy.',
      price: 310.00,
      stock: 75,
      prescriptionRequired: false,
      categoryName: 'General Wellness',
    },
    {
      name: 'Vicks Action 500 Extra',
      description: 'Provides quick multi-symptom relief from cold, headache, nasal congestion, and sore throat.',
      price: 52.00,
      stock: 250,
      prescriptionRequired: false,
      categoryName: 'General Wellness',
    },
  ];

  for (const med of medicinesData) {
    const categoryId = categoriesMap[med.categoryName];
    await prisma.medicine.upsert({
      where: { name: med.name },
      update: {
        description: med.description,
        price: med.price,
        stock: med.stock,
        prescriptionRequired: med.prescriptionRequired,
        categoryId,
      },
      create: {
        name: med.name,
        description: med.description,
        price: med.price,
        stock: med.stock,
        prescriptionRequired: med.prescriptionRequired,
        categoryId,
      },
    });
  }
  console.log('Medicines seeded.');

  // 4. Specialist Doctors
  const doctorsData = [
    {
      email: 'dr.kumar@medcareplus.com',
      name: 'Dr. Rajesh Kumar',
      phone: '+919876543210',
      specialization: 'Cardiology',
      experience: 16,
      hospital: 'Apollo Cardiovascular Institute, Delhi',
      fee: 800,
      bio: 'Senior consultant cardiologist with extensive expertise in interventional cardiology and preventative heart care.',
    },
    {
      email: 'dr.sharma@medcareplus.com',
      name: 'Dr. Anjali Sharma',
      phone: '+919876543211',
      specialization: 'Pediatrics',
      experience: 11,
      hospital: 'Max Super Speciality Hospital, Mumbai',
      fee: 600,
      bio: 'Dedicated pediatrician focusing on neonatology, childhood vaccinations, and child development milestones.',
    },
    {
      email: 'dr.patel@medcareplus.com',
      name: 'Dr. Amit Patel',
      phone: '+919876543212',
      specialization: 'Dermatology',
      experience: 13,
      hospital: 'Fortis Skin Care Research, Bangalore',
      fee: 700,
      bio: 'Board-certified dermatologist specializing in clinical acne treatments, eczema, and advanced skin lasers.',
    },
    {
      email: 'dr.singh@medcareplus.com',
      name: 'Dr. Vikram Singh',
      phone: '+919876543213',
      specialization: 'Orthopedics',
      experience: 9,
      hospital: 'Medanta Bone and Joint Centre, Gurgaon',
      fee: 750,
      bio: 'Expert orthopedic surgeon specializing in sports medicine, arthroscopy, and joint replacement therapy.',
    },
    {
      email: 'dr.iyer@medcareplus.com',
      name: 'Dr. Sunita Iyer',
      phone: '+919876543214',
      specialization: 'General Medicine',
      experience: 18,
      hospital: 'Manipal Health Clinic, Chennai',
      fee: 500,
      bio: 'Senior general physician offering comprehensive primary health management for chronic conditions like diabetes and hypertension.',
    },
  ];

  const doctorPasswordHash = await bcrypt.hash('doctor123', 10);

  for (const doc of doctorsData) {
    const existingUser = await prisma.user.findUnique({ where: { email: doc.email } });
    let userRecord = existingUser;

    if (!existingUser) {
      userRecord = await prisma.user.create({
        data: {
          email: doc.email,
          name: doc.name,
          passwordHash: doctorPasswordHash,
          role: Role.DOCTOR,
          phoneNumber: doc.phone,
        },
      });
    }

    if (userRecord) {
      // Upsert Doctor profile
      await prisma.doctor.upsert({
        where: { userId: userRecord.id },
        update: {
          specialization: doc.specialization,
          experienceYrs: doc.experience,
          hospitalName: doc.hospital,
          consultationFee: doc.fee,
          bio: doc.bio,
          rating: 4.8,
        },
        create: {
          userId: userRecord.id,
          specialization: doc.specialization,
          experienceYrs: doc.experience,
          hospitalName: doc.hospital,
          licenseNumber: `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          consultationFee: doc.fee,
          bio: doc.bio,
          rating: 4.8,
        },
      });
    }
  }
  console.log('Doctors seeded: passwords are all doctor123');

  // 5. Diagnostic Lab Tests
  const labTestsData = [
    {
      name: 'Complete Blood Count (CBC)',
      description: 'Comprehensive screening for anemia, infection, and general hematological health.',
      price: 299.00,
      sampleType: 'Blood',
      homeCollection: true,
    },
    {
      name: 'Lipid Profile (Cholesterol Panel)',
      description: 'Measures HDL, LDL, VLDL, and Triglycerides to assess cardiovascular risk.',
      price: 499.00,
      sampleType: 'Blood',
      homeCollection: true,
    },
    {
      name: 'Liver Function Test (LFT)',
      description: 'Analyzes bilirubin, SGOT, SGPT, and protein levels to evaluate liver health.',
      price: 599.00,
      sampleType: 'Blood',
      homeCollection: true,
    },
    {
      name: 'Kidney Function Test (KFT)',
      description: 'Checks blood urea, creatinine, and uric acid levels to examine renal filtration.',
      price: 699.00,
      sampleType: 'Blood',
      homeCollection: true,
    },
    {
      name: 'Thyroid Profile (T3, T4, TSH)',
      description: 'Screens for hyperthyroidism and hypothyroidism thyroid hormone conditions.',
      price: 449.00,
      sampleType: 'Blood',
      homeCollection: true,
    },
    {
      name: 'HbA1c (Glycated Haemoglobin)',
      description: 'Provides a 3-month average of blood glucose levels for diabetes diagnostic tracking.',
      price: 349.00,
      sampleType: 'Blood',
      homeCollection: true,
    },
    {
      name: 'Vitamin D3 and B12 Deficiency Panel',
      description: 'Essential nutrient panel checking bone density and nerve conduction indicators.',
      price: 1199.00,
      sampleType: 'Blood',
      homeCollection: true,
    },
    {
      name: 'Comprehensive Full Body Health Check',
      description: 'Include CBC, LFT, KFT, Lipids, Glucose, and Urine analysis (62 parameters).',
      price: 1999.00,
      sampleType: 'Blood/Urine',
      homeCollection: true,
    },
  ];

  for (const test of labTestsData) {
    await prisma.labTest.upsert({
      where: { name: test.name },
      update: {
        description: test.description,
        price: test.price,
        sampleType: test.sampleType,
        homeCollection: test.homeCollection,
      },
      create: test,
    });
  }
  console.log('Lab tests seeded.');

  // 6. Vaccinations
  const vaccines = [
    { name: 'BCG', description: 'Tuberculosis protection', targetAgeMonths: 0, dosageNumber: 1 },
    { name: 'Hepatitis B', description: 'Liver virus protection', targetAgeMonths: 0, dosageNumber: 1 },
    { name: 'OPV', description: 'Polio drops', targetAgeMonths: 2, dosageNumber: 1 },
    { name: 'DPT', description: 'Diphtheria, pertussis, tetanus protection', targetAgeMonths: 3, dosageNumber: 1 },
  ];

  for (const vac of vaccines) {
    await prisma.vaccination.upsert({
      where: { name: vac.name },
      update: { description: vac.description, targetAgeMonths: vac.targetAgeMonths, dosageNumber: vac.dosageNumber },
      create: vac,
    });
  }
  console.log('Vaccinations seeded.');

  // 7. FAQs
  const faqs = [
    { question: 'How do I book a doctor appointment?', answer: 'Navigate to the Doctors section, select a specialist, pick a preferred time slot, and submit the booking request.' },
    { question: 'Can I upload a hand-written prescription?', answer: 'Yes, inside the Pharmacy shop checkout flow, upload a PDF/Image of your prescription for validation.' },
    { question: 'Does MedCare+ offer home sample diagnostic collections?', answer: 'Absolutely. When booking any Lab Test, choose the Home Collection option and schedule a technician visit.' },
  ];

  for (const faq of faqs) {
    await prisma.faq.upsert({
      where: { question: faq.question },
      update: { answer: faq.answer },
      create: faq,
    });
  }
  console.log('FAQs seeded.');

  console.log('Comprehensive database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
