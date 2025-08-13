// Birthday Countdown Script
// Set your target date and time here (August 16, 2025 at 6 PM)
// const TARGET_DATE = new Date('2025-08-16T18:00:00').getTime();
const TARGET_DATE = new Date('2025-08-11T24:00:00').getTime();

// For testing purposes, uncomment the line below to set countdown to 2 minutes from now
// const TARGET_DATE = new Date().getTime() + (2 * 60 * 1000);

// DOM Elements
const countdownSection = document.getElementById('countdown-section');
const surpriseSection = document.getElementById('surprise-section');
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const visitorCountElement = document.getElementById('visitor-count');
const partyBtn = document.getElementById('party-btn');
const shareBtn = document.getElementById('share-btn');
const confettiElement = document.querySelector('.confetti');
const celebrationAudio = document.getElementById('celebration-audio');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Birthday Countdown App Started!');
    
    // Update visitor count
    updateVisitorCount();
    
    // Start countdown timer
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Add event listeners
    setupEventListeners();
    
    // Check if it's already time for the surprise
    checkIfSurpriseTime();
});

// Main countdown function
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = TARGET_DATE - now;
    
    if (timeLeft <= 0) {
        // Countdown finished - show surprise!
        showSurprise();
        return;
    }
    
    // Calculate time units
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Update display with animation
    updateTimeDisplay(daysElement, days);
    updateTimeDisplay(hoursElement, hours);
    updateTimeDisplay(minutesElement, minutes);
    updateTimeDisplay(secondsElement, seconds);
    
    // Add pulse effect when time changes
    if (seconds === 0) {
        addPulseEffect();
    }
}

// Update individual time display with animation
function updateTimeDisplay(element, value) {
    const formattedValue = value.toString().padStart(2, '0');
    
    if (element.textContent !== formattedValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#FCD34D';
        
        setTimeout(() => {
            element.textContent = formattedValue;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 150);
    }
}

// Add pulse effect to countdown
function addPulseEffect() {
    const timeUnits = document.querySelectorAll('.time-unit');
    timeUnits.forEach(unit => {
        unit.style.animation = 'none';
        setTimeout(() => {
            unit.style.animation = 'pulse 0.6s ease-in-out';
        }, 10);
    });
}

// Show the birthday surprise
function showSurprise() {
    console.log('🎉 SURPRISE TIME! 🎉');
    
    // Hide countdown, show surprise
    countdownSection.classList.add('hidden');
    surpriseSection.classList.remove('hidden');
    
    // Play celebration effects
    setTimeout(() => {
        startConfetti();
        playCelebrationSound();
    }, 500);
    
    // Update visitor count for surprise page
    updateVisitorCount(true);
    
    // 🚀 NEW: Send automatic birthday SMS to all subscribers
    setTimeout(() => {
        sendAutomaticBirthdayAlert();
    }, 1000); // Wait 2 seconds for page transition
}

async function sendAutomaticBirthdayAlert() {
    console.log('📱 Starting automatic birthday SMS alert...');
    
    try {
        // Show a notification that SMS is being sent
        showNotification('🎂 Sending birthday surprise SMS to all subscribers...', 'info');
        
        const response = await fetch('/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                testMode: false, // REAL SMS sending
                message: `Birthday surprise ready! ${window.location.origin}`
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Automatic SMS sent successfully!', result);
            showNotification(`🎉 Birthday surprise SMS sent to ${result.data?.totalSent || 0} people!`, 'success');
            
            // Optional: Show celebration message on the page
            setTimeout(() => {
                showBirthdayAlert(result.data?.totalSent || 0);
            }, 1000);
            
        } else {
            console.error('❌ Automatic SMS failed:', result);
            showNotification('⚠️ SMS sending failed, but the surprise is still live!', 'warning');
        }
        
    } catch (error) {
        console.error('❌ Error sending automatic SMS:', error);
        showNotification('⚠️ SMS sending encountered an error, but the surprise is still live!', 'warning');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'linear-gradient(45deg, #059669, #10B981)',
        warning: 'linear-gradient(45deg, #D97706, #F59E0B)', 
        info: 'linear-gradient(45deg, #8B5CF6, #F59E0B)',
        error: 'linear-gradient(45deg, #DC2626, #EF4444)'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        z-index: 10001;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        font-weight: 500;
        font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 8000);
}

// 🆕 ADD this function to show birthday alert on the page:
function showBirthdayAlert(sentCount) {
    const alertDiv = document.createElement('div');
    alertDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #8B5CF6, #F59E0B);
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            max-width: 400px;
        ">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">🎂 Birthday Alert Sent!</h2>
            <p style="margin: 0; font-size: 16px;">
                Successfully notified <strong>${sentCount}</strong> people about the birthday surprise! 🎉
            </p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 20px;
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
            ">Close</button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 10000);
}

// Check if it's already surprise time (for direct visits)
function checkIfSurpriseTime() {
    const now = new Date().getTime();
    if (now >= TARGET_DATE) {
        showSurprise();
    }
}

// Visitor counter functionality
async function updateVisitorCount(isSurprise = false) {
    try {
        // Get real subscriber count from API
        const response = await fetch('/api/subscribe');
        const result = await response.json();
        
        let realCount = 0;
        if (result.success && result.data) {
            realCount = result.data.totalSubscribers || 0;
        }
        
        if (visitorCountElement) {
            animateCounter(visitorCountElement, realCount);
        }
        
        console.log('🎯 Real subscriber count:', realCount);
        
    } catch (error) {
        console.log('Could not fetch real subscriber count, using fallback');
        
        // Fallback to localStorage if API fails
        try {
            const storageKey = isSurprise ? 'birthdayVisitors' : 'countdownVisitors';
            let visitors = parseInt(localStorage.getItem(storageKey) || '0');
            const lastVisit = localStorage.getItem(`${storageKey}LastVisit`);
            const today = new Date().toDateString();
            
            if (lastVisit !== today) {
                visitors++;
                localStorage.setItem(storageKey, visitors.toString());
                localStorage.setItem(`${storageKey}LastVisit`, today);
            }
            
            if (visitorCountElement) {
                animateCounter(visitorCountElement, visitors);
            }
        } catch (fallbackError) {
            if (visitorCountElement) {
                visitorCountElement.textContent = '🎉';
            }
        }
    }
}

// Animate counter numbers
function animateCounter(element, targetValue) {
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Setup event listeners
function setupEventListeners() {
    // Party button
    if (partyBtn) {
        partyBtn.addEventListener('click', startPartyMode);
    }
    
    // Share button
    if (shareBtn) {
        shareBtn.addEventListener('click', shareWebsite);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && !countdownSection.classList.contains('hidden')) {
            event.preventDefault();
            // Secret: Press space to test surprise mode
            showSurprise();
        }
    });
    
    // Auto-refresh countdown page every minute to sync time
    if (!countdownSection.classList.contains('hidden')) {
        setInterval(() => {
            // Refresh if countdown is still showing
            if (!countdownSection.classList.contains('hidden')) {
                const now = new Date().getTime();
                if (now >= TARGET_DATE) {
                    location.reload();
                }
            }
        }, 60000); // Check every minute
    }
}

// Party mode with confetti and effects
function startPartyMode() {
    console.log('🎊 PARTY MODE ACTIVATED! 🎊');
    
    // Add party class to body
    document.body.classList.add('party-active');
    
    // Start confetti
    startConfetti();
    
    // Play sound
    playCelebrationSound();
    
    // Change button text
    partyBtn.textContent = '🎉 PARTY ON! 🎉';
    partyBtn.style.background = 'linear-gradient(45deg, #8B5CF6, #F59E0B, #EC4899)';
    
    // Create floating emojis
    createFloatingEmojis();
    
    // Reset after 5 seconds
    setTimeout(() => {
        document.body.classList.remove('party-active');
        partyBtn.textContent = '🎉 Start the Party! 🎉';
        partyBtn.style.background = '';
        stopConfetti();
    }, 5000);
}

// Confetti animation
function startConfetti() {
    if (!confettiElement) return;
    
    confettiElement.classList.add('active');
    
    // Create multiple confetti pieces
    for (let i = 0; i < 50; i++) {
        createConfettiPiece();
    }
}

function stopConfetti() {
    if (confettiElement) {
        confettiElement.classList.remove('active');
        confettiElement.innerHTML = '';
    }
}

function createConfettiPiece() {
    const colors = ['#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6'];
    const confetti = document.createElement('div');
    
    confetti.style.position = 'absolute';
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = confetti.style.width;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear infinite`;
    confetti.style.animationDelay = Math.random() * 2 + 's';
    
    if (confettiElement) {
        confettiElement.appendChild(confetti);
    }
    
    // Remove after animation
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 5000);
}

// Create floating birthday emojis
function createFloatingEmojis() {
    const emojis = ['🎂', '🎈', '🎁', '🎊', '🌟', '💖', '🎵', '✨'];
    const container = document.body;
    
    for (let i = 0; i < 20; i++) {
        const emoji = document.createElement('div');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.position = 'fixed';
        emoji.style.fontSize = Math.random() * 20 + 20 + 'px';
        emoji.style.left = Math.random() * window.innerWidth + 'px';
        emoji.style.top = window.innerHeight + 'px';
        emoji.style.pointerEvents = 'none';
        emoji.style.zIndex = '1000';
        emoji.style.animation = `floatUp ${Math.random() * 3 + 3}s ease-out forwards`;
        
        container.appendChild(emoji);
        
        // Remove after animation
        setTimeout(() => {
            if (emoji.parentNode) {
                emoji.parentNode.removeChild(emoji);
            }
        }, 6000);
    }
}

// Play celebration sound
function playCelebrationSound() {
    try {
        if (celebrationAudio) {
            celebrationAudio.volume = 0.3;
            celebrationAudio.play().catch(e => {
                console.log('Audio play failed (user interaction required)');
            });
        }
    } catch (error) {
        console.log('Audio not available');
    }
}

// Share website functionality
function shareWebsite() {
    const shareData = {
        title: '🎉 Birthday Surprise!',
        text: 'Check out this amazing birthday surprise website!',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

// Fallback share function
function fallbackShare() {
    const url = window.location.href;
    const text = 'Check out this amazing birthday surprise! ' + url;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showShareNotification('Link copied to clipboard!');
        }).catch(() => {
            promptShare(text);
        });
    } else {
        promptShare(text);
    }
}

function promptShare(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showShareNotification('Link copied to clipboard!');
    } catch (err) {
        showShareNotification('Share this link: ' + window.location.href);
    }
    
    document.body.removeChild(textArea);
}

function showShareNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = 'linear-gradient(45deg, #8B5CF6, #F59E0B)';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '10px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for floating emojis and notifications
const additionalStyles = `
@keyframes floatUp {
    from {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    to {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}
`;

// Add the additional styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Console Easter Egg
console.log(`
🎉 BIRTHDAY COUNTDOWN ACTIVATED! 🎉

Target Date: ${new Date(TARGET_DATE).toLocaleString()}
Time Remaining: Calculating...

Secret Commands:
- Press SPACE to preview surprise mode
- Check the console for updates!

Made with 💜 and ✨
`);

// Development helper functions
window.birthdayDebug = {
    showSurprise: () => showSurprise(),
    startParty: () => startPartyMode(),
    resetVisitors: () => {
        localStorage.removeItem('countdownVisitors');
        localStorage.removeItem('birthdayVisitors');
        localStorage.removeItem('countdownVisitorsLastVisit');
        localStorage.removeItem('birthdayVisitorsLastVisit');
        location.reload();
    },
    setTestCountdown: (minutes = 2) => {
        window.TARGET_DATE = new Date().getTime() + (minutes * 60 * 1000);
        console.log(`Test countdown set to ${minutes} minutes from now`);
        location.reload();
    }
};

console.log('Debug commands available: window.birthdayDebug');
