// elemen untuk mendapatkan id
const profileIcon = document.getElementById('profile-icon');
const profileMenu = document.getElementById('profile-menu');

// fungsi untuk menangani klik pada ikon profil
profileIcon.addEventListener('click', () => {
    // toggle (menampilkan/menyembunyikan) menu
    profileMenu.style.display = (profileMenu.style.display === 'block') ? 'none' : 'block';
});

// fungsi untuk menyembunyikan menu jika klik di luar pop-up menu
document.addEventListener('click', (event) => {
    if (!profileMenu.contains(event.target) && event.target !== profileIcon) {
        profileMenu.style.display = 'none';
    }
});