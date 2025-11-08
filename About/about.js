
document.addEventListener('DOMContentLoaded', function() {
    initializeAboutPage();
});

function initializeAboutPage() {
    console.log('About page initialized');

    
    if (typeof VibeCheckAnimations !== 'undefined') {
        VibeCheckAnimations.initAboutAnimations();
    } else {
        console.warn('VibeCheckAnimations not found, loading fallback animations');
        initFallbackAboutAnimations();
    }
}

// Fallback animations in case VibeCheckAnimations is not available
function initFallbackAboutAnimations() {
    // Simple fade in for feature cards
    gsap.fromTo('.feature-card', 
        { y: 50, opacity: 0 },
        { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.feature-grid',
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        }
    );

    // Page title animation
    gsap.fromTo('.page-title', 
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
    );

    // About visualization animation
    gsap.fromTo('.about-visualization', 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, delay: 0.3, ease: 'back.out(1.7)' }
    );
}