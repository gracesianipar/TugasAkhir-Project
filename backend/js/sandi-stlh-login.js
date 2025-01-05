document.addEventListener("DOMContentLoaded", function() {
  const role = document.getElementById('role').textContent.trim();
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  document.getElementById('resetPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Validasi jika password dan konfirmasi password tidak cocok
    if (newPassword.value !== confirmPassword.value) {
      alert('Password dan konfirmasi password tidak cocok!');
      return;
    }

    if (!newPassword.value || !confirmPassword.value) {
      alert('Password dan konfirmasi password tidak boleh kosong!');
      return;
    }

    console.log('New Password:', newPassword.value);  // Debugging
    console.log('Confirm Password:', confirmPassword.value);  // Debugging

    try {
      const response = await fetch('/reset-password-after-login', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: newPassword.value,
          confirmPassword: confirmPassword.value
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      alert('Terjadi kesalahan saat mengatur ulang password');
    }
  });
});