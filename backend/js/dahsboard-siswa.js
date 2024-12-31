const cameraIcon = document.getElementById('camera-icon');
const fileInput = document.getElementById('file-input');
const profileImage = document.getElementById('profile-image');
const uploadForm = document.getElementById('upload-form');
const fileUploadInput = document.getElementById('file-upload');

// Fungsi untuk mengambil data sesi
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
        console.log(nameHeader);  // Debugging log
        if (nameHeader) {
            nameHeader.textContent = user.name || 'Tamu';
        }

        const nameMessage = document.getElementById('employee-name-message');
        if (nameMessage) {
            nameMessage.textContent = user.name || 'Tamu'; // Menggunakan 'Tamu' jika user.name undefined
        } else {
            console.error("Elemen dengan ID 'employee-name-message' tidak ditemukan.");
        }
        const biodataName = document.getElementById('biodata-name');
        console.log(biodataName);  // Debugging log
        if (biodataName) {
            biodataName.textContent = user.name || 'Tidak tersedia';
        }

        const biodataTtl = document.getElementById('biodata-ttl');
        console.log(biodataTtl);  // Debugging log
        if (biodataTtl) {
            biodataTtl.textContent = `${user.tempat_lahir}, ${user.tanggal_lahir}` || 'Tidak tersedia';
        }

       

        const biodataNisn = document.getElementById('biodata-nisn');
        console.log(biodataNisn);  // Debugging log
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

    hideAllSections(); // Menyembunyikan semua konten
    const defaultLink = document.querySelector('[data-target="siswa-profil"]'); // Memastikan Profil adalah default
    if (defaultLink) {
        defaultLink.classList.add('active');
        document.getElementById('siswa-profile').classList.remove('hidden'); // Menampilkan Profil
    }
});

// Fungsi untuk mengambil data sesi
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
    console.log('NISN dari sesi:', sessionData.nisn); // Debugging log
    return sessionData.nisn;
  } catch (error) {
    console.error('Gagal mengambil NISN:', error);
    return null; // Return null jika gagal
  }
}

function getSelectedDate() {
  const dateInput = document.getElementById('date-input');
  const selectedDate = dateInput ? dateInput.value : null;
  console.log('Tanggal yang dipilih:', selectedDate); // Debugging log
  return selectedDate;
}


// Fungsi untuk mengambil data siswa berdasarkan NISN
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

async function fetchAbsensiDataBySiswa() {
  const nisn = await getUserNISN();
  const today = getCurrentDate(); // Tanggal hari ini
  const yesterday = getPreviousDate(); // Tanggal kemarin

  if (!nisn) {
    alert('NISN tidak ditemukan. Harap periksa sesi pengguna.');
    return;
  }

  try {
    // Fetch data untuk hari ini dan kemarin
    const todayResponse = await fetch(`/api/attendance-details-siswa?nisn=${nisn}&date=${today}`);
    const yesterdayResponse = await fetch(`/api/attendance-details-siswa?nisn=${nisn}&date=${yesterday}`);

    if (!todayResponse.ok || !yesterdayResponse.ok) throw new Error('Gagal memuat data absensi.');

    const todayData = await todayResponse.json();
    const yesterdayData = await yesterdayResponse.json();

    console.log('Data absensi hari ini:', todayData);
    console.log('Data absensi kemarin:', yesterdayData);

    // Gabungkan data absensi
    const allAttendance = [
      ...yesterdayData.attendanceDetails.map((entry) => ({
        ...entry,
        date: yesterday, // Pastikan tanggal kemarin disematkan
      })),
      ...todayData.attendanceDetails.map((entry) => ({
        ...entry,
        date: today, // Pastikan tanggal hari ini disematkan
      })),
    ];

    if (allAttendance.length === 0) {
      alert('Tidak ada data absensi ditemukan.');
      return;
    }

    displayAbsensi(allAttendance); // Tampilkan semua data
  } catch (error) {
    console.error('Error saat memuat data absensi:', error);
    alert(`Gagal memuat data absensi: ${error.message}`);
  }
}

// Fungsi untuk mendapatkan tanggal kemarin
function getPreviousDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function displayError(message) {
  const errorContainer = document.getElementById('error-message');
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


function displayAbsensi(absensiData) {
  const tableBody = document.getElementById('absensi-table').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; // Bersihkan semua baris sebelumnya

  absensiData.forEach((data) => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = data.date; // Tanggal dari data API
    row.appendChild(dateCell);

    const statusCell = document.createElement('td');
    statusCell.textContent = data.status; // Status dari data API
    row.appendChild(statusCell);

    tableBody.appendChild(row); // Tambahkan baris ke tabel
  });
}

// Mengambil data absensi ketika halaman selesai dimuat
document.addEventListener('DOMContentLoaded', fetchAbsensiDataBySiswa);