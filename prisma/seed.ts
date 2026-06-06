import { PrismaClient } from '../generated/prisma'; // Ensure this matches your schema output path
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding...');

  // Clean the database
  // Note: If you have relations, delete them in the correct order
  // await prisma.book.deleteMany();
  const password = "admin123"

  const passwordHash = await bcrypt.hash(password, 10)

  const role = [
    {
      name: "admin"
    },
    {
      name: "user"
    },
    {
      name:"admin employee"
    },
    {
      name:"user employee"
    }
  ]

  await prisma.role.createMany({
    data: role,
    skipDuplicates: true
  })

  const users = [
    {
      email: 'admin@example.com',
      username: 'admin',
      password: passwordHash,
      roleId: 1
    },
    {
      email: 'user@example.com',
      username: 'user',
      password: passwordHash,
      roleId: 2
    },
    {
      email: 'admin employee@example.com',
      username: 'admin employee',
      password: passwordHash,
      roleId: 3
    },
    {
      email: 'user employee@example.com',
      username: 'user employee',
      password: passwordHash,
      roleId: 4
    }
  ]

  await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    })


    const request = [
      {
        references: "Aplikasi Pembuatan Surat Online (BaSO) 1.5",
        via: "NDE & Notulensi",            
        psal: "SPS",          
        department: "Sekpim & Legal",
        category: "Strategis",      
        applicationName: "RFC Aplikasi Pembuatan Surat Online (BaSO) 1.5",
        framework: "SATU",      
        version: "1.5",    
        description: "Penyesuaian Aplikasi dampak dari adanya TUNC : \n 1. Penambahan lokasi pembuatan Surat berdasarkan TUNC (Jakarta, Purwokerto, Surabaya) \n 2. Penambahan Notifikasi ke Email masing-masing stakeholder di dalam surat"    ,
        groupType: "Aplikasi",  
        serviceType: "RFC_Change_App",  
        subServiceType: "Perubahan aplikasi minor",
        priority: "HIGH",
        slaDays: 44,
        status: "PENDING"
      },
      {
        references: "API Notifikasi My TelU untuk CELOE",
        via: "NDE",            
        psal: "PSAL",          
        department: "Yan Celoe",
        category: "Strategis",      
        applicationName: "API Notifikasi My TelU untuk CELOE",
        framework: "SATU",      
        version: "1.0",    
        description: "1.	Memberikan API kirim notifikasi dari aplikasi CELOE ke Aplikasi My TelU, untuk user-user tertentu di my telU \n 2. Notifikasi dari aplikasi CELOE adalah notifikasi dari aplikasi layanan tiketing di CELOE"    ,
        groupType: "API",  
        serviceType: "Permintaan_New_API_or_Major",  
        subServiceType: "Pengembangan API kecil",
        priority: "MEDIUM",
        slaDays: 66,
        status: "APPROVED",
      },
      {
        references: "API Support untuk Aplikasi PRADA : PANDA",
        via: "NDE",            
        psal: "SPS",          
        department: "Purel",
        category: "Strategis",      
        applicationName: "API Support untuk Aplikasi PRADA : PANDA",
        framework: "SITU",      
        version: "1.0",    
        description: "1.	API SSO untuk Login dan Akses Profile dari User yang login untuk aplikasi PANDA yang dikembangkan oleh Tim PRA \n 2. API SDM dibutuhkan untuk get data pegawai dan dosen yang terdapat di dalam SOTK ke-SDM-an \n 3. API Microsoft Calendar Portal untuk melihat kalender dan event yang ada di masing-masing user."    ,
        groupType: "API",  
        serviceType: "Permintaan_New_API_or_Major",  
        subServiceType: "Pengembangan API sedang",
        priority: "LOW",
        slaDays: 99,
        status: "REJECTED"
      },
    ]

  await prisma.request.createMany({
    data: request,
    skipDuplicates: true
  })

    
    const project = [
      {
        name: "API Notifikasi My TelU untuk CELOE",
        description: "Penyesuaian Aplikasi dampak dari adanya TUNC : \n 1. Penambahan lokasi pembuatan Surat berdasarkan TUNC (Jakarta, Purwokerto, Surabaya) \n 2. Penambahan Notifikasi ke Email masing-masing stakeholder di dalam surat",
        status: "WAITING",
        requestId: 2
      },
    ]
    
    await prisma.project.createMany({
      data: project,
      skipDuplicates: true
    })
    
    
    
  
  console.log('✅ Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
