/**
 * Account Settings Page - UI handlers (no backend integration yet)
 */

document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profile-form');
  const securityForm = document.getElementById('security-form');
  const deleteBtn = document.getElementById('delete-account-btn');

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: Integrate with backend
      alert('Profile changes saved (UI only - no backend).');
    });
  }

  if (securityForm) {
    securityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: Integrate with backend
      alert('Security settings updated (UI only - no backend).');
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // TODO: Integrate with backend
        alert('Account deletion requested (UI only - no backend).');
      }
    });
  }
});
