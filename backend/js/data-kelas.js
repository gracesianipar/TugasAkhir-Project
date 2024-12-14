let dropdownVisible = false;

document.addEventListener('DOMContentLoaded', () => {
  fetchClasses();
  
  // Tambahkan event listener ke tombol dropdown untuk toggle
  const dropBtn = document.querySelector('.dropbtn');
  dropBtn.addEventListener('click', toggleDropdown);
});

function fetchClasses() {
  fetch('/api/kelas') // Sesuaikan URL dengan server Anda
    .then(response => response.json())
    .then(data => populateDropdown(data))
    .catch(error => console.error('Gagal memuat data kelas', error));
}

function populateDropdown(classes) {
  const dropdownContent = document.getElementById('dropdown-content');
  dropdownContent.innerHTML = '';

  classes.forEach(cls => {
    const link = document.createElement('a');
    link.textContent = cls.nama_kelas;
    link.onclick = () => handleClassSelection(cls.nama_kelas);
    dropdownContent.appendChild(link);
  });
}

function handleClassSelection(className) {
  alert(`Anda memilih: ${className}`);
}

function toggleDropdown() {
  const dropdownContent = document.getElementById('dropdown-content');
  dropdownVisible = !dropdownVisible;

  if (dropdownVisible) {
    dropdownContent.style.display = 'block';
  } else {
    dropdownContent.style.display = 'none';
  }
}

// Klik di luar dropdown akan menutup dropdown
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.dropdown');
  if (!dropdown.contains(e.target)) {
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.style.display = 'none';
    dropdownVisible = false;
  }
});
