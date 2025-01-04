document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');

  if (role) {
    console.log('Role ditemukan:', role);

    // penanganan form berdasarkan role
    document.getElementById('reset-password-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;

        if (!email) {
            alert('Email harus diisi!');
            return;
        }

        fetch(`/api/reset-password/${role}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            alert(`Link reset password telah dikirim ke email ${email} (${data.name})`);
            console.log('Role:', role);
            console.log('Email:', data.email);
            console.log('Nama Pengguna:', data.name);
          } else {
            alert('Terjadi kesalahan, pastikan email yang dimasukkan benar.');
          }
        })
        .catch(error => {
          console.error('Error:', error); s
          alert('Terjadi kesalahan: ' + error.message);
        });        
    });

  } else {
      alert('Role tidak ditemukan!');
  }
});