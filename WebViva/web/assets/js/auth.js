// auth.js
// Handles authentication and logout logic for Artmart

function checkLoginStatus(onSuccess, onFailure) {
    fetch('session-status')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                if (typeof onSuccess === 'function') onSuccess(data);
            } else {
                if (typeof onFailure === 'function') onFailure();
                else window.location.href = 'login.html';
            }
        })
        .catch(() => {
            if (typeof onFailure === 'function') onFailure();
            else window.location.href = 'login.html';
        });
}

function logout() {
    fetch('logout', { method: 'POST' })
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(() => {
            window.location.href = 'index.html';
        });
}

// Usage example (in your HTML):
// <script src="assets/js/auth.js"></script>
// document.addEventListener('DOMContentLoaded', function() {
//     checkLoginStatus();
// });
