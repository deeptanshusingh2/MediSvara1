// Authentication functionality for MediSvara

// DOM Elements
const authModal = document.getElementById('auth-modal');
const authTitle = document.getElementById('auth-title');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Show authentication modal
function showAuth(type = 'login') {
    authModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    if (type === 'login') {
        authTitle.textContent = 'Welcome Back';
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        authTitle.textContent = 'Join MediSvara';
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = authModal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Close authentication modal
function closeAuth() {
    authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Clear forms
    loginForm.reset();
    signupForm.reset();
}

// Switch between login and signup
function switchAuth(type) {
    if (type === 'login') {
        authTitle.textContent = 'Welcome Back';
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        authTitle.textContent = 'Join MediSvara';
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

// Handle login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate login process (in real app, this would be an API call)
    showLoadingState(loginForm);
    
    setTimeout(() => {
        // For demo purposes, any email/password combination works
        if (email && password) {
            const user = {
                id: generateUserId(),
                email: email,
                name: email.split('@')[0], // Use email prefix as name
                university: 'Demo University',
                loginTime: new Date().toISOString()
            };
            
            // Save user to localStorage
            localStorage.setItem('medisvara_user', JSON.stringify(user));
            
            // Update UI
            updateNavigationForLoggedInUser(user);
            
            showNotification('Login successful! Welcome back.', 'success');
            closeAuth();
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                showDashboard();
            }, 500);
        } else {
            showNotification('Invalid credentials. Please try again.', 'error');
        }
        
        hideLoadingState(loginForm);
    }, 1000);
});

// Handle signup form submission
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const university = document.getElementById('signup-university').value;
    const password = document.getElementById('signup-password').value;
    
    // Basic validation
    if (!name || !email || !university || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate signup process
    showLoadingState(signupForm);
    
    setTimeout(() => {
        const user = {
            id: generateUserId(),
            name: name,
            email: email,
            university: university,
            signupTime: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Save user to localStorage
        localStorage.setItem('medisvara_user', JSON.stringify(user));
        
        // Initialize user data
        initializeUserData(user);
        
        showNotification(`Welcome to MediSvara, ${name}!`, 'success');
        closeAuth();
        
        // Show onboarding or dashboard
        setTimeout(() => {
            showDashboard();
        }, 500);
        
        hideLoadingState(signupForm);
    }, 1000);
});

// Show loading state on form
function showLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Please wait...';
        submitBtn.style.opacity = '0.7';
    }
}

// Hide loading state on form
function hideLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        
        // Reset button text based on form type
        if (form.id === 'login-form') {
            submitBtn.textContent = 'Sign In';
        } else {
            submitBtn.textContent = 'Create Account';
        }
    }
}

// Update navigation for logged in user
function updateNavigationForLoggedInUser(user) {
    const navMenu = document.getElementById('nav-menu');
    const authLinks = navMenu.querySelectorAll('.auth-btn, .signup-btn');
    
    // Remove auth buttons
    authLinks.forEach(link => {
        const listItem = link.closest('.nav-item');
        if (listItem) {
            listItem.style.display = 'none';
        }
    });
    
    // Add user menu (simplified for demo)
    const userMenuItem = document.createElement('li');
    userMenuItem.className = 'nav-item';
    userMenuItem.innerHTML = `
        <a href="#" class="nav-link" onclick="showDashboard()">Dashboard</a>
    `;
    navMenu.appendChild(userMenuItem);
    
    const logoutMenuItem = document.createElement('li');
    logoutMenuItem.className = 'nav-item';
    logoutMenuItem.innerHTML = `
        <a href="#" class="nav-link" onclick="logout()">Logout</a>
    `;
    navMenu.appendChild(logoutMenuItem);
}

// Initialize user data with default values
function initializeUserData(user) {
    // Initialize mood data
    if (!localStorage.getItem('medisvara_mood_data')) {
        const initialMoodData = [];
        localStorage.setItem('medisvara_mood_data', JSON.stringify(initialMoodData));
    }
    
    // Initialize daily check-ins
    if (!localStorage.getItem('medisvara_checkins')) {
        const initialCheckins = [];
        localStorage.setItem('medisvara_checkins', JSON.stringify(initialCheckins));
    }
    
    // Initialize user preferences
    const userPreferences = {
        breathingDuration: 5, // minutes
        dailyReminders: true,
        anonymousMode: false
    };
    localStorage.setItem('medisvara_preferences', JSON.stringify(userPreferences));
}

// Show dashboard
function showDashboard() {
    // Hide landing page sections
    const landingSections = document.querySelectorAll('.hero, .features, .about, .testimonials');
    landingSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    dashboard.classList.add('active');
    
    // Show dashboard home by default
    showDashboardSection('dashboard-home');
    
    // Update browser URL (simplified)
    if (history.pushState) {
        history.pushState(null, null, '#dashboard');
    }
}

// Logout function
function logout() {
    // Clear user data
    localStorage.removeItem('medisvara_user');
    
    // Reset UI
    location.reload(); // Simple way to reset everything
}

// Utility functions
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('medisvara_user') || 'null');
    
    if (user) {
        updateNavigationForLoggedInUser(user);
        
        // Update user name in dashboard if present
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = `Welcome back, ${user.name}!`;
        }
    }
});

// Close modal when clicking outside
authModal.addEventListener('click', function(e) {
    if (e.target === authModal) {
        closeAuth();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && authModal.style.display === 'block') {
        closeAuth();
    }
});

// Export functions for global use
window.showAuth = showAuth;
window.closeAuth = closeAuth;
window.switchAuth = switchAuth;
window.logout = logout;
window.showDashboard = showDashboard;