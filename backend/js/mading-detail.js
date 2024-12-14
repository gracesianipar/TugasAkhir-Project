document.addEventListener("DOMContentLoaded", async function () {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id"); // Ambil ID dari query string URL

    if (id) {
      const response = await fetch(`/api/mading-detail?id=${id}`);
      const data = await response.json();

      console.log("Data dari server:", data);

      if (data) {
        // Tampilkan Judul
        document.getElementById("mading-title").innerHTML = `${data.judul}`;
        
        // Tampilkan detail dengan gambar, konten, dan tanggal
        document.getElementById("mading-detail-container").innerHTML = `
          <div class="content-detail">
            ${data.foto ? `<img src="${data.foto}" alt="${data.judul}" class="mading-image">` : ''}
            <div class="mading-meta">
              <p class="mading-date"><i class="fa fa-calendar"></i> ${new Date(data.tanggal).toLocaleDateString()}</p>
            </div>
            <div class="mading-content">
              <p>${data.konten}</p>
            </div>
          </div>
        `;
      } else {
        document.getElementById("mading-title").innerHTML = "Pengumuman tidak ditemukan";
      }
    } else {
      document.getElementById("mading-title").innerHTML = "ID tidak valid";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("mading-title").innerHTML = "Terjadi kesalahan saat memuat data";
  }
});
