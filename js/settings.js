/**
 * Account Settings Page - Integrated with backend API
 */

document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profile-form');
  const securityForm = document.getElementById('security-form');
  const deleteBtn = document.getElementById('delete-account-btn');

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const displayName = document.getElementById('display-name')?.value || '';
      const username = document.getElementById('username')?.value || '';
      const bio = document.getElementById('bio')?.value || '';

      try {
        const res = await fetch('/api/settings/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName, username, bio })
        });

        const data = await res.json();

        if (res.ok) {
          alert('Profile changes saved!');
        } else {
          alert(data.error || 'Failed to save profile changes.');
        }
      } catch (err) {
        console.error('Profile update error:', err);
        alert('An error occurred while saving.');
      }
    });
  }

  if (securityForm) {
    securityForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email')?.value || '';
      const currentPassword = document.getElementById('current-password')?.value || '';
      const newPassword = document.getElementById('new-password')?.value || '';
      const confirmPassword = document.getElementById('confirm-password')?.value || '';

      if (newPassword && newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
      }

      try {
        const res = await fetch('/api/settings/security', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, currentPassword, newPassword })
        });

        const data = await res.json();

        if (res.ok) {
          alert('Security settings updated!');
        } else {
          alert(data.error || 'Failed to update security settings.');
        }
      } catch (err) {
        console.error('Security update error:', err);
        alert('An error occurred while updating security.');
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
          const res = await fetch('/api/settings/account', { method: 'DELETE' });
          const data = await res.json();

          if (res.ok) {
            alert('Account deleted successfully.');
            window.location.href = '../index.html';
          } else {
            alert(data.error || 'Failed to delete account.');
          }
        } catch (err) {
          console.error('Delete account error:', err);
          alert('An error occurred while deleting the account.');
        }
      }
    });
  }
});
