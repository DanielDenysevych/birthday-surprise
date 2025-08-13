// Enhanced Multi-Step Signup Form Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Birthday Signup Form Loaded! 🎉');
    
    // Initialize the form
    initializeForm();
    updateStats();
    startBackgroundAnimations();
});

// DOM Elements
const form = document.getElementById('signup-form');
const formSteps = document.querySelectorAll('.form-step');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const loadingOverlay = document.getElementById('loading-overlay');

// Form sections
const successSection = document.getElementById('success-section');
const errorSection = document.getElementById('error-section');

// Form inputs
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const consentCheckbox = document.getElementById('consent');

// Buttons
const submitBtn = document.getElementById('submit-btn');
const retryBtn = document.getElementById('retry-btn');
const shareBtn = document.getElementById('share-signup');

// Preview elements
const previewName = document.getElementById('preview-name');
const previewPhone = document.getElementById('preview-phone');
const previewEmail = document.getElementById('preview-email');

// Stats elements
const totalSignupsElement = document.getElementById('total-signups');
const daysLeftElement = document.getElementById('days-left');

// Form state
let currentStep = 1;
const totalSteps = 3;

// Initialize form functionality
function initializeForm() {
    console.log('🎯 Initializing enhanced form...');
    
    // Step navigation
    setupStepNavigation();
    
    // Form submission
    form.addEventListener('submit', handleFormSubmission);
    
    // Input enhancements
    setupInputEnhancements();
    
    // Real-time validation
    setupRealTimeValidation();
    
    // Preview updates
    setupPreviewUpdates();
    
    // Button handlers
    setupButtonHandlers();
    
    // Keyboard navigation
    setupKeyboardNavigation();
    
    console.log('✅ Form initialization complete!');
}

// Step Navigation System
function setupStepNavigation() {
    // Next buttons
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextStep = parseInt(e.target.closest('.next-btn').dataset.next);
            if (validateCurrentStep()) {
                goToStep(nextStep);
            }
        });
    });
    
    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prevStep = parseInt(e.target.closest('.back-btn').dataset.back);
            goToStep(prevStep);
        });
    });
}

function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > totalSteps) return;
    
    console.log(`🚀 Moving to step ${stepNumber}`);
    
    // Hide current step
    formSteps.forEach(step => step.classList.remove('active'));
    
    // Show target step
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
        setTimeout(() => {
            targetStep.classList.add('active');
            
            // Focus first input in step
            const firstInput = targetStep.querySelector('.form-input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
        }, 150);
    }
    
    // Update progress
    updateProgress(stepNumber);
    
    // Update preview if on final step
    if (stepNumber === 3) {
        updatePreview();
    }
    
    currentStep = stepNumber;
}

function updateProgress(step) {
    const percentage = (step / totalSteps) * 100;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `Step ${step} of ${totalSteps}`;
}

// Input Enhancements
function setupInputEnhancements() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // Focus effects
        input.addEventListener('focus', (e) => {
            e.target.closest('.input-wrapper').classList.add('focused');
            playFocusAnimation(e.target);
        });
        
        input.addEventListener('blur', (e) => {
            if (!e.target.value) {
                e.target.closest('.input-wrapper').classList.remove('focused');
            }
            validateField(e.target);
        });
        
        // Input animations
        input.addEventListener('input', (e) => {
            clearFieldError(e.target);
            playTypingAnimation(e.target);
        });
        
        // Check if input has value on load
        if (input.value) {
            input.closest('.input-wrapper').classList.add('focused');
        }
    });
    
    // Special handling for phone number
    phoneInput.addEventListener('input', formatPhoneNumber);
}

function playFocusAnimation(input) {
    const icon = input.parentElement.querySelector('.input-icon');
    if (icon) {
        icon.style.transform = 'translateY(-50%) scale(1.1)';
        icon.style.color = '#F59E0B';
        
        setTimeout(() => {
            icon.style.transform = 'translateY(-50%) scale(1)';
            icon.style.color = '';
        }, 300);
    }
}

function playTypingAnimation(input) {
    const wrapper = input.closest('.input-wrapper');
    wrapper.style.transform = 'scale(1.02)';
    
    setTimeout(() => {
        wrapper.style.transform = 'scale(1)';
    }, 100);
}

// Real-time Validation
function setupRealTimeValidation() {
    nameInput.addEventListener('input', () => validateName(false));
    phoneInput.addEventListener('input', () => validatePhone(false));
    emailInput.addEventListener('input', () => validateEmail(false));
    
    nameInput.addEventListener('blur', () => validateName(true));
    phoneInput.addEventListener('blur', () => validatePhone(true));
    emailInput.addEventListener('blur', () => validateEmail(true));
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return validateName(true);
        case 2:
            return validatePhone(true);
        case 3:
            return validateEmail(true) && validateConsent();
        default:
            return true;
    }
}

function validateName(showError = true) {
    const value = nameInput.value.trim();
    const inputGroup = nameInput.closest('.input-group');
    const feedback = document.getElementById('name-feedback');
    
    if (!value) {
        if (showError) {
            markFieldError(inputGroup, feedback, 'Please enter your name');
        }
        return false;
    }
    
    if (value.length < 2) {
        if (showError) {
            markFieldError(inputGroup, feedback, 'Name must be at least 2 characters');
        }
        return false;
    }
    
    markFieldSuccess(inputGroup, feedback, 'Perfect! 👍');
    return true;
}

function validatePhone(showError = true) {
    const value = phoneInput.value.trim();
    const cleanPhone = value.replace(/\D/g, '');
    const inputGroup = phoneInput.closest('.input-group');
    const feedback = document.getElementById('phone-feedback');
    
    if (!value) {
        if (showError) {
            markFieldError(inputGroup, feedback, 'Phone number is required');
        }
        return false;
    }
    
    if (cleanPhone.length < 10) {
        if (showError) {
            markFieldError(inputGroup, feedback, 'Please enter a valid phone number');
        }
        return false;
    }
    
    markFieldSuccess(inputGroup, feedback, 'Great! We\'ll send SMS here 📱');
    return true;
}

function validateEmail(showError = true) {
    const value = emailInput.value.trim();
    const inputGroup = emailInput.closest('.input-group');
    const feedback = document.getElementById('email-feedback');
    
    if (!value) {
        markFieldSuccess(inputGroup, feedback, 'Email is optional');
        return true;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
        if (showError) {
            markFieldError(inputGroup, feedback, 'Please enter a valid email address');
        }
        return false;
    }
    
    markFieldSuccess(inputGroup, feedback, 'Email looks good! ✉️');
    return true;
}

function validateConsent() {
    if (!consentCheckbox.checked) {
        showNotification('Please agree to receive SMS notifications', 'error');
        consentCheckbox.closest('.consent-checkbox').style.animation = 'errorShake 0.5s ease-in-out';
        setTimeout(() => {
            consentCheckbox.closest('.consent-checkbox').style.animation = '';
        }, 500);
        return false;
    }
    return true;
}

function markFieldError(inputGroup, feedback, message) {
    inputGroup.classList.remove('success');
    inputGroup.classList.add('error');
    feedback.textContent = message;
    feedback.className = 'input-feedback error';
    
    // Shake animation
    inputGroup.style.animation = 'errorShake 0.5s ease-in-out';
    setTimeout(() => {
        inputGroup.style.animation = '';
    }, 500);
}

function markFieldSuccess(inputGroup, feedback, message) {
    inputGroup.classList.remove('error');
    inputGroup.classList.add('success');
    feedback.textContent = message;
    feedback.className = 'input-feedback success';
}

function clearFieldError(input) {
    const inputGroup = input.closest('.input-group');
    inputGroup.classList.remove('error');
}

// Phone Number Formatting
function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 1) {
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    
    event.target.value = value;
}

// Preview Updates
function setupPreviewUpdates() {
    nameInput.addEventListener('input', updatePreview);
    phoneInput.addEventListener('input', updatePreview);
    emailInput.addEventListener('input', updatePreview);
}

function updatePreview() {
    previewName.textContent = nameInput.value.trim() || '-';
    previewPhone.textContent = phoneInput.value.trim() || '-';
    previewEmail.textContent = emailInput.value.trim() || 'Not provided';
    
    // Add animation
    const previewCard = document.querySelector('.preview-card');
    previewCard.style.transform = 'scale(1.02)';
    previewCard.style.boxShadow = '0 10px 25px var(--shadow-gold)';
    
    setTimeout(() => {
        previewCard.style.transform = 'scale(1)';
        previewCard.style.boxShadow = '';
    }, 200);
}

// Form Submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    console.log('📝 Processing form submission...');
    
    if (!validateCurrentStep()) {
        showNotification('Please fix the errors before submitting', 'error');
        return;
    }
    
    const formData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim() || '',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        source: 'enhanced_signup_form'
    };
    
    console.log('🚀 Submitting data:', formData);
    
    // Show loading
    showLoading();
    
    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Signup successful!', result);
            showSuccess(formData);
            incrementSignupCount();
            updateStats();
            
            // Celebration
            setTimeout(() => {
                createCelebrationEffect();
                playSuccessSound();
            }, 500);
            
        } else {
            console.error('❌ Signup failed:', result);
            // Handle specific duplicate phone error
            if (result.error === 'DUPLICATE_PHONE') {
                showError('This phone number is already signed up! You\'ll receive the birthday notification when it\'s time. 🎉');
            } else {
                showError(result.message || 'Failed to sign up. Please try again.');
            }
        }
        
    } catch (error) {
        console.error('🔥 Network error:', error);
        showError('Network error. Please check your connection and try again.');
    }
    
    hideLoading();
}

// Button Handlers
function setupButtonHandlers() {
    if (retryBtn) {
        retryBtn.addEventListener('click', resetForm);
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', shareSignupPage);
    }
}

// Keyboard Navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (currentStep < totalSteps) {
                if (validateCurrentStep()) {
                    goToStep(currentStep + 1);
                }
            } else {
                // On final step, submit form
                handleFormSubmission(e);
            }
        }
        
        if (e.key === 'Escape') {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        }
    });
}

// Show/Hide Functions
function showLoading() {
    loadingOverlay.classList.remove('hidden');
    submitBtn.disabled = true;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    
    // Add loading animation to button
    submitBtn.style.animation = 'pulse 1.5s ease-in-out infinite';
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
    submitBtn.disabled = false;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
    
    submitBtn.style.animation = '';
}

function showSuccess(formData) {
    // Hide form, show success
    form.style.opacity = '0';
    form.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        form.classList.add('hidden');
        errorSection.classList.add('hidden');
        successSection.classList.remove('hidden');
        
        // Success animation
        successSection.style.opacity = '0';
        successSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            successSection.style.transition = 'all 0.6s ease-out';
            successSection.style.opacity = '1';
            successSection.style.transform = 'translateY(0)';
        }, 100);
        
    }, 300);
    
    console.log('🎉 User successfully signed up:', formData.name);
}

function showError(message) {
    // Hide form, show error
    form.style.opacity = '0';
    form.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        form.classList.add('hidden');
        successSection.classList.add('hidden');
        errorSection.classList.remove('hidden');
        
        const errorText = document.getElementById('error-text');
        if (errorText) {
            errorText.textContent = message;
        }
        
        // Error animation
        errorSection.style.animation = 'errorShake 0.5s ease-in-out';
        setTimeout(() => {
            errorSection.style.animation = '';
        }, 500);
    }, 300);
}

function resetForm() {
    // Reset form state
    form.reset();
    currentStep = 1;
    
    // Clear validation states
    document.querySelectorAll('.input-group').forEach(group => {
        group.classList.remove('error', 'success', 'focused');
    });
    
    document.querySelectorAll('.input-feedback').forEach(feedback => {
        feedback.textContent = '';
        feedback.className = 'input-feedback';
    });
    
    // Show form, hide messages
    form.classList.remove('hidden');
    errorSection.classList.add('hidden');
    successSection.classList.add('hidden');
    
    // Reset form animation
    form.style.opacity = '1';
    form.style.transform = 'scale(1)';
    
    // Go to first step
    goToStep(1);
    
    console.log('🔄 Form reset complete');
}

// Statistics Functions
async function updateStats() {
    try {
        // Get real subscriber count from API
        const response = await fetch('/api/subscribe');
        const result = await response.json();
        
        let realSignups = 0;
        if (result.success && result.data) {
            realSignups = result.data.totalSubscribers || 0;
        }
        
        // Update signup count with real data
        if (totalSignupsElement) {
            animateNumber(totalSignupsElement, realSignups);
        }
        
        console.log('📊 Real signup count from database:', realSignups);
        
    } catch (error) {
        console.error('❌ Could not fetch real signup count:', error);
        
        // Fallback: show placeholder instead of localStorage
        if (totalSignupsElement) {
            totalSignupsElement.textContent = '...';
        }
    }
    
    // Update days left (this part stays the same)
    const targetDate = new Date('2025-08-16T18:00:00');
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
    
    if (daysLeftElement) {
        animateNumber(daysLeftElement, daysLeft);
    }
}

async function getSignupCount() {
    try {
        const response = await fetch('/api/subscribe');
        const result = await response.json();
        return result.success && result.data ? result.data.totalSubscribers : 0;
    } catch {
        return 0;
    }
}

function incrementSignupCount() {
    console.log('📈 New signup recorded in database');
}

function animateNumber(element, targetValue) {
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            // Final value with celebration
            element.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Visual Effects
function createCelebrationEffect() {
    const colors = ['#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#3B82F6'];
    const container = document.body;
    
    // Create confetti burst
    for (let i = 0; i < 50; i++) {
        createConfettiPiece(colors, container);
    }
    
    // Create floating hearts
    for (let i = 0; i < 10; i++) {
        createFloatingHeart(container, i);
    }
    
    console.log('🎊 Celebration effect triggered!');
}

function createConfettiPiece(colors, container) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    confetti.style.cssText = `
        position: fixed;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${color};
        left: ${Math.random() * window.innerWidth}px;
        top: -10px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        pointer-events: none;
        z-index: 10000;
        animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
    `;
    
    container.appendChild(confetti);
    
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 5000);
}

function createFloatingHeart(container, index) {
    const heart = document.createElement('div');
    heart.textContent = '💖';
    heart.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 20 + 20}px;
        left: ${Math.random() * window.innerWidth}px;
        bottom: -50px;
        pointer-events: none;
        z-index: 10000;
        animation: floatUp ${Math.random() * 2 + 3}s ease-out forwards;
        animation-delay: ${index * 0.2}s;
    `;
    
    container.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 5000);
}

// Background Animations
function startBackgroundAnimations() {
    // Animate floating shapes
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 2}s`;
    });
    
    // Add sparkle effects periodically
    setInterval(() => {
        if (Math.random() > 0.7) {
            createSparkleEffect();
        }
    }, 3000);
}

function createSparkleEffect() {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.cssText = `
        position: fixed;
        font-size: 16px;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        pointer-events: none;
        z-index: 1;
        animation: sparkleGlow 2s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 2000);
}

// Share Functionality
function shareSignupPage() {
    const shareData = {
        title: '🎉 Join the Birthday Surprise!',
        text: 'Sign up to get notified when this amazing birthday surprise goes live!',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(() => {
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    const url = window.location.href;
    const text = `🎉 Join the Birthday Surprise! Sign up here: ${url}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard! 📋', 'success');
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
    textArea.style.cssText = 'position: fixed; top: -1000px; left: -1000px;';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Link copied! Share it with friends! 🚀', 'success');
    } catch (err) {
        showNotification(`Share this link: ${window.location.href}`, 'info');
    }
    
    document.body.removeChild(textArea);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const icons = {
        success: '✅',
        error: '⚠️',
        info: 'ℹ️'
    };
    
    const colors = {
        success: 'linear-gradient(45deg, #059669, #10B981)',
        error: 'linear-gradient(45deg, #DC2626, #EF4444)',
        info: 'linear-gradient(45deg, #8B5CF6, #F59E0B)'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">${icons[type]}</span>
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
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Audio Effects
function playSuccessSound() {
    try {
        // Create success sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play a pleasant success tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
    } catch (error) {
        console.log('Audio not available');
    }
}

// Field Validation Helpers
function validateField(field) {
    switch (field.id) {
        case 'name':
            return validateName(true);
        case 'phone':
            return validatePhone(true);
        case 'email':
            return validateEmail(true);
        default:
            return true;
    }
}

// Debug helpers for development
window.signupDebug = {
    fillTestData: () => {
        nameInput.value = 'Test User';
        phoneInput.value = '(555) 123-4567';
        emailInput.value = 'test@example.com';
        consentCheckbox.checked = true;
        updatePreview();
        console.log('✅ Test data filled');
    },
    goToStep: (step) => goToStep(step),
    showSuccess: () => showSuccess({name: 'Test User'}),
    showError: () => showError('This is a test error message'),
    resetForm: () => resetForm(),
    celebration: () => createCelebrationEffect(),
    getCurrentStep: () => currentStep,
    validateAll: () => {
        console.log('Name valid:', validateName(true));
        console.log('Phone valid:', validatePhone(true));
        console.log('Email valid:', validateEmail(true));
        console.log('Consent valid:', validateConsent());
    }
};

// Add required CSS animations
const additionalStyles = `
@keyframes confettiFall {
    0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}

@keyframes floatUp {
    0% {
        transform: translateY(100px);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100vh);
        opacity: 0;
    }
}

@keyframes sparkleGlow {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(1.2);
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
`;

// Add the additional styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

console.log(`
🎉 ENHANCED SIGNUP FORM READY! 🎉

Features Loaded:
✅ Multi-step form navigation
✅ Real-time validation
✅ Phone number formatting
✅ Preview functionality
✅ Celebration animations
✅ Loading states
✅ Error handling
✅ Keyboard navigation
✅ Mobile responsive

Debug Commands Available:
- window.signupDebug.fillTestData()
- window.signupDebug.goToStep(1-3)
- window.signupDebug.showSuccess()
- window.signupDebug.celebration()

Ready for birthday magic! ✨
`);