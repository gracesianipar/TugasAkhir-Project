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

async function displayKelasHeader(kelasData) {
  const kelasHeader = document.getElementById('kelas-header');
  kelasHeader.innerHTML = ''; 

  if (!kelasData) {
    console.error('Data kelas tidak tersedia.');
    return;
  }

  const kelasInfo = document.createElement('p');
  kelasInfo.className = 'kelas';
  kelasInfo.textContent = `Kelas: ${kelasData.nama_kelas || 'Tidak Tersedia'}`;

  const waliKelasInfo = document.createElement('p');
  waliKelasInfo.className = 'wali';
  waliKelasInfo.textContent = `Wali Kelas: ${kelasData.nama_pegawai || 'Tidak Tersedia'}`;

  const dateLabel = document.createElement('label');
  dateLabel.className = 'kalender';
  dateLabel.setAttribute('for', 'attendance-date');
  
  const labelText = document.createTextNode('Pilih Tanggal: ');
  dateLabel.appendChild(labelText); 

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'attendance-date';
  dateInput.name = 'attendance-date';
  dateInput.value = new Date().toISOString().split('T')[0];
  dateInput.className = 'kalenderBox';
  
  // Menambahkan input ke dalam label
  dateLabel.appendChild(dateInput);

  // Menambahkan event listener untuk perubahan tanggal
  dateInput.addEventListener('change', async () => {
    const selectedDate = dateInput.value;
    await fetchAbsensiData(kelasData.id, selectedDate);
  });

  const academicYearInfo = document.createElement('p');
  academicYearInfo.className = 'tahun';

  const semesterInfo = document.createElement('p');
  semesterInfo.className = 'semester';

  const tahunAjaranId = kelasData.id_tahun_ajaran;
  if (!tahunAjaranId) {
    console.error('ID Tahun Ajaran tidak tersedia di kelasData:', kelasData);
    academicYearInfo.textContent = 'Tahun Ajaran Tidak Tersedia';
    semesterInfo.textContent = 'Semester Tidak Tersedia';
  } else {
    try {
      const tahunAjaranResponse = await fetch(`/api/tahun-ajaran/${tahunAjaranId}`);
      if (tahunAjaranResponse.ok) {
        const tahunAjaranData = await tahunAjaranResponse.json();
        academicYearInfo.textContent = `Tahun Ajaran: ${tahunAjaranData.tahun_ajaran}`;
        semesterInfo.textContent = `Semester: ${tahunAjaranData.semester}`;
      } else {
        console.error('Gagal mendapatkan Tahun Ajaran:', tahunAjaranResponse.statusText);
        academicYearInfo.textContent = 'Tahun Ajaran Tidak Ditemukan';
        semesterInfo.textContent = 'Semester Tidak Ditemukan';
      }
    } catch (error) {
      console.error('Error fetching Tahun Ajaran:', error);
      academicYearInfo.textContent = 'Gagal memuat Tahun Ajaran';
      semesterInfo.textContent = 'Gagal memuat Semester';
    }
  }

  // Tambahkan elemen ke dalam header
  kelasHeader.appendChild(kelasInfo);
  kelasHeader.appendChild(waliKelasInfo);
  kelasHeader.appendChild(semesterInfo);
  kelasHeader.appendChild(academicYearInfo);
  kelasHeader.appendChild(dateLabel);
}

// fungsi untuk memfilter sesuai tanggal yang dipilih di kalender
function displayAbsensiData(absensiData) {
  const absensiContainer = document.getElementById('absensi-container');
  absensiContainer.innerHTML = ''; 

  if (absensiData.length === 0) {
    absensiContainer.textContent = 'Tidak ada data absensi untuk tanggal ini.';
    return;
  }

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  
  const headers = ['Nama Siswa', 'Status Absensi'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  absensiData.forEach(absensi => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = absensi.nama_siswa;

    const statusCell = document.createElement('td');
    statusCell.textContent = absensi.status;

    row.appendChild(nameCell);
    row.appendChild(statusCell);
    table.appendChild(row);
  });

  absensiContainer.appendChild(table);
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

  const allHadirRadios = document.querySelectorAll('.hadir-radio');
  allHadirRadios.forEach(radio => radio.checked = true);

  const selectAllHadirCheckbox = document.getElementById('select-all-hadir');
  if (selectAllHadirCheckbox) {
    selectAllHadirCheckbox.checked = true; 
  }

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

  const allRadios = document.querySelectorAll('input[type="radio"]');
  allRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const anyHadirUnchecked = Array.from(allHadirRadios).some(radio => !radio.checked);
      
      if (selectAllHadirCheckbox) {
        selectAllHadirCheckbox.checked = !anyHadirUnchecked;
      }
    });
  });
}

const saveAbsensi = async () => {
  const saveButton = document.getElementById("save-absensi-button");
  const mode = saveButton.getAttribute("data-mode");
  const id_kelas = await getIdKelas();
  const cancelButton = document.getElementById("cancel-button");

  if (!id_kelas) {
    alert("ID Kelas tidak ditemukan!");
    return;
  }

  const selectedDate = document.getElementById("attendance-date").value;
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const selectedDateObj = new Date(selectedDate);

  // memeriksa apakah tanggal yang dipilih berada dalam rentang yang valid
  if (selectedDateObj > today) {
    Swal.fire({
      icon: 'error',
      title: 'Tanggal di Masa Depan!',
      text: 'Anda tidak dapat memilih tanggal di masa depan untuk absensi.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#004D40'
    });
    return;
  }  

  if (selectedDateObj < sevenDaysAgo) {
    Swal.fire({
      icon: 'error',
      title: 'Rentang Tanggal Tidak Valid!',
      text: 'Anda hanya bisa mengedit absensi dalam rentang 7 hari terakhir.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#004D40'
    });
    return;
  }  

  const absensiData = [];
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(checkbox => {
    if (checkbox.name && checkbox.name.includes('[') && checkbox.name.includes(']')) {
      const nisn = checkbox.name.split('[')[1].split(']')[0];
      const status = checkbox.value;
      absensiData.push({
        nisn: nisn,
        status: status,
        id_kelas: id_kelas,
        date: selectedDate
      });
    }
  });

  const radios = document.querySelectorAll('input[type="radio"]:checked');
  radios.forEach(radio => {
    if (radio.name && radio.name.includes('[') && radio.name.includes(']')) {
      const nisn = radio.name.split('[')[1].split(']')[0];
      const status = radio.value;
      absensiData.push({
        nisn: nisn,
        status: status,
        id_kelas: id_kelas,
        date: selectedDate || new Date().toISOString().split('T')[0]
      });
    }
  });

  if (absensiData.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Data Absensi Kosong!',
      text: 'Tidak ada data absensi yang dipilih.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#004D40'
    });
    return;
  }  

  // menghapus duplikat data sebelum disimpan
  const uniqueAbsensiData = removeDuplicateAbsensi(absensiData);

  try {
    let attendanceResponse;
    if (mode === 'edit') {
      // mengaktifkan checkbox dan radio button untuk mengedit
      document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
        input.disabled = false;
      });
      saveButton.textContent = "Simpan Perubahan";
      saveButton.setAttribute("data-mode", "save");

      // menyembunyikan tombol Batal setelah memilih Simpan Perubahan
      cancelButton.style.display = "inline-block";
      return; 
    }
    
    // simpan or update attendance
    attendanceResponse = await fetch("http://localhost:3000/api/save-attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_kelas: id_kelas,
        date: selectedDate || new Date().toISOString().split('T')[0]
      }),
    });

    if (!attendanceResponse.ok) {
      const errorDetails = await attendanceResponse.json();
      console.error("Error from save-attendance API:", errorDetails);
      throw new Error(errorDetails.message || "Gagal menyimpan data absensi kelas");
    }

    const attendanceResult = await attendanceResponse.json();
    const attendanceId = attendanceResult.id || attendanceResult.insertId;

    if (!attendanceId) {
      throw new Error("ID Absensi tidak ditemukan dalam response.");
    }

    // menyimpan attendance details
    const detailsResponse = await fetch("http://localhost:3000/api/save-attendance-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        absensiId: attendanceId,
        absensiData: uniqueAbsensiData,
      }),
    });

    if (!detailsResponse.ok) {
      const errorDetails = await detailsResponse.json();
      console.error("Error from save-attendance-details API:", errorDetails);
      throw new Error(errorDetails.message || "Gagal menyimpan data detail absensi");
    }

    Swal.fire({
      icon: 'success',
      title: 'Sukses!',
      text: 'Data absensi berhasil disimpan!',
      confirmButtonText: 'OK',
      confirmButtonColor: '#004D40'
    });

    saveButton.textContent = "Edit";
    saveButton.setAttribute("data-mode", "edit");

    // menyembunyikan tombol Batal setelah sukses simpan
    cancelButton.style.display = "none";

    // refresh attendance data
    fetchAbsensiData(id_kelas, selectedDate || new Date().toISOString().split('T')[0]);

  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: 'Gagal menyimpan data absensi.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#004D40'
    });
  }
};

document.getElementById("save-absensi-button").addEventListener("click", function() {
  const mode = this.getAttribute("data-mode");

  if (mode === "save") {
  } else if (mode === "edit") {
    
    document.getElementById("cancel-button").style.display = "inline-block";  
    this.textContent = "Simpan Perubahan";
    this.setAttribute("data-mode", "save");
  }
});

document.getElementById("cancel-button").addEventListener("click", function() {
  const saveAbsensi = document.getElementById("save-absensi-button");
  saveAbsensi.textContent = "Edit";
  saveAbsensi.setAttribute("data-mode", "edit");
  
  this.style.display = "none";  

});

async function updateStatusAbsensi(absensiId, absensiData) {
  try {
      if (!absensiId || !Array.isArray(absensiData) || absensiData.length === 0) {
          throw new Error('Invalid absensiId or absensiData');
      }

      // menghapus data duplikat
      const uniqueAbsensiData = removeDuplicateAbsensi(absensiData);

      // data absensi untuk update
      const values = uniqueAbsensiData.map(item => [item.status, absensiId, item.nisn]);

      // memperbarui status absensi di database
      const [result] = await db.query(
          `
          UPDATE attendanceDetails
          SET status = ?
          WHERE id_attendance = ? AND nisn = ?
          `,
          values
      );

      // mengecek apakah ada baris yang terpengaruh
      if (result.affectedRows === 0) {
          throw new Error('No matching records found to update');
      }

      return { success: true, message: 'Attendance details updated successfully', result };
  } catch (error) {
      console.error('Error updating attendance details:', error);
      return { success: false, message: error.message, error };
  }
}

// fungsi untuk menghapus duplikasi data berdasarkan nisn
const removeDuplicateAbsensi = (data) => {
  const uniqueData = new Map();

  data.forEach(item => {
    if (!uniqueData.has(item.nisn)) {
      uniqueData.set(item.nisn, item);
    } else {
      uniqueData.set(item.nisn, item); 
    }
  });

  // mengembalikan data yang sudah unik
  return Array.from(uniqueData.values());
};

async function fetchAbsensiData(kelasId, date) {
  console.log(`Fetching attendance data for kelasId=${kelasId}, date=${date}`);

  try {
    const response = await fetch(`http://localhost:3000/api/attendance-details?kelasId=${kelasId}&date=${date}`);
    
    if (!response.ok) throw new Error("Gagal memuat data absensi");

    const responseData = await response.json();
    const absensiData = responseData.attendanceDetails;

    console.log("Data absensi fetched:", absensiData);

    if (!Array.isArray(absensiData)) {
      throw new Error("Data absensi tidak valid, tidak ada properti 'attendanceDetails' atau bukan array");
    }

    if (absensiData.length === 0) {
      console.warn("Tidak ada data absensi ditemukan.");
      alert("Tidak ada data absensi ditemukan.");
      return;
    }
     
    // menghapus data duplikat
    const uniqueAbsensiData = removeDuplicateAbsensi(absensiData);

    console.log("Data absensi setelah menghapus duplikasi:", uniqueAbsensiData);

    const tbody = document.getElementById('siswa-tbody-absensi');
    tbody.innerHTML = '';  

    let semuaHadir = true;

    uniqueAbsensiData.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = 
      ` 
        <td>${index + 1}</td>
        <td>${item.nama_siswa}</td>
        <td>${item.nisn}</td>
        <td>
            <input type="radio" name="absensi[${item.nisn}]" data-nisn="${item.nisn}" data-status="Hadir" value="Hadir" ${item.status === 'Hadir' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
        </td>
        <td>
            <input type="radio" name="absensi[${item.nisn}]" data-nisn="${item.nisn}" data-status="Izin" value="Izin" ${item.status === 'Izin' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
        </td>
        <td>
            <input type="radio" name="absensi[${item.nisn}]" data-nisn="${item.nisn}" data-status="Sakit" value="Sakit" ${item.status === 'Sakit' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
        </td>
        <td>
            <input type="radio" name="absensi[${item.nisn}]" data-nisn="${item.nisn}" data-status="Alpa" value="Alpa" ${item.status === 'Alpa' ? 'checked' : ''} ${item.status ? 'disabled' : ''}>
        </td>
      `;
      tbody.appendChild(tr);

      if (item.status !== 'Hadir') {
        semuaHadir = false;
      }
    });

    const selectAllHadirCheckbox = document.getElementById('select-all-hadir'); 
    if (selectAllHadirCheckbox) {
      selectAllHadirCheckbox.checked = semuaHadir;
    }

    // mengatur button simpan kembali ke mode edit setelah simpan absensi
    const saveButton = document.getElementById("save-absensi-button");
    const cancelButton = document.getElementById("cancel-button");
    saveButton.textContent = "Edit";
    saveButton.setAttribute("data-mode", "edit");
    cancelButton.style.display = "none";

  } catch (error) {
    console.error("Error saat memuat data absensi:", error);
    alert(`Gagal memuat data absensi: ${error.message}`);
  }
}

async function getIdKelas() {
  const kelasList = await fetchKelasList(); 
  if (kelasList && kelasList.length > 0) {
    return kelasList[0].id; 
  }
  return null;
}

async function loadKelasData() {
  console.log("Fetching daftar kelas...");

  try {
      const kelasList = await fetchKelasList();

      if (Array.isArray(kelasList) && kelasList.length > 0) {
          const kelasId = kelasList[0].id; 
          console.log("ID kelas yang dipilih:", kelasId);

          if (kelasId) {
              await fetchKelasData(kelasId);  
              const todayDate = new Date().toLocaleDateString('en-CA'); 
              await fetchAbsensiData(kelasId, todayDate);
          } else {
              console.warn("ID kelas tidak valid.");
              alert("Tidak ada ID kelas yang ditemukan.");
          }
      } else {
          console.warn("Tidak ada data kelas tersedia.");
          alert("Tidak ada data kelas tersedia.");
      }
  } catch (error) {
      console.error("Error saat memuat data kelas:", error);
      alert("Gagal memuat data kelas: ${error.message}");
  }
}

document.addEventListener("DOMContentLoaded", loadKelasData);

document.addEventListener('DOMContentLoaded', () => {
  // menggunakan add.EventListener untuk mencari siswa
  document.getElementById('search-siswa').addEventListener('input', searchSiswa);
});

function searchSiswa() {
  const searchTerm = document.getElementById('search-siswa').value.toLowerCase();
  const rows = document.querySelectorAll('#siswa-tbody-absensi tr'); 
  const targetElement = document.getElementById('siswa-container');
  let hasMatch = false;

  rows.forEach(row => {
    const namaSiswa = row.cells[1].textContent.toLowerCase(); 
    const nisn = row.cells[2].textContent.toLowerCase(); 

    if (namaSiswa.includes(searchTerm) || nisn.includes(searchTerm)) {
      row.style.display = ''; 
      hasMatch = true;
    } else {
      row.style.display = 'none'; 
    }
  });

  // menampilkan pesan/keterangan jika data tidak ditemukan
  const notFoundMessage = document.getElementById('not-found-message');
  if (!hasMatch) {
    if (!notFoundMessage) {
      const message = document.createElement('p');
      message.id = 'not-found-message';
      message.textContent = 'Siswa tidak terdaftar di dalam kelas ini.';
      message.style.textAlign = 'center'; 
      message.style.fontStyle = 'italic';
      targetElement.appendChild(message);
    }    
  } else {
    if (notFoundMessage) {
      notFoundMessage.remove();
    }
  }
}