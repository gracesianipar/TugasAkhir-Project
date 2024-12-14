// Fungsi untuk mengambil data dari server
async function fetchMading(searchTerm = '') {
  try {
    const response = await fetch(`/api/mading?search=${encodeURIComponent(searchTerm)}`); 
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data dari server:", data);
    renderMading(data);
  } catch (error) {
    console.error("Error fetching data Mading:", error);
  }
}

// Fungsi untuk merender data di frontend
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

// Fungsi untuk menangani pencarian
function performSearch() {
  const searchTerm = document.getElementById('search-bar').value; 
  fetchMading(searchTerm);
}

// Fungsi untuk menangani event Enter di keyboard
function handleKeydown(event) {
  if (event.key === 'Enter') {
    performSearch();
  }
}

// fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  fetchMading();
  // Tambahkan listener untuk menangani Enter
  const searchInput = document.getElementById('search-bar');
  searchInput.addEventListener('keydown', handleKeydown);
});