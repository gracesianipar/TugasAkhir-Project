// Fungsi untuk mengambil data dari server untuk Home
async function fetchMadingHome() {
  try {
    const response = await fetch('/api/mading-home');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data Home dari server:", data);
    renderMading(data);
  } catch (error) {
    console.error("Error fetching data untuk Home:", error);
  }
}

// Fungsi untuk merender data dengan batas 5 elemen
function renderMading(data) {
  const container = document.getElementById("mading-container");
  container.innerHTML = ""; // Kosongkan kontainer sebelum merender ulang

  const limitedData = data.slice(0, 5); // Ambil hanya 5 elemen terbaru

  limitedData.forEach(item => {
    if (item.judul && item.konten) {
      const card = document.createElement("div");
      card.className = "mading-card";

      const shortContent = item.konten.length > 200
        ? item.konten.slice(0, 100).trim() + "..."
        : item.konten;

      card.innerHTML = `
        <div class="mading-title">${item.judul}</div>
        <div class="mading-image">
          ${item.foto ? `<img src="${item.foto}" alt="Mading Image">` : ''}
        </div>
        <div class="mading-description">${shortContent}</div>
        <div class="mading-meta">
          <span class="user-icon">👤</span>
          <span class="author-text">by admin</span>
        </div>
        <span class="button-view" onclick="window.location.href='/mading-detail?id=${item.id}'">Baca Selengkapnya</span>
      `;
      container.appendChild(card);
    }
  });
}

// Saat halaman Home dimuat
document.addEventListener("DOMContentLoaded", function () {
  fetchMadingHome();
});
