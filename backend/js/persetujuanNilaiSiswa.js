async function getUserSession() {
  try {
      const response = await fetch("api/session");
      if (!response.ok) throw new Error("Gagal memuat data session");

      const sessionData = await response.json();
      console.log("Data session pengguna:", sessionData);

      return sessionData.nip;
  } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat data session.");
  }
}

async function displayKelas(kelasData) {
    console.log("kelasData:", kelasData);
    const kelasInfoDiv = document.getElementById("info-kelas");
    kelasInfoDiv.innerHTML = '';
  
    if (Array.isArray(kelasData) && kelasData.length > 0) {
      for (const kelas of kelasData) {
        const namaKelas = document.createElement("p");
        namaKelas.innerHTML = `<strong>Nama Kelas:</strong> ${kelas.nama_kelas}`;
  
        const tingkatan = document.createElement("p");
        tingkatan.innerHTML = `<strong>Tingkatan:</strong> ${kelas.tingkatan}`;
  
        const namaTahunAjaran = document.createElement("p");
        namaTahunAjaran.textContent = "Memuat data tahun ajaran...";
  
        const semesterInfo = document.createElement("p");
        semesterInfo.textContent = "Memuat data semester...";
  
        // Tambahkan elemen sementara ke dalam DOM
        kelasInfoDiv.appendChild(namaKelas);
        kelasInfoDiv.appendChild(tingkatan);
        kelasInfoDiv.appendChild(namaTahunAjaran);
        kelasInfoDiv.appendChild(semesterInfo);
  
        if (kelas.id_tahun_ajaran) {
          try {
            const tahunAjaranResponse = await fetch(`/api/tahun-ajaran/${kelas.id_tahun_ajaran}`);
            if (tahunAjaranResponse.ok) {
              const tahunAjaranData = await tahunAjaranResponse.json();
              namaTahunAjaran.innerHTML = `
                <strong>Semester:</strong> ${tahunAjaranData.semester || 'Tidak tersedia'}
              `;
              semesterInfo.innerHTML = `
                <strong>Nama Tahun Ajaran:</strong> ${tahunAjaranData.tahun_ajaran || 'Tidak tersedia'}
              `;
            } else {
              console.error('Gagal mendapatkan Tahun Ajaran:', tahunAjaranResponse.statusText);
              namaTahunAjaran.textContent = 'Nama Tahun Ajaran Tidak Ditemukan';
              semesterInfo.textContent = 'Semester Tidak Ditemukan';
            }
          } catch (error) {
            console.error('Error fetching Tahun Ajaran:', error);
            namaTahunAjaran.textContent = 'Gagal memuat Nama Tahun Ajaran';
            semesterInfo.textContent = 'Gagal memuat Semester';
          }
        } else {
          namaTahunAjaran.textContent = 'ID Tahun Ajaran tidak tersedia';
          semesterInfo.textContent = 'Semester Tidak Tersedia';
        }
      }
    } else {
      const noKelasMessage = document.createElement("p");
      noKelasMessage.textContent = "Anda tidak mengelola kelas manapun.";
      noKelasMessage.classList.add('no-kelas');
      kelasInfoDiv.appendChild(noKelasMessage);
    }
  
    kelasInfoDiv.classList.remove("hidden");
  }  

async function fetchKelas() {
  try {
      const nip = await getUserSession();
      if (!nip) throw new Error("NIP pengguna tidak ditemukan.");

      const response = await fetch("/api/kelas");
      if (!response.ok) throw new Error("Gagal memuat data kelas");

      const kelasData = await response.json();
      console.log("Data kelas:", kelasData);

      const filteredKelas = kelasData.filter(kelas => kelas.nip === nip);
      console.log("Kelas yang dikelola oleh pengguna:", filteredKelas);

      displayKelas(filteredKelas);

      if (filteredKelas.length > 0) {
          const kelasId = filteredKelas[0].id;
          await fetchMataPelajaran(kelasId);
      }

  } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat data kelas atau nilai.");
  }
}

async function fetchMataPelajaran(kelasId) {
  try {
      const response = await fetch(`/api/mapel/${kelasId}`);
      if (!response.ok) throw new Error("Gagal memuat mata pelajaran");

      const mataPelajaranData = await response.json();
      console.log("Data mata pelajaran:", mataPelajaranData);

      displayMataPelajaran(mataPelajaranData);

  } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat mata pelajaran.");
  }
}

function displayMataPelajaran(mataPelajaranData) {
  const mapelSelect = document.getElementById("mapel-filter");
  mapelSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';

  if (Array.isArray(mataPelajaranData) && mataPelajaranData.length > 0) {
      mataPelajaranData.forEach(mapel => {
          const option = document.createElement("option");
          option.value = mapel.id;
          option.textContent = mapel.nama_mata_pelajaran;
          mapelSelect.appendChild(option);
      });
  }
}

async function fetchGrades(kelasId, mapelId) {
  try {
      const response = await fetch(`/api/grades/${kelasId}/${mapelId}`);
      if (!response.ok) throw new Error("Gagal memuat data nilai");

      const gradesData = await response.json();
      console.log("Data nilai:", gradesData);

      // Tampilkan data nilai di tabel
      displayGrades(gradesData);
  } catch (error) {
      console.error("Error:", error);
      alert("Gagal memuat data nilai.");
  }
}
function displayGrades(gradesData) {
  const tbody = document.getElementById("nilai-tbody");
  tbody.innerHTML = ''; // Bersihkan tabel sebelumnya

  let showApproveAllButton = true; // Variabel untuk menampilkan tombol Setujui Semua

  if (Array.isArray(gradesData) && gradesData.length > 0) {
      gradesData.forEach(grade => {
        nilaiAkhir=  parseFloat(((grade.uts * 0.4) + (grade.uas * 0.4) + (grade.tugas * 0.2)).toFixed(2))
          const row = document.createElement("tr");

          // NISN
          const nisnCell = document.createElement("td");
          nisnCell.textContent = grade.nisn;
          row.appendChild(nisnCell);

          // Nama Siswa
          const namaSiswaCell = document.createElement("td");
          namaSiswaCell.textContent = grade.nama_siswa || "Tidak tersedia";
          row.appendChild(namaSiswaCell);

          // Nilai UTS, UAS, dan Tugas
          const utsCell = document.createElement("td");
          utsCell.textContent = grade.uts !== null ? grade.uts : '-';
          row.appendChild(utsCell);

          const uasCell = document.createElement("td");
          uasCell.textContent = grade.uas !== null ? grade.uas : '-';
          row.appendChild(uasCell);

          const tugasCell = document.createElement("td");
          tugasCell.textContent = grade.tugas !== null ? grade.tugas : '-';
          row.appendChild(tugasCell);

          const nilaiAkhirCell = document.createElement("td");
          nilaiAkhirCell.textContent = nilaiAkhir;
          row.appendChild(nilaiAkhirCell);
          // Status
          const statusCell = document.createElement("td");
          let checkIcon, timesIcon;

          // Mengupdate ikon berdasarkan gradeStatus
          if (grade.gradeStatus === "setuju") {
              statusCell.innerHTML = `<i class="fas fa-check-circle" style="color: green; cursor: pointer;" title="Lulus"></i>`;
              checkIcon = statusCell.querySelector('.fa-check-circle');
              showApproveAllButton = false; // Menyembunyikan tombol Setujui Semua jika ada yang sudah disetujui
          } else if (grade.gradeStatus === "tolak") {
              statusCell.innerHTML = `<i class="fas fa-times-circle" style="color: red; cursor: pointer;" title="Tidak Lulus"></i>`;
              timesIcon = statusCell.querySelector('.fa-times-circle');
              showApproveAllButton = false; // Menyembunyikan tombol Setujui Semua jika ada yang ditolak
          } else {
              statusCell.innerHTML = ` 
                  <i class="fas fa-check-circle" style="color: green; cursor: pointer;" title="Lulus"></i>
                  <i class="fas fa-times-circle" style="color: red; cursor: pointer; margin-left: 10px;" title="Tidak Lulus"></i>`;
              checkIcon = statusCell.querySelector('.fa-check-circle');
              timesIcon = statusCell.querySelector('.fa-times-circle');
          }

          row.appendChild(statusCell);

          // Catatan
          const catatanCell = document.createElement("td");
          catatanCell.textContent = grade.catatan || ''; // Menampilkan catatan yang ada di database
          row.appendChild(catatanCell);

          // Event listener untuk ikon centang
          if (checkIcon) {
              checkIcon.addEventListener('click', () => {
                  catatanCell.textContent = "Lulus"; // Set catatan menjadi "Lulus"
                  statusCell.innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> Setuju`; // Update status
                  // Sembunyikan ikon silang
                  if (timesIcon) timesIcon.style.display = "none";
                  updateStatusInDB(grade.nisn, "Lulus", "Setuju", grade);
              });
          }

          // Event listener untuk ikon silang
          if (timesIcon) {
              timesIcon.addEventListener('click', () => {
                  const inputField = document.createElement("input");
                  inputField.type = "text";
                  inputField.placeholder = "Masukkan alasan";
                  inputField.style.width = "80%";

                  const saveButton = document.createElement("button");
                  saveButton.textContent = "Simpan";
                  saveButton.style.marginLeft = "5px";
                  saveButton.style.cursor = "pointer";

                  // Tombol Batal
                  const cancelButton = document.createElement("button");
                  cancelButton.textContent = "Batal";
                  cancelButton.style.marginLeft = "5px";
                  cancelButton.style.cursor = "pointer";

                  // Menyusun elemen input dan tombol
                  catatanCell.innerHTML = '';
                  catatanCell.appendChild(inputField);
                  catatanCell.appendChild(saveButton);
                  catatanCell.appendChild(cancelButton);

                  // Event listener untuk tombol Simpan
                  saveButton.addEventListener('click', () => {
                      const note = inputField.value.trim();

                      if (note) {
                          catatanCell.textContent = note;
                          statusCell.innerHTML = `<i class="fas fa-times-circle" style="color: red;"></i> Tolak`;
                          // Sembunyikan ikon centang
                          if (checkIcon) checkIcon.style.display = "none";
                          updateStatusInDB(grade.nisn, note, "Tolak", grade);
                      } else {
                          Swal.fire({
                              icon: 'error',
                              title: 'Oops...',
                              text: 'Catatan tidak boleh kosong!',
                          });
                      }
                  });

                  cancelButton.addEventListener('click', () => {
                      // Mengembalikan catatan dan status seperti semula
                      catatanCell.textContent = grade.catatan || ''; // Kembalikan catatan sebelumnya
                      statusCell.innerHTML = `
                          <i class="fas fa-check-circle" style="color: green; cursor: pointer;" title="Setujui"></i>
                          <i class="fas fa-times-circle" style="color: red; cursor: pointer;" title="Tolak"></i>
                      `;
                      // Menampilkan ikon centang lagi jika perlu
                      if (checkIcon) checkIcon.style.display = "inline";
                  });
              });
          }

          tbody.appendChild(row);
      });

      // Jika status semua nilai masih kosong, tampilkan tombol Setujui Semua
      if (showApproveAllButton) {
          const approveAllButton = document.createElement("button");
          approveAllButton.textContent = "Setujui Semua";
          approveAllButton.style.marginTop = "20px";
          approveAllButton.style.cursor = "pointer";
          approveAllButton.style.position = "absolute";
          approveAllButton.style.right = "20px";
          approveAllButton.style.backgroundColor = "#004D40";
          approveAllButton.style.color = "white";
          approveAllButton.style.padding = "8px 10px";
          approveAllButton.style.border = "none";
          approveAllButton.style.borderRadius = "5px";
          approveAllButton.style.fontSize = "12px";
          approveAllButton.style.transition = "background-color 0.3s";
      
          approveAllButton.addEventListener('click', () => {
              let missingFields = new Set(); // Menggunakan Set untuk memastikan tidak ada duplikasi
              const mapelId = document.getElementById("mapel-filter").value;
          
              gradesData.forEach(grade => {
                  if (!grade.uts) {
                      missingFields.add('UTS');
                  }
                  if (!grade.uas) {
                      missingFields.add('UAS');
                  }
                  if (!grade.tugas) {
                      missingFields.add('Tugas');
                  }
              });
          
              // Cek apakah ada nilai yang belum diisi
              if (missingFields.size > 0) {
                  Swal.fire({
                      icon: 'error',
                      title: 'Nilai belum lengkap!',
                      text: 'Harap isi nilai ' + Array.from(missingFields).join(', ') + ' sebelum menyetujui.',
                  });
              } else {
                  let updateSuccessful = true;
          
                  gradesData.forEach((grade, index) => {
                      grade.gradeStatus = "setuju";
                      grade.catatan = "Lulus";
          
                      fetch('/api/update-grade-status', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                              nisn: grade.nisn,
                              catatan: grade.catatan,
                              status: grade.gradeStatus,
                              mapel_id: mapelId
                          })
                      })
                      .then(response => response.json())
                      .then(data => {
                          if (data.message !== 'Status berhasil diperbarui.') {
                              updateSuccessful = false;
                          }
          
                          // Update UI jika status berhasil diubah
                          if (updateSuccessful) {
                              // Cari baris berdasarkan index
                              const row = tbody.children[index];
                              const statusCell = row.querySelector('td:nth-child(7)'); // Asumsi kolom status ada di index 7
                              const catatanCell = row.querySelector('td:nth-child(8)'); // Asumsi kolom catatan ada di index 8
                              
                              // Update status menjadi "Lulus" dan ikon centang
                              statusCell.innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> Setuju`;
          
                              // Update catatan menjadi "Lulus"
                              catatanCell.textContent = "Lulus";
                          }
                      })
                      .catch(err => {
                          console.error('Error:', err);
                          updateSuccessful = false;
                      });
                  });
          
                  Swal.fire({
                      title: updateSuccessful ? 'Sukses!' : 'Gagal!',
                      text: updateSuccessful
                          ? 'Semua nilai berhasil disetujui!'
                          : 'Terjadi kesalahan dalam memperbarui status nilai. Silakan coba lagi.',
                      icon: updateSuccessful ? 'success' : 'error',
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#004D40',

                  }).then(() => {
                      if (updateSuccessful) {
                          approveAllButton.style.display = 'none'; // Menyembunyikan tombol Setujui Semua setelah berhasil
                      }
                  });
              }
          });
          
      
          // Menambahkan tombol ke dalam tabel
          document.getElementById("nilaiTable").appendChild(approveAllButton);
      }
          } else {
      const noDataRow = document.createElement("tr");
      const noDataCell = document.createElement("td");
      noDataCell.colSpan = 8;
      noDataCell.textContent = "Tidak ada data nilai.";
      noDataRow.appendChild(noDataCell);
      tbody.appendChild(noDataRow);
  }
}

// async function updateStatusInDB(nisn, catatan, status) {
//     const mapelId = document.getElementById("mapel-filter").value;

//     if (!mapelId) {
//         alert("Silakan pilih mata pelajaran");
//         return;
//     }

//     try {
//         const response = await fetch(`/api/update-grade-status`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 nisn: nisn,
//                 catatan: catatan,
//                 status: status,
//                 mapel_id: mapelId,
//             }),
//         });

//         if (!response.ok) {
//             throw new Error('Gagal memperbarui status nilai.');
//         }

//         const result = await response.json();
//         console.log('Status berhasil diperbarui:', result);
//         alert('Status nilai berhasil diperbarui!');
//     } catch (error) {
//         console.error('Error:', error);
//         alert('Gagal memperbarui status nilai.');
//     }
// }

document.getElementById("mapel-filter").addEventListener("change", async function () {
  const kelasId = await getSelectedKelasId();
  const mapelId = this.value;

  if (kelasId && mapelId) {
      await fetchGrades(kelasId, mapelId);
  }
});

async function getSelectedKelasId() {
  const nip = await getUserSession();
  const response = await fetch("/api/kelas");
  const kelasData = await response.json();
  const kelas = kelasData.find(k => k.nip === nip);
  return kelas ? kelas.id : null;
}




document.addEventListener("DOMContentLoaded", function () {
  fetchKelas();
});
