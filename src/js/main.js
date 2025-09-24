// Main JavaScript functionality for MediSvara

// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    setupSmoothScrolling();
    
    // Navbar scroll effect
    setupNavbarScrollEffect();
    
    // Mobile menu toggle
    setupMobileMenu();
    
    // Initialize mood chart if canvas exists
    if (document.getElementById('mood-chart-canvas')) {
        initializeMoodChart();
    }
});

// Smooth scrolling setup
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href !== '#') {
                e.preventDefault();
                scrollToSection(href.substring(1));
            }
        });
    });
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navbarHeight = navbar.offsetHeight;
        const sectionTop = section.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Navbar scroll effect
function setupNavbarScrollEffect() {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    const mobileLinks = navMenu.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Feature card click handlers
function openDashboard(feature) {
    // Check if user is logged in (simple check for demo)
    const isLoggedIn = localStorage.getItem('medisvara_user');
    
    if (!isLoggedIn) {
        showAuth('login');
        return;
    }
    
    // Show dashboard and specific feature
    document.body.style.overflow = 'hidden';
    document.getElementById('dashboard').classList.add('active');
    
    // Hide all dashboard sections first
    const dashboardSections = document.querySelectorAll('.dashboard-content');
    dashboardSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested feature
    const targetSection = document.getElementById(feature);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        // Default to dashboard home
        document.getElementById('dashboard-home').classList.add('active');
    }
}

// Utility functions for animations
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = Math.min(progress / duration, 1);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = Math.max(1 - (progress / duration), 0);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Initialize mood chart with sample data
function initializeMoodChart() {
    const canvas = document.getElementById('mood-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    // Sample mood data (1-5 scale over 7 days)
    const moodData = [3, 4, 2, 5, 3, 4, 4];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    drawMoodChart(ctx, width, height, moodData, days);
}

function drawMoodChart(ctx, width, height, data, labels) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set styles
    ctx.strokeStyle = '#3B82F6';
    ctx.fillStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.font = '12px Poppins';
    ctx.textAlign = 'center';
    
    // Draw grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= labels.length - 1; i++) {
        const x = padding + (i / (labels.length - 1)) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((data[i] - 1) / 4) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#3B82F6';
    for (let i = 0; i < data.length; i++) {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((data[i] - 1) / 4) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw labels
    ctx.fillStyle = '#64748B';
    for (let i = 0; i < labels.length; i++) {
        const x = padding + (i / (labels.length - 1)) * chartWidth;
        ctx.fillText(labels[i], x, height - 10);
    }
    
    // Draw Y-axis labels
    const emotions = ['😢', '😔', '😐', '😊', '😁'];
    for (let i = 0; i < emotions.length; i++) {
        const y = height - padding - (i / 4) * chartHeight;
        ctx.fillText(emotions[i], 20, y + 5);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Local Storage utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
}

// Initialize app
function initializeApp() {
    // Check if user is logged in
    const user = getFromLocalStorage('medisvara_user');
    if (user) {
        updateUIForLoggedInUser(user);
    }
    
    // Initialize other components
    setupNotifications();
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const userName = document.getElementById('user-name');
    if (userName && user.name) {
        userName.textContent = `Welcome back, ${user.name}!`;
    }
}

// Setup notifications
function setupNotifications() {
    // You can add periodic notifications or reminders here
    // For example, daily check-in reminders
}

// Export functions for use in other files
window.MediSvara = {
    scrollToSection,
    openDashboard,
    showNotification,
    saveToLocalStorage,
    getFromLocalStorage,
    fadeIn,
    fadeOut
};