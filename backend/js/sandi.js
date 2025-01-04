document.getElementById('resetPasswordForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const role = document.getElementById('role').innerText; 
  const email = document.getElementById('email').innerText; 

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (!role || !email) {
    alert('Role and email are required');
    return;
  }

  try {
    // mengirim data ke server untuk reset (mengatur ulang) sandi
    const response = await fetch(`/reset-password/${role}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, newPassword, confirmPassword })
    });

    const data = await response.json();

if (data.success) {
  alert('Password berhasil diubah');
} else {
  alert(data.message);
}

  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});