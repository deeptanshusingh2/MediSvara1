// Mood Tracker functionality for MediSvara

let selectedMood = 0;

// Initialize mood tracker
function initializeMoodTracker() {
    setupMoodButtons();
    loadMoodHistory();
    drawMoodChart();
}

// Setup mood selection buttons
function setupMoodButtons() {
    const moodBtns = document.querySelectorAll('.mood-btn');
    
    moodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            moodBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Store selected mood
            selectedMood = parseInt(this.dataset.mood);
        });
    });
}

// Log mood function
function logMood() {
    if (selectedMood === 0) {
        showNotification('Please select a mood first', 'error');
        return;
    }
    
    const moodEntry = {
        id: Date.now(),
        mood: selectedMood,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    };
    
    // Get existing mood data
    const existingData = JSON.parse(localStorage.getItem('medisvara_mood_data') || '[]');
    
    // Check if there's already an entry for today
    const today = new Date().toISOString().split('T')[0];
    const existingTodayEntry = existingData.find(entry => entry.date === today);
    
    if (existingTodayEntry) {
        // Update existing entry
        const index = existingData.findIndex(entry => entry.date === today);
        existingData[index] = moodEntry;
        showNotification('Today\'s mood updated successfully!', 'success');
    } else {
        // Add new entry
        existingData.push(moodEntry);
        showNotification('Mood logged successfully!', 'success');
    }
    
    // Keep only last 30 days
    if (existingData.length > 30) {
        existingData.sort((a, b) => new Date(b.date) - new Date(a.date));
        existingData.splice(30);
    }
    
    // Save to localStorage
    localStorage.setItem('medisvara_mood_data', JSON.stringify(existingData));
    
    // Reset selection
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    selectedMood = 0;
    
    // Redraw chart
    drawMoodChart();
    
    // Show insights
    showMoodInsights(existingData);
}

// Load mood history
function loadMoodHistory() {
    const moodData = JSON.parse(localStorage.getItem('medisvara_mood_data') || '[]');
    
    // If no data, create some sample data for demo
    if (moodData.length === 0) {
        const sampleData = generateSampleMoodData();
        localStorage.setItem('medisvara_mood_data', JSON.stringify(sampleData));
    }
}

// Generate sample mood data for demo
function generateSampleMoodData() {
    const sampleData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        sampleData.push({
            id: Date.now() + i,
            mood: Math.floor(Math.random() * 3) + 3, // Random mood between 3-5
            date: date.toISOString().split('T')[0],
            timestamp: date.toISOString()
        });
    }
    
    return sampleData;
}

// Draw mood chart
function drawMoodChart() {
    const canvas = document.getElementById('mood-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const moodData = JSON.parse(localStorage.getItem('medisvara_mood_data') || '[]');
    
    // Sort data by date
    moodData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get last 7 days
    const last7Days = moodData.slice(-7);
    
    // Prepare data for chart
    const labels = last7Days.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en', { weekday: 'short' });
    });
    
    const moods = last7Days.map(entry => entry.mood);
    
    // Draw chart
    drawChart(ctx, canvas, moods, labels);
}

// Enhanced chart drawing function
function drawChart(ctx, canvas, data, labels) {
    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    
    // Scale the canvas for crisp rendering
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const padding = 40;
    const chartWidth = canvasWidth - padding * 2;
    const chartHeight = canvasHeight - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Set styles
    ctx.font = '12px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw background
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid
    drawGrid(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight);
    
    // Draw data
    if (data.length > 0) {
        drawMoodLine(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight, data);
        drawMoodPoints(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight, data);
    }
    
    // Draw labels
    drawLabels(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight, labels);
    
    // Draw mood scale
    drawMoodScale(ctx, canvasHeight, padding, chartHeight);
}

function drawGrid(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight) {
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (for mood levels)
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvasWidth - padding, y);
        ctx.stroke();
    }
    
    // Vertical grid lines (for days)
    for (let i = 0; i <= 6; i++) {
        const x = padding + (i / 6) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvasHeight - padding);
        ctx.stroke();
    }
}

function drawMoodLine(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight, data) {
    if (data.length < 2) return;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = canvasHeight - padding - ((data[i] - 1) / 4) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Add area fill
    ctx.lineTo(padding + chartWidth, canvasHeight - padding);
    ctx.lineTo(padding, canvasHeight - padding);
    ctx.closePath();
    
    const areaGradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding);
    areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    areaGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    
    ctx.fillStyle = areaGradient;
    ctx.fill();
}

function drawMoodPoints(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight, data) {
    for (let i = 0; i < data.length; i++) {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = canvasHeight - padding - ((data[i] - 1) / 4) * chartHeight;
        
        // Draw outer circle (shadow)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw main point
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw inner highlight
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawLabels(ctx, canvasWidth, canvasHeight, padding, chartWidth, chartHeight, labels) {
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Poppins';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < labels.length; i++) {
        const x = padding + (i / (labels.length - 1)) * chartWidth;
        ctx.fillText(labels[i], x, canvasHeight - 15);
    }
}

function drawMoodScale(ctx, canvasHeight, padding, chartHeight) {
    const emotions = ['😢', '😔', '😐', '😊', '😁'];
    const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
    
    ctx.fillStyle = '#64748B';
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < emotions.length; i++) {
        const y = canvasHeight - padding - (i / 4) * chartHeight;
        
        // Draw emoji
        ctx.fillText(emotions[i], 20, y);
        
        // Draw label (smaller text)
        ctx.font = '10px Poppins';
        ctx.fillStyle = '#9CA3AF';
        ctx.textAlign = 'left';
        ctx.fillText(moodLabels[i], 35, y);
        ctx.textAlign = 'center';
        ctx.font = '16px Poppins';
        ctx.fillStyle = '#64748B';
    }
}

// Show mood insights
function showMoodInsights(moodData) {
    if (moodData.length < 3) return;
    
    // Calculate average mood
    const averageMood = moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length;
    
    // Find trend
    const recentMoods = moodData.slice(-3).map(entry => entry.mood);
    const trend = recentMoods[recentMoods.length - 1] - recentMoods[0];
    
    let trendText = '';
    if (trend > 0) {
        trendText = 'Your mood has been improving! 📈';
    } else if (trend < 0) {
        trendText = 'Consider some self-care activities. 💙';
    } else {
        trendText = 'Your mood has been stable. 😌';
    }
    
    const insightText = `Average mood: ${averageMood.toFixed(1)}/5. ${trendText}`;
    
    setTimeout(() => {
        showNotification(insightText, 'info');
    }, 2000);
}

// Initialize mood tracker when the section is shown
document.addEventListener('DOMContentLoaded', function() {
    const moodTrackerSection = document.getElementById('mood-tracker');
    if (moodTrackerSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' && 
                    moodTrackerSection.classList.contains('active')) {
                    initializeMoodTracker();
                }
            });
        });
        
        observer.observe(moodTrackerSection, { attributes: true });
    }
});

// Export function
window.logMood = logMood;