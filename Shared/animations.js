// GSAP Animations for VibeCheck
class VibeCheckAnimations {
    // Home page animations
    static initHomePageAnimations() {
        // Hero text fade in (GSAP 1)
        gsap.fromTo('.hero h1', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );

        // Genre pills stagger in (GSAP 2)
        gsap.fromTo('.genre-pill',
            { opacity: 0, x: -50 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 0.6, 
                stagger: 0.1,
                ease: 'back.out(1.7)',
                delay: 0.5
            }
        );

        // Explore by genre timeline (GSAP 3)
        const genreTimeline = gsap.timeline();
        genreTimeline.fromTo('.genre-section .section-title',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: 'bounce.out' }
        ).fromTo('.genre-pill',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' },
            '-=0.3'
        );

        // Scroll-triggered artist cards
        gsap.fromTo('.artist-card',
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.artist-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Hero text scale on scroll (GSAP 4)
        gsap.to('.hero h1', {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Favorites page animations
    static initFavoritesAnimations() {
        // List items fade in one by one
        gsap.fromTo('.track-item',
            { opacity: 0, x: -50 },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            }
        );

        // Header fade on scroll
        gsap.to('.page-title', {
            opacity: 0.5,
            y: -50,
            scrollTrigger: {
                trigger: '.container',
                start: 'top top',
                end: '100px top',
                scrub: true
            }
        });
    }

    // Artist page animations
    static initArtistAnimations() {
        // Content slides in from right (GSAP 1)
        const artistTimeline = gsap.timeline();
        artistTimeline.fromTo('.artist-image-large',
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
        ).fromTo('.artist-name-large',
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
            '-=0.4'
        ).fromTo('.track-item',
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
            '-=0.3'
        );

        // Save button bounce animation (GSAP 2)
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('favorite-btn')) {
                gsap.to(e.target, {
                    scale: 1.3,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                });
            }
        });
    }

    // About page animations
    static initAboutAnimations() {
        // Content slides in from top
        gsap.fromTo('.about-content > *',
            { y: -50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power2.out'
            }
        );

        // Feature cards animation on scroll
        gsap.fromTo('.feature-card',
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.feature-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Common page load animation
    static initPageLoadAnimation() {
        gsap.fromTo('main, .container',
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.inOut' }
        );
    }

    // Interactive element animations
    static initInteractiveAnimations() {
        // Card hover effects
        document.addEventListener('mouseover', function(e) {
            if (e.target.closest('.card')) {
                gsap.to(e.target.closest('.card'), {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        document.addEventListener('mouseout', function(e) {
            if (e.target.closest('.card')) {
                gsap.to(e.target.closest('.card'), {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        // Button hover effects
        document.addEventListener('mouseover', function(e) {
            if (e.target.classList.contains('btn-primary')) {
                gsap.to(e.target, {
                    y: -2,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            }
        });

        document.addEventListener('mouseout', function(e) {
            if (e.target.classList.contains('btn-primary')) {
                gsap.to(e.target, {
                    y: 0,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            }
        });

        // Icon button hover effects
        document.addEventListener('mouseover', function(e) {
            if (e.target.classList.contains('icon-btn')) {
                gsap.to(e.target, {
                    scale: 1.2,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            }
        });

        

        document.addEventListener('mouseout', function(e) {
            if (e.target.classList.contains('icon-btn')) {
                gsap.to(e.target, {
                    scale: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            }
        });
    }
}