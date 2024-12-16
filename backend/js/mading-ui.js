let allMading = []; // Simpan semua data mading dari server

// Fungsi untuk mengambil semua data mading dari server
async function fetchAllMading() {
  try {
    showLoading(true);
    const response = await fetch('/api/mading');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    allMading = data; // Simpan data ke dalam variabel global
    renderMading(allMading);
  } catch (error) {
    console.error("Error fetching all Mading:", error);
  } finally {
    showLoading(false);
  }
}

// Fungsi untuk memfilter daftar mading berdasarkan kata kunci
function filterMading(searchTerm) {
  if (!searchTerm) {
    renderMading(allMading); // Jika tidak ada kata kunci, tampilkan semua data
  } else {
    const filteredData = allMading.filter(item =>
      item.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderMading(filteredData);
  }
}

// Fungsi untuk merender data ke UI
function renderMading(data) {
  const container = document.getElementById("mading-container");
  container.innerHTML = ""; 

  if (Array.isArray(data) && data.length > 0) {
    data.forEach(item => {
      if (item.judul && item.konten) {
        const card = document.createElement("div");
        card.className = "mading-card";

        const shortContent = item.konten.length > 200 
          ? item.konten.slice(0, 100).trim() + "..."
          : item.konten;

        card.innerHTML = `
          <div class="mading-title">${item.judul}</div>
          <hr>
          <div class="mading-image">
            ${item.foto ? `<img src="${item.foto}" alt="Mading Image">` : ''}
          </div>
          <div class="mading-description">${shortContent}</div>
          <div class="mading-meta">
            <div class="mading-author">
              <span class="user-icon">👤</span>
              <span class="author-text">by admin</span>
            </div>
            <div class="mading-date">${new Date(item.tanggal).toLocaleDateString()}</div>
          </div>
          <span class="button-view" onclick="window.location.href='/mading-detail?id=${item.id}'">Baca Selengkapnya</span>
        `;
        container.appendChild(card);
      }
    });
  } else {
    container.innerHTML = "<div>Tidak ada pengumuman yang tersedia</div>";
  }
}

// Tambahkan listener untuk menangani input di search bar
document.addEventListener("DOMContentLoaded", function () {
  fetchAllMading(); // Ambil semua data saat halaman pertama kali dimuat

  const searchInput = document.getElementById('search-bar');
  searchInput.addEventListener('input', debounce(function (event) {
    filterMading(event.target.value); // Filter hasil setiap kali input berubah
  }, 300));
});

// Gunakan debounce untuk mengurangi jumlah panggilan
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Indikator Loading
function showLoading(isLoading) {
  const loadingIndicator = document.getElementById('loading-indicator');
  loadingIndicator.style.display = isLoading ? 'block' : 'none';
}
