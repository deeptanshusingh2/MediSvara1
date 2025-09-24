// Dashboard functionality for MediSvara

// Dashboard navigation
function showDashboardSection(sectionId) {
    // Hide all dashboard sections
    const dashboardSections = document.querySelectorAll('.dashboard-content');
    dashboardSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update URL hash (optional)
    if (history.replaceState) {
        history.replaceState(null, null, `#${sectionId}`);
    }
}

// Daily Check-in functionality
function setupDailyCheckin() {
    const ratingBtns = document.querySelectorAll('.rating-btn');
    const emotionTags = document.querySelectorAll('.emotion-tag');
    let selectedRating = 0;
    let selectedEmotions = [];
    
    // Rating buttons
    ratingBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            ratingBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedRating = parseInt(this.dataset.rating);
        });
    });
    
    // Emotion tags
    emotionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
            const emotion = this.textContent;
            
            if (selectedEmotions.includes(emotion)) {
                selectedEmotions = selectedEmotions.filter(e => e !== emotion);
            } else {
                selectedEmotions.push(emotion);
            }
        });
    });
    
    // Save check-in function
    window.saveCheckin = function() {
        if (selectedRating === 0) {
            showNotification('Please select a rating for your day', 'error');
            return;
        }
        
        const notes = document.getElementById('daily-notes').value;
        const checkin = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            rating: selectedRating,
            emotions: selectedEmotions,
            notes: notes,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const existingCheckins = JSON.parse(localStorage.getItem('medisvara_checkins') || '[]');
        
        // Check if already checked in today
        const today = new Date().toISOString().split('T')[0];
        const existingTodayCheckin = existingCheckins.find(c => c.date === today);
        
        if (existingTodayCheckin) {
            // Update existing check-in
            const index = existingCheckins.findIndex(c => c.date === today);
            existingCheckins[index] = checkin;
            showNotification('Today\'s check-in updated successfully!', 'success');
        } else {
            // Add new check-in
            existingCheckins.push(checkin);
            showNotification('Daily check-in saved successfully!', 'success');
        }
        
        localStorage.setItem('medisvara_checkins', JSON.stringify(existingCheckins));
        
        // Reset form
        ratingBtns.forEach(b => b.classList.remove('active'));
        emotionTags.forEach(t => t.classList.remove('active'));
        document.getElementById('daily-notes').value = '';
        selectedRating = 0;
        selectedEmotions = [];
        
        // Go back to dashboard after a delay
        setTimeout(() => {
            showDashboardSection('dashboard-home');
        }, 1500);
    };
}

// Anonymous Chat functionality
function setupAnonymousChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input-field');
    
    // Load existing messages
    loadChatMessages();
    
    // Send message function
    window.sendMessage = function() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        const newMessage = {
            id: Date.now(),
            content: message,
            avatar: getRandomAvatar(),
            timestamp: new Date().toISOString(),
            isOwn: true
        };
        
        // Add message to chat
        addMessageToChat(newMessage);
        
        // Save to localStorage
        const existingMessages = JSON.parse(localStorage.getItem('medisvara_chat_messages') || '[]');
        existingMessages.push(newMessage);
        
        // Keep only last 50 messages
        if (existingMessages.length > 50) {
            existingMessages.splice(0, existingMessages.length - 50);
        }
        
        localStorage.setItem('medisvara_chat_messages', JSON.stringify(existingMessages));
        
        // Clear input
        chatInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        showNotification('Message sent anonymously', 'success');
    };
    
    // Enter key to send
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function loadChatMessages() {
    const chatMessages = document.getElementById('chat-messages');
    const messages = JSON.parse(localStorage.getItem('medisvara_chat_messages') || '[]');
    
    // Clear existing messages except demo ones
    const demoMessages = chatMessages.querySelectorAll('.chat-message');
    // Keep demo messages for now
    
    // Add stored messages
    messages.forEach(message => {
        if (!message.isDemo) {
            addMessageToChat(message);
        }
    });
    
    // Scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function addMessageToChat(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    
    const timeAgo = formatTimeAgo(new Date(message.timestamp));
    
    messageElement.innerHTML = `
        <div class="message-avatar">${message.avatar}</div>
        <div class="message-content">
            <p>${escapeHtml(message.content)}</p>
            <span class="message-time">${timeAgo}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
}

function getRandomAvatar() {
    const avatars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Profile management
function setupProfile() {
    const user = JSON.parse(localStorage.getItem('medisvara_user'));
    if (!user) return;
    
    // Populate profile form
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-university').value = user.university || '';
    
    // Save profile function
    window.saveProfile = function() {
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const university = document.getElementById('profile-university').value.trim();
        const year = document.getElementById('profile-year').value;
        
        if (!name || !email || !university) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Update user object
        const updatedUser = {
            ...user,
            name: name,
            email: email,
            university: university,
            year: year,
            lastUpdated: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('medisvara_user', JSON.stringify(updatedUser));
        
        // Update UI
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = `Welcome back, ${name}!`;
        }
        
        showNotification('Profile updated successfully!', 'success');
        
        // Go back to dashboard after a delay
        setTimeout(() => {
            showDashboardSection('dashboard-home');
        }, 1500);
    };
}

// Counselor booking (simplified)
function setupCounselor() {
    const bookButtons = document.querySelectorAll('.counselor-card .btn-primary');
    
    bookButtons.forEach(button => {
        button.addEventListener('click', function() {
            const counselorCard = this.closest('.counselor-card');
            const counselorName = counselorCard.querySelector('h3').textContent;
            
            // In a real app, this would open a booking modal or redirect to a booking page
            showNotification(`Booking request sent to ${counselorName}. You'll receive a confirmation email soon.`, 'success');
            
            // Simulate booking
            setTimeout(() => {
                showNotification(`${counselorName} has confirmed your session for tomorrow at 2:00 PM`, 'success');
            }, 3000);
        });
    });
}

// Dashboard statistics and insights
function updateDashboardStats() {
    const user = JSON.parse(localStorage.getItem('medisvara_user'));
    const checkins = JSON.parse(localStorage.getItem('medisvara_checkins') || '[]');
    const moodData = JSON.parse(localStorage.getItem('medisvara_mood_data') || '[]');
    
    if (!user) return;
    
    // Calculate stats
    const totalCheckins = checkins.length;
    const averageRating = checkins.length > 0 ? 
        (checkins.reduce((sum, c) => sum + c.rating, 0) / checkins.length).toFixed(1) : 0;
    
    // You could add these stats to the dashboard home page
    // For now, we'll just log them
    console.log('Dashboard Stats:', {
        totalCheckins,
        averageRating,
        moodEntries: moodData.length
    });
}

// Initialize dashboard when it's shown
function initializeDashboard() {
    setupDailyCheckin();
    setupAnonymousChat();
    setupProfile();
    setupCounselor();
    updateDashboardStats();
}

// Auto-initialize when dashboard becomes active
document.addEventListener('DOMContentLoaded', function() {
    const dashboard = document.getElementById('dashboard');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                dashboard.classList.contains('active')) {
                initializeDashboard();
            }
        });
    });
    
    if (dashboard) {
        observer.observe(dashboard, { attributes: true });
    }
});

// Export functions
window.showDashboardSection = showDashboardSection;