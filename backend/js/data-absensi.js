async function getUserSession() {
  try {
    const response = await fetch("http://localhost:3000/api/session");
    if (!response.ok) throw new Error("Gagal memuat data session");

    const sessionData = await response.json();
    console.log("Data session pengguna:", sessionData);

    return sessionData.nip;
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal memuat data session.");
  }
}

async function fetchKelasList() {
  try {
    const nip = await getUserSession(); 
    if (!nip) throw new Error("NIP pengguna tidak ditemukan.");

    const response = await fetch("http://localhost:3000/api/kelas");
    if (!response.ok) throw new Error("Gagal memuat daftar kelas");

    const data = await response.json();
    console.log("Daftar kelas:", data);

    const filteredKelas = data.filter(kelas => kelas.nip === nip);
    console.log("Kelas yang dikelola oleh pengguna:", filteredKelas);

    return filteredKelas;
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal memuat daftar kelas.");
  }
}

async function fetchKelasData(kelasId) {
  try {
    const response = await fetch(`http://localhost:3000/api/kelas/${kelasId}`);
    if (!response.ok) throw new Error("Gagal memuat data kelas");

    const kelasData = await response.json();
    console.log("Data kelas:", kelasData);

    if (kelasData.siswa && kelasData.siswa.length > 0) {
      displayAbsensi(kelasData.siswa);
    } else {
      console.log("Tidak ada siswa yang terdaftar di kelas ini.");
      alert("Tidak ada siswa yang terdaftar di kelas ini.");
    }

    displayKelasHeader(kelasData);
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal memuat data kelas.");
  }
}

function displayKelasHeader(kelasData) {
  const kelasHeader = document.getElementById('kelas-header');
  
  const kelasInfo = document.createElement('p');
  kelasInfo.textContent = `Kelas: ${kelasData.nama_kelas}`;
  
  const waliKelasInfo = document.createElement('p');
  waliKelasInfo.textContent = `Wali Kelas: ${kelasData.nama_pegawai || 'Wali kelas tidak ada'}`;

  kelasHeader.innerHTML = ''; 

  kelasHeader.appendChild(kelasInfo);
  kelasHeader.appendChild(waliKelasInfo);
}

function displayAbsensi(siswaList) {
  const tableBody = document.getElementById('siswa-tbody-absensi');
  tableBody.innerHTML = ''; 

  siswaList.forEach((siswa, index) => {
    const row = document.createElement('tr');

    const noCell = document.createElement('td');
    noCell.textContent = index + 1;
    row.appendChild(noCell);

    const namaCell = document.createElement('td');
    namaCell.textContent = siswa.nama_siswa;
    row.appendChild(namaCell);

    const nisnCell = document.createElement('td');
    nisnCell.textContent = siswa.nisn;
    row.appendChild(nisnCell);

    const hadirCell = document.createElement('td');
    hadirCell.innerHTML = `
      <input type="radio" name="absensi[${siswa.nisn}]" value="hadir" class="hadir-radio">
    `;
    row.appendChild(hadirCell);

    const izinCell = document.createElement('td');
    izinCell.innerHTML = `
      <input type="radio" name="absensi[${siswa.nisn}]" value="izin" class="izin-radio">
    `;
    row.appendChild(izinCell);

    const sakitCell = document.createElement('td');
    sakitCell.innerHTML = `
      <input type="radio" name="absensi[${siswa.nisn}]" value="sakit" class="sakit-radio">
    `;
    row.appendChild(sakitCell);

    const alpaCell = document.createElement('td');
    alpaCell.innerHTML = `
      <input type="radio" name="absensi[${siswa.nisn}]" value="alpa" class="alpa-radio">
    `;
    row.appendChild(alpaCell);

    tableBody.appendChild(row);
  });

  document.getElementById('select-all-hadir').addEventListener('change', (e) => {
    const radioButtons = document.querySelectorAll('.hadir-radio');
    radioButtons.forEach(button => button.checked = e.target.checked); 
  });

  document.getElementById('select-all-izin').addEventListener('change', (e) => {
    const radioButtons = document.querySelectorAll('.izin-radio');
    radioButtons.forEach(button => button.checked = e.target.checked); 
  });

  document.getElementById('select-all-sakit').addEventListener('change', (e) => {
    const radioButtons = document.querySelectorAll('.sakit-radio');
    radioButtons.forEach(button => button.checked = e.target.checked); 
  });

  document.getElementById('select-all-alpa').addEventListener('change', (e) => {
    const radioButtons = document.querySelectorAll('.alpa-radio');
    radioButtons.forEach(button => button.checked = e.target.checked); 
  });
}

async function loadKelasData() {
  console.log("Fetching daftar kelas...");
  const kelasList = await fetchKelasList(); 

  if (kelasList && kelasList.length > 0) {
    const kelasId = kelasList[0].id; 
    console.log("ID kelas yang dipilih:", kelasId);

    if (kelasId) {
      fetchKelasData(kelasId); 
    } else {
      console.log("ID kelas tidak valid.");
      alert("Tidak ada ID kelas yang ditemukan.");
    }
  } else {
    console.log("Tidak ada data kelas tersedia.");
    alert("Tidak ada data kelas tersedia.");
  }
}

document.addEventListener("DOMContentLoaded", loadKelasData);