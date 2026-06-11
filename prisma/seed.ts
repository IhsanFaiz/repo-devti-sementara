import { PrismaClient } from '../generated/prisma'; // Ensure this matches your schema output path
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
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
    
    
    
  
    
  console.log('🌱 Clearing existing Employees...');
  await prisma.employee.deleteMany();

  console.log('🌱 Seeding Employees from CSVs...');

  async function seedEmployees(csvFilename: string) {
    const csvPath = path.join(__dirname, '../', csvFilename);
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️ Employee CSV not found at:', csvPath);
      return;
    }
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return;
    
    const headers = lines[0].split(';').map(h => h.trim());
    const nameIdx = headers.indexOf('Nama Lengkap');
    const posLamaIdx = headers.indexOf('Posisi SOTK Lama');
    const posBaruIdx = headers.indexOf('Posisi SOTK Baru');
    const tglMulaiIdx = headers.indexOf('Tanggal Mulai Bekerja');
    const statusIdx = headers.indexOf('Status Kepegawaian');
    const ketIdx = headers.indexOf('Keterangan');
    const jobDescIdx = headers.indexOf('Job Desc');
    const nipIdx = headers.indexOf('NIP');
    const tglKetIdx = headers.findIndex(h => h.toLowerCase().includes('tanggal keterangan'));

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(';');
      if (parts.length > nameIdx) {
        const fullName = parts[nameIdx]?.trim() || '';
        if (!fullName || fullName === '-') continue;

        const firstSpaceIndex = fullName.indexOf(' ');
        let firstName = fullName;
        let lastName = '';
        if (firstSpaceIndex !== -1) {
          firstName = fullName.substring(0, firstSpaceIndex);
          lastName = fullName.substring(firstSpaceIndex + 1);
        }

        const rawDate = parts[tglMulaiIdx]?.trim() || '';
        let startWorking = new Date();
        if (rawDate && rawDate !== '-') {
          const dateParts = rawDate.split('-');
          if (dateParts.length === 3) {
            const day = dateParts[0].padStart(2, '0');
            const monthMap: Record<string, string> = {
              'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'Mei': '05', 'Jun': '06',
              'Jul': '07', 'Agu': '08', 'Sep': '09', 'Okt': '10', 'Nov': '11', 'Des': '12'
            };
            const monthStr = dateParts[1];
            const month = monthMap[monthStr] || '01';
            let year = parseInt(dateParts[2]);
            if (year < 100) year += 2000;
            startWorking = new Date(`${year}-${month}-${day}T00:00:00Z`);
          }
        }

        const keterangan = parts[ketIdx]?.trim();
        const statusKepegawaian = parts[statusIdx]?.trim() || 'Pegawai';
        const previousPosition = parts[posLamaIdx]?.trim();
        const currentPosition = parts[posBaruIdx]?.trim();
        const jobDesc = jobDescIdx !== -1 ? parts[jobDescIdx]?.trim() : null;
        const nip = nipIdx !== -1 ? parts[nipIdx]?.trim() : null;
        const keteranganDate = tglKetIdx !== -1 ? parts[tglKetIdx]?.trim() : null;

        await prisma.employee.create({
          data: {
            firstName,
            lastName,
            startWorking,
            status: (keterangan && keterangan !== '-' && keterangan !== '') ? keterangan : 'Aktif',
            previousPosition: previousPosition === '-' || previousPosition === '' ? null : previousPosition,
            currentPosition: currentPosition === '-' || currentPosition === '' ? null : currentPosition,
            employeeType: statusKepegawaian,
            jobDesc: jobDesc === '-' || jobDesc === '' ? null : jobDesc,
            nip: nip === '-' || nip === '' ? null : nip,
            keteranganDate: keteranganDate === '-' || keteranganDate === '' ? null : keteranganDate
          }
        });
      }
    }
    console.log(`✅ Seeded: ${csvFilename}`);
  }

  await seedEmployees('src/components/table/Data Kepegawaian DevTI(Tenaga Lepas Harian).csv');
  await seedEmployees('Data Kepegawaian DevTI(Profesional).csv');
  await seedEmployees('Data Kepegawaian DevTI(Pegawai Tetap) (1).csv');
  await seedEmployees('Data Kepegawaian DevTI(Magang Akademik).csv');

  
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
