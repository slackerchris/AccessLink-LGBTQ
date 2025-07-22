/**
 * AccessLink LGBTQ+ Website JavaScript
 * Accessibility-first interactive functionality
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeAccessibilityFeatures();
    initializeFormHandling();
    announcePageLoad();
});

/**
 * Navigation functionality
 */
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        // Toggle mobile navigation
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            
            // Update hamburger animation
            navToggle.classList.toggle('active');
            
            // Announce to screen readers
            announceToScreenReader(
                isExpanded ? 'Navigation menu closed' : 'Navigation menu opened'
            );
        });

        // Close navigation when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('active');
            });
        });

        // Close navigation when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('active');
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('active');
                navToggle.focus();
            }
        });
    }
}

/**
 * Smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just a hash
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Set focus to target element for accessibility
                setTimeout(() => {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    
                    // Announce navigation to screen readers
                    const targetTitle = targetElement.querySelector('h1, h2, h3, h4, h5, h6');
                    if (targetTitle) {
                        announceToScreenReader(`Navigated to ${targetTitle.textContent}`);
                    }
                }, 500);
            }
        });
    });
}

/**
 * Accessibility features
 */
function initializeAccessibilityFeatures() {
    // High contrast mode toggle
    createHighContrastToggle();
    
    // Font size controls
    createFontSizeControls();
    
    // Motion reduction respect
    respectMotionPreferences();
    
    // Keyboard navigation enhancements
    enhanceKeyboardNavigation();
    
    // Focus management
    manageFocus();
}

/**
 * Create high contrast mode toggle
 */
function createHighContrastToggle() {
    const accessibilityControls = createAccessibilityToolbar();
    
    const highContrastButton = document.createElement('button');
    highContrastButton.className = 'accessibility-control';
    highContrastButton.setAttribute('aria-label', 'Toggle high contrast mode');
    highContrastButton.innerHTML = '🔲 High Contrast';
    
    highContrastButton.addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        const isActive = document.body.classList.contains('high-contrast');
        
        this.setAttribute('aria-pressed', isActive);
        announceToScreenReader(
            isActive ? 'High contrast mode enabled' : 'High contrast mode disabled'
        );
        
        // Save preference
        localStorage.setItem('highContrast', isActive);
    });
    
    // Load saved preference
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
        highContrastButton.setAttribute('aria-pressed', 'true');
    }
    
    accessibilityControls.appendChild(highContrastButton);
}

/**
 * Create font size controls
 */
function createFontSizeControls() {
    const accessibilityControls = document.querySelector('.accessibility-toolbar');
    
    const fontSizeGroup = document.createElement('div');
    fontSizeGroup.className = 'font-size-controls';
    fontSizeGroup.setAttribute('role', 'group');
    fontSizeGroup.setAttribute('aria-label', 'Font size controls');
    
    const decreaseButton = document.createElement('button');
    decreaseButton.className = 'accessibility-control';
    decreaseButton.setAttribute('aria-label', 'Decrease font size');
    decreaseButton.innerHTML = 'A-';
    
    const increaseButton = document.createElement('button');
    increaseButton.className = 'accessibility-control';
    increaseButton.setAttribute('aria-label', 'Increase font size');
    increaseButton.innerHTML = 'A+';
    
    const resetButton = document.createElement('button');
    resetButton.className = 'accessibility-control';
    resetButton.setAttribute('aria-label', 'Reset font size');
    resetButton.innerHTML = 'A';
    
    let currentFontSize = 100; // percentage
    
    function updateFontSize(newSize) {
        currentFontSize = Math.max(75, Math.min(150, newSize));
        document.documentElement.style.fontSize = `${currentFontSize}%`;
        localStorage.setItem('fontSize', currentFontSize);
        announceToScreenReader(`Font size set to ${currentFontSize}%`);
    }
    
    decreaseButton.addEventListener('click', () => updateFontSize(currentFontSize - 10));
    increaseButton.addEventListener('click', () => updateFontSize(currentFontSize + 10));
    resetButton.addEventListener('click', () => updateFontSize(100));
    
    // Load saved preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        updateFontSize(parseInt(savedFontSize));
    }
    
    fontSizeGroup.appendChild(decreaseButton);
    fontSizeGroup.appendChild(resetButton);
    fontSizeGroup.appendChild(increaseButton);
    accessibilityControls.appendChild(fontSizeGroup);
}

/**
 * Create accessibility toolbar
 */
function createAccessibilityToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'accessibility-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Accessibility controls');
    
    // Add CSS for the toolbar
    const style = document.createElement('style');
    style.textContent = `
        .accessibility-toolbar {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--bg-primary);
            border: 2px solid var(--border-medium);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
        }
        
        .accessibility-control {
            background: var(--primary-color);
            color: var(--text-inverse);
            border: none;
            padding: var(--space-2) var(--space-3);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: var(--font-size-sm);
            transition: background var(--transition-fast);
        }
        
        .accessibility-control:hover {
            background: var(--primary-dark);
        }
        
        .accessibility-control:focus {
            outline: 2px solid var(--text-inverse);
            outline-offset: 2px;
        }
        
        .font-size-controls {
            display: flex;
            gap: var(--space-1);
        }
        
        .high-contrast {
            filter: contrast(2) brightness(1.2);
        }
        
        @media (max-width: 768px) {
            .accessibility-toolbar {
                position: relative;
                top: auto;
                right: auto;
                margin: var(--space-4);
                flex-direction: row;
                justify-content: center;
                flex-wrap: wrap;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toolbar);
    return toolbar;
}

/**
 * Respect motion preferences
 */
function respectMotionPreferences() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleMotionChange(e) {
        if (e.matches) {
            document.body.classList.add('reduce-motion');
            announceToScreenReader('Animations reduced based on your preferences');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    }
    
    handleMotionChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMotionChange);
}

/**
 * Enhance keyboard navigation
 */
function enhanceKeyboardNavigation() {
    // Add visible focus indicators
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Add skip links for major sections
    addSkipLinks();
}

/**
 * Add skip links for better navigation
 */
function addSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
        <a href="#features" class="skip-link">Skip to Features</a>
        <a href="#accessibility" class="skip-link">Skip to Accessibility</a>
        <a href="#download" class="skip-link">Skip to Download</a>
        <a href="#about" class="skip-link">Skip to About</a>
        <a href="#contact" class="skip-link">Skip to Contact</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
}

/**
 * Focus management
 */
function manageFocus() {
    // Trap focus in modals if any
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                trapFocus(e, activeModal);
            }
        }
    });
}

/**
 * Trap focus within an element
 */
function trapFocus(event, element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
    }
}

/**
 * Form handling with accessibility
 */
function initializeFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showFieldError(field, `${getFieldLabel(field)} is required`);
                } else {
                    clearFieldError(field);
                }
            });
            
            if (isValid) {
                announceToScreenReader('Form submitted successfully');
                // Handle form submission here
            } else {
                announceToScreenReader('Please correct the errors and try again');
                // Focus first error field
                const firstError = form.querySelector('.field-error');
                if (firstError) {
                    firstError.previousElementSibling.focus();
                }
            }
        });
    });
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', `error-${field.name || field.id}`);
    errorElement.id = `error-${field.name || field.id}`;
    
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
}

/**
 * Get field label for error messages
 */
function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent : field.getAttribute('placeholder') || field.name || 'Field';
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'screen-reader-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Announce page load to screen readers
 */
function announcePageLoad() {
    setTimeout(() => {
        announceToScreenReader('AccessLink LGBTQ+ website loaded. Main navigation and accessibility controls are available.');
    }, 1000);
}

/**
 * Add CSS for screen reader only content
 */
const srOnlyStyle = document.createElement('style');
srOnlyStyle.textContent = `
    .screen-reader-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
    }
    
    .keyboard-navigation *:focus {
        outline: 3px solid var(--primary-color) !important;
        outline-offset: 2px !important;
    }
    
    .field-error {
        color: #DC2626;
        font-size: var(--font-size-sm);
        margin-top: var(--space-1);
        font-weight: 500;
    }
    
    .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(srOnlyStyle);

/**
 * Progressive enhancement for older browsers
 */
function checkBrowserSupport() {
    // Check for basic features
    if (!document.querySelector || !document.addEventListener) {
        // Fallback for very old browsers
        console.warn('Browser does not support modern JavaScript features');
        return false;
    }
    
    return true;
}

// Initialize only if browser supports modern features
if (checkBrowserSupport()) {
    // All initialization is already handled in DOMContentLoaded event
    console.log('AccessLink LGBTQ+ website initialized with accessibility features');
} else {
    console.warn('Some features may not work in this browser');
}
