// GSAP Animations for VibeCheck
class VibeCheckAnimations {
    // Home page animations
    static initHomePageAnimations() {
        // Your existing home page animations remain exactly the same
        // Hero text fade in
        gsap.fromTo('.hero h1', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );

        // Hero paragraph fade in
        gsap.fromTo('.hero p', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 }
        );

        // Genre pills stagger in
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

        // GSAP 1: Timeline animation - Explore by genre timeline
        const genreTimeline = gsap.timeline();
        genreTimeline.fromTo('.genre-section .section-title',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: 'bounce.out' }
        ).fromTo('.genre-pill',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' },
            '-=0.3'
        );

        // GSAP 2: SVG/MotionPath animation - Sound wave visualization
        const waveLine = document.querySelector('.wave-line');
        const soundDot = document.querySelector('.sound-dot');
        
        if (waveLine && soundDot) {
            // Animate the wave path
            gsap.to(waveLine, {
                attr: { 
                    d: "M0,40 Q50,60 100,40 T200,40 T300,40",
                },
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Animate dot along the path (MotionPath)
            gsap.to(soundDot, {
                motionPath: {
                    path: waveLine,
                    align: waveLine,
                    alignOrigin: [0.5, 0.5]
                },
                duration: 3,
                repeat: -1,
                ease: "none"
            });

            // Pulse animation for the dot
            gsap.to(soundDot, {
                scale: 1.5,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        // GSAP 3: ScrollTrigger animation - Artist cards on scroll
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

        // FIXED: Only the main title moves up slightly on scroll
        gsap.to('.hero h1', {
            y: -40, // Only affects the h1, not the paragraph
            duration: 0.5,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Paragraph stays in place but can have a subtle effect if wanted
        gsap.to('.hero p', {
            y: -10, // Very subtle movement for the paragraph
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
        // Your existing favorites animations remain exactly the same
        // GSAP 1: Timeline animation - Sequential loading animation
        const favoritesTimeline = gsap.timeline();
        favoritesTimeline.fromTo('.page-title',
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
        ).fromTo('.favorites-visualization',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
            '-=0.3'
        ).fromTo('.track-item',
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
            '-=0.2'
        );

        // GSAP 2: ScrollTrigger animation - Title moves up but returns when scrolling back
        gsap.to('.page-title', {
            y: -30, // Noticeable movement
            scale: 0.95, // Also scales slightly
            duration: 0.5,
            scrollTrigger: {
                trigger: '.favorites-visualization',
                start: 'top 30%',
                end: 'bottom top',
                scrub: false, // No scrub - animation plays once when triggered
                toggleActions: "play reverse play reverse", // Plays forward and reverses
                markers: false
            }
        });

        // GSAP 3: ScrollTrigger animation - Track items fade in on scroll
        gsap.fromTo('.track-item',
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '#favorites-list',
                    start: 'top 85%',
                    end: 'bottom 60%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // GSAP 4: SVG/MotionPath animation - Heart wave with floating heart
        const heartPath = document.querySelector('.heart-path');
        const floatingHeart = document.querySelector('.floating-heart');
        
        if (heartPath && floatingHeart) {
            // Animate the heart wave path
            gsap.to(heartPath, {
                attr: { 
                    d: "M0,30 Q50,50 100,30 T200,30 T300,30",
                },
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Animate heart along the path (MotionPath)
            gsap.to(floatingHeart, {
                motionPath: {
                    path: heartPath,
                    align: heartPath,
                    alignOrigin: [0.5, 0.5]
                },
                duration: 4,
                repeat: -1,
                ease: "none"
            });

            // Pulse animation for the heart
            gsap.to(floatingHeart, {
                scale: 1.2,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        // GSAP 5: Interactive animation - Enhanced removal animation
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('favorite-btn')) {
                // Heart bounce animation when removing favorites
                gsap.to(e.target, {
                    scale: 1.4,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                });
            }
        });
    }

    // Artist page animations
    static initArtistAnimations() {
        // Your existing artist animations remain exactly the same
        // GSAP 1: Timeline animation - Content slides in from right
        const artistTimeline = gsap.timeline();
        artistTimeline.fromTo('.artist-header',
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
        ).fromTo('.music-visualization',
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
            '-=0.4'
        ).fromTo('.track-item',
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
            '-=0.3'
        );

        // SUBTLE: Artist header moves up slightly on scroll
        gsap.to('.artist-header', {
            y: -10, // Reduced from -20 to -10 (very subtle)
            duration: 0.5, // Slower duration for smoother effect
            scrollTrigger: {
                trigger: '.tracks-section',
                start: 'top 40%', // Start much later (40% down the viewport)
                end: 'bottom top',
                scrub: true,
                markers: false
            }
        });

        // GSAP 3: SVG animation - Wave path animation
        const wavePath = document.querySelector('.wave-path');
        if (wavePath) {
            gsap.to(wavePath, {
                attr: { d: "M0,30 Q100,50 200,30 T400,30" },
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        // GSAP 4: Interactive animation - Heart button bounce
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

    // About page animations - SIMPLIFIED VERSION
    static initAboutAnimations() {
        console.log('🎭 Initializing About Page Animations');
        
        // Keep your existing about animations
        const aboutTimeline = gsap.timeline();
        aboutTimeline.fromTo('.page-title',
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
        ).fromTo('.about-visualization',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
            '-=0.4'
        ).fromTo('.about-hero',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
            '-=0.3'
        ).fromTo('.mission-section',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
            '-=0.4'
        ).fromTo('.how-it-works',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
            '-=0.4'
        );

        // GSAP 2: ScrollTrigger animation - Title scales on scroll
        gsap.to('.page-title', {
            scale: 0.95,
            y: -15,
            duration: 0.4,
            scrollTrigger: {
                trigger: '.about-visualization',
                start: 'top 30%',
                end: 'bottom top',
                scrub: false,
                toggleActions: "play reverse play reverse",
                markers: false
            }
        });

        // GSAP 3: SVG/MotionPath animation - Music flow visualization
        const flowPath = document.querySelector('.flow-path');
        const flowDot = document.querySelector('.flow-dot');
        const musicNote = document.querySelector('.music-note');
        
        if (flowPath && flowDot && musicNote) {
            // Animate the flow path
            gsap.to(flowPath, {
                attr: { 
                    d: "M0,40 Q100,60 200,40 T400,40",
                },
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Animate dot along the path (MotionPath)
            gsap.to(flowDot, {
                motionPath: {
                    path: flowPath,
                    align: flowPath,
                    alignOrigin: [0.5, 0.5]
                },
                duration: 3,
                repeat: -1,
                ease: "none"
            });

            // Animate music note along a different part of the path
            gsap.to(musicNote, {
                motionPath: {
                    path: flowPath,
                    align: flowPath,
                    alignOrigin: [0.5, 0.5]
                },
                duration: 4,
                repeat: -1,
                ease: "none",
                delay: 1.5
            });

            // Pulse animation for the elements
            gsap.to([flowDot, musicNote], {
                scale: 1.3,
                duration: 1.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.3
            });
        }

        // GSAP 4: ScrollTrigger animation - Feature cards on scroll
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

        // GSAP 5: Interactive animation - Step list items on hover
        document.addEventListener('mouseover', function(e) {
            if (e.target.closest('.steps-list li')) {
                const listItem = e.target.closest('.steps-list li');
                gsap.to(listItem, {
                    scale: 1.02,
                    x: 10,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        document.addEventListener('mouseout', function(e) {
            if (e.target.closest('.steps-list li')) {
                const listItem = e.target.closest('.steps-list li');
                gsap.to(listItem, {
                    scale: 1,
                    x: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        // ADD SIMPLE TEXT ANIMATIONS (NEW)
        this.addSimpleTextAnimations();
    }

    // NEW: Simple text animations that don't interfere with existing ones
    static addSimpleTextAnimations() {
        // Simple fade-in for mission text
        gsap.fromTo('.mission-section p',
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.3,
                scrollTrigger: {
                    trigger: '.mission-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Simple bounce for feature card titles
        gsap.fromTo('.feature-card h3',
            { scale: 0.8, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: '.feature-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Simple slide-in for step descriptions
        gsap.fromTo('.steps-list p',
            { x: -30, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: '.steps-list',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Add a subtle glow effect to the main title
        gsap.to('.page-title', {
            textShadow: '0 0 20px var(--primary)',
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
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