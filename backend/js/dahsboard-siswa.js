const cameraIcon = document.getElementById('camera-icon');
const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const uploadForm = document.getElementById('upload-form');
const fileUploadInput = document.getElementById('file-upload');

// fungsi untuk mengambil data sesi
async function fetchSessionData() {
    try {
        const response = await fetch('/api/session-siswa');
        if (!response.ok) {
            throw new Error('Tidak dapat mengambil data sesi.');
        }

        const user = await response.json();
        console.log('User data:', user);
        console.log('Nama pengguna:', user.name); 

        const nameHeader = document.getElementById('employee-name-header');
        console.log(nameHeader);  
        if (nameHeader) {
            nameHeader.textContent = user.name || 'Tamu';
        }

        const nameMessage = document.getElementById('employee-name-message');
        if (nameMessage) {
            nameMessage.textContent = user.name || 'Tamu'; 
        } else {
            console.error("Elemen dengan ID 'employee-name-message' tidak ditemukan.");
        }
        const biodataName = document.getElementById('biodata-name');
        console.log(biodataName);  
        if (biodataName) {
            biodataName.textContent = user.name || 'Tidak tersedia';
        }

        const biodataTtl = document.getElementById('biodata-ttl');
        console.log(biodataTtl);  
        if (biodataTtl) {
            biodataTtl.textContent = `${user.tempat_lahir}, ${user.tanggal_lahir}` || 'Tidak tersedia';
        }

       

        const biodataNisn = document.getElementById('biodata-nisn');
        console.log(biodataNisn);  
        if (biodataNisn) {
            biodataNisn.textContent = user.nisn || 'Tidak tersedia';
        }
        const profileInitial = document.getElementById('profile-initial');
        if (profileInitial) {
            profileInitial.textContent = user.name?.charAt(0).toUpperCase() || 'T';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data sesi.');
    }
}

document.addEventListener('DOMContentLoaded', fetchSessionData);

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.content-section');

    function hideAllSections() {
        sections.forEach(section => section.classList.add('hidden'));
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            hideAllSections();

            const target = link.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });

    hideAllSections(); 
    const defaultLink = document.querySelector('[data-target="siswa-profil"]'); 
    if (defaultLink) {
        defaultLink.classList.add('active');
        document.getElementById('siswa-profile').classList.remove('hidden'); 
    }
});

// fungsi untuk mengambil data sesi
async function fetchSessionDataSiswa() {
  try {
      const response = await fetch('/api/session-siswa');
      if (!response.ok) {
          throw new Error('Tidak dapat mengambil data sesi.');
      }

      const user = await response.json();
      console.log('User data:', user);

      const nameHeader = document.getElementById('employee-name-header');
      if (nameHeader) {
          nameHeader.textContent = user.name || 'Tamu';
      }

      const nameMessage = document.getElementById('employee-name-message');
      if (nameMessage) {
          nameMessage.textContent = user.name || 'Tamu';
      }

      const biodataName = document.getElementById('biodata-name');
      if (biodataName) {
          biodataName.textContent = user.name || 'Tidak tersedia';
      }

      const biodataTtl = document.getElementById('biodata-ttl');
      if (biodataTtl) {
          biodataTtl.textContent = `${user.tempat_lahir}, ${user.tanggal_lahir}` || 'Tidak tersedia';
      }

      const biodataNisn = document.getElementById('biodata-nisn');
      if (biodataNisn) {
          biodataNisn.textContent = user.nisn || 'Tidak tersedia';
      }

      const profileInitial = document.getElementById('profile-initial');
      if (profileInitial) {
          profileInitial.textContent = user.name?.charAt(0).toUpperCase() || 'T';
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Gagal memuat data sesi.');
  }
}

document.addEventListener('DOMContentLoaded', fetchSessionDataSiswa);

async function getUserNISN() {
  try {
    const response = await fetch('/api/session-siswa');
    const sessionData = await response.json();
    console.log('NISN dari sesi:', sessionData.nisn);
    return sessionData.nisn;
  } catch (error) {
    console.error('Gagal mengambil NISN:', error);
    return null;
  }
}

function getSelectedDate() {
  const dateInput = document.getElementById('date-input');
  const selectedDate = dateInput ? dateInput.value : null;
  console.log('Tanggal yang dipilih:', selectedDate); 
  return selectedDate;
}


// fungsi untuk mengambil data siswa berdasarkan nisn
async function fetchSiswaData(nisn) {
  try {
      const response = await fetch(`/api/siswa/${nisn}`);
      if (!response.ok) throw new Error("Gagal memuat data siswa");

      const siswaData = await response.json();
      console.log("Data siswa:", siswaData);
      return siswaData;
  } catch (error) {
      console.error("Error saat memuat data siswa:", error);
      throw error;
  }
}

async function fetchAbsensiData() {
  const nisn = await getUserNISN(); 
  const today = getCurrentDate(); 

  if (!nisn) {
      alert('NISN tidak ditemukan. Harap periksa sesi pengguna.');
      return;
  }

  try {
      const response = await fetch(`/api/attendance-details-siswa?nisn=${nisn}&date=${today}`);
      if (!response.ok) throw new Error('Gagal memuat data absensi.');

      const data = await response.json();
      console.log('Data absensi:', data);

      displayAbsensi(data.attendanceDetails);  
  } catch (error) {
      console.error('Error saat memuat data absensi:', error);
      alert(`Gagal memuat data absensi: ${error.message}`);
  }
}

async function fetchAbsensiDataBySiswa() {
  const nisn = await getUserNISN();

  if (!nisn) {
    alert('NISN tidak ditemukan. Harap periksa sesi pengguna.');
    return;
  }

  try {
    // mengambil semua data absensi siswa berdasarkan NISN
    const response = await fetch(`/api/attendance-details-siswa?nisn=${nisn}`);
    if (!response.ok) throw new Error('Gagal memuat data absensi.');

    const absensiData = await response.json();
    console.log('Data absensi lengkap:', absensiData);

    // memfilter duplikasi berdasarkan tanggal
    const uniqueAbsensi = [];
    const seenDates = new Set();

    absensiData.attendanceDetails.forEach(record => {
      if (!seenDates.has(record.date)) {
        uniqueAbsensi.push(record);
        seenDates.add(record.date);
      }
    });

    console.log('Data absensi tanpa duplikasi:', uniqueAbsensi);

    // menampilkan semua data absensi tanpa duplikasi
    displayAbsensi(uniqueAbsensi);

  } catch (error) {
    console.error('Error saat memuat data absensi:', error);
    alert(`Gagal memuat data absensi: ${error.message}`);
  }
}

function displayAbsensi(absensiData) {
  const tableBody = document.getElementById('absensi-table').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; 

  absensiData.forEach((data) => {
    const row = document.createElement('tr'); 

    const dateCell = document.createElement('td'); 
    dateCell.textContent = data.date; 
    row.appendChild(dateCell); 

    const statusCell = document.createElement('td'); 
    statusCell.textContent = data.status;
    row.appendChild(statusCell); 

    tableBody.appendChild(row); 
  });
}

// mengambil data absensi ketika halaman selesai dimuat
document.addEventListener('DOMContentLoaded', fetchAbsensiDataBySiswa);

async function fetchClassData(classId) {
  try {
    // Fetching class data
    const response = await fetch(`/api/kelas/${classId}`);
    if (!response.ok) {
      throw new Error('Gagal mengambil data kelas.');
    }

    const classData = await response.json();
    console.log('Data kelas:', classData);

    const classNameElement = document.getElementById('class-name');
    const classTeacherNameElement = document.getElementById('class-teacher-name');
    const academicYearElement = document.getElementById('academic-year');
    const semesterElement = document.getElementById('semester');
    const studentNameElement = document.getElementById('student-name'); 

    if (classNameElement && classTeacherNameElement && academicYearElement && semesterElement && studentNameElement) {
      classNameElement.textContent = `Kelas: ${classData.nama_kelas || 'Tidak Tersedia'}`;
      classTeacherNameElement.textContent = `Wali Kelas: ${classData.nama_pegawai || 'Tidak Tersedia'}`;

      const sessionResponse = await fetch('/api/session-siswa');
      if (sessionResponse.ok) {
        const userData = await sessionResponse.json();
        console.log('Data siswa dari sesi:', userData);
        studentNameElement.textContent = `Nama Siswa: ${userData.name || 'Tidak Tersedia'}`;
      } else {
        studentNameElement.textContent = 'Nama Siswa Tidak Tersedia';
      }

      const tahunAjaranId = classData.id_tahun_ajaran;

      if (tahunAjaranId) {
        console.log('Mencoba mengambil data tahun ajaran untuk ID:', tahunAjaranId);
        const tahunAjaranResponse = await fetch(`/api/tahun-ajaran/${tahunAjaranId}`);
        if (tahunAjaranResponse.ok) {
          const tahunAjaranData = await tahunAjaranResponse.json();
          console.log('Data Tahun Ajaran:', tahunAjaranData);

          academicYearElement.textContent = `Tahun Ajaran: ${tahunAjaranData.tahun_ajaran || 'Tidak Tersedia'}`;
          semesterElement.textContent = `Semester: ${tahunAjaranData.semester || 'Tidak Tersedia'}`;
        } else {
          academicYearElement.textContent = 'Tahun Ajaran Tidak Ditemukan';
          semesterElement.textContent = 'Semester Tidak Ditemukan';
        }
      } else {
        academicYearElement.textContent = 'Tahun Ajaran Tidak Tersedia';
        semesterElement.textContent = 'Semester Tidak Tersedia';
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal memuat data kelas.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const nisn = await getUserNISN();
  if (nisn) {
      const classId = await getClassIdByNisn(nisn);
      fetchClassData(classId);
  }
});

async function getClassIdByNisn(nisn) {
  try {
      const response = await fetch(`/api/siswa/${nisn}`);
      const studentData = await response.json();
      return studentData.id_kelas; 
  } catch (error) {
      console.error('Error fetching class ID by NISN:', error);
      return null;
  }
}