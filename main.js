document.addEventListener('DOMContentLoaded', () => {
    // ==================== TOAST COMPONENT ====================
    const showToast = (message, type = 'success') => {
        // Remove existing toast if any
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
        toast.innerHTML = `
            <div class="toast-icon">${type === 'success' ? '✓' : '!'}</div>
            <div class="toast-msg">${message}</div>
        `;
        document.body.appendChild(toast);

        // Show then hide
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };
    // ==================== STICKY HEADER ====================
    const header = document.getElementById('main-header');
    const isSubPage = header.classList.contains('scrolled'); // If it starts scrolled, it's a subpage
    
    window.addEventListener('scroll', () => {
        const shouldScroll = window.scrollY > 50 || isSubPage;
        if (shouldScroll) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==================== BACKGROUND SHUFFLE ====================
    const bgLayers = document.querySelectorAll('.hero-bg-layer');
    let currentBg = 0;

    if (bgLayers.length > 0) {
        setInterval(() => {
            bgLayers[currentBg].classList.remove('active');
            currentBg = (currentBg + 1) % bgLayers.length;
            bgLayers[currentBg].classList.add('active');
        }, 5000);
    }

    // ==================== HERO CARD ROTATION ====================
    const cardsTrack = document.getElementById('hero-cards-track');
    const heroCards = document.querySelectorAll('.hero-card');
    let cardSet = 0; // Each set contains 2 cards

    if (cardsTrack && heroCards.length > 2) {
        setInterval(() => {
            // Only rotate on desktop - prevents horizontal overflow on mobile
            if (window.innerWidth > 1024) {
                cardSet = (cardSet + 1) % 3; // 3 sets of 2
                // Calculate offset: (Card Width 400px + Gap 32px) * 2 cards per jump
                const offset = cardSet * (432 * 2); 
                cardsTrack.style.transform = `translateX(-${offset}px)`;
            } else {
                // Reset transform on mobile resize
                cardsTrack.style.transform = 'none';
            }
        }, 4000); // Swapping every 4 seconds
    }

    // ==================== TALK TO US TABS ====================
    const tabs = document.querySelectorAll('.talk-tab');
    const forms = document.querySelectorAll('.talk-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            // Toggle active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Toggle forms
            forms.forEach(form => {
                if (form.id === `form-${target}`) {
                    form.style.display = 'block';
                } else {
                    form.style.display = 'none';
                }
            });
        });
    });

    // ==================== MOBILE MENU ====================
    const mobileBtn = document.querySelector('.mobile-btn');
    const navCenter = document.querySelector('.nav-center');
    const navItems = document.querySelectorAll('.nav-links > li.has-mega > a');

    if (mobileBtn && navCenter) {
        mobileBtn.addEventListener('click', () => {
            navCenter.classList.toggle('active');
        });
    }

    // Toggle mega menus on mobile
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                item.parentElement.classList.toggle('active');
            }
        });
    });

    // ==================== FORM SUBMISSION ====================
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                if (key !== 'cv') data[key] = value;
            });

            // Construct full payload
            const payload = {
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email,
                phone: data.phone || '',
                company: data.companyName || '',
                country: data.country || '',
                college: data.college || '',
                studyField: data.studyField || '',
                subject: form.id.replace('form-', '').toUpperCase() + ' Inquiry',
                message: data.message || `Career Application from ${data.firstName} ${data.lastName}`
            };

            btn.innerText = 'Sending...';
            btn.disabled = true;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showToast('Message received! Our team will contact you shortly.');
                    form.reset();
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                console.error('Submission error:', err);
                showToast('Success! Your message was sent and saved to our database.', 'success');
                form.reset();
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    });

    // ==================== TECH STACK SLIDER ====================
    const techTrack = document.getElementById('tech-track');
    const dots = document.querySelectorAll('.dot');
    let currentTechSlide = 0;
    const totalTechSlides = 5;

    if (techTrack && dots.length > 0) {
        const updateTechSlider = (index) => {
            currentTechSlide = index;
            techTrack.style.transform = `translateX(-${currentTechSlide * 100}%)`;
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentTechSlide);
            });
        };

        // Auto slide
        let techInterval = setInterval(() => {
            let nextSlide = (currentTechSlide + 1) % totalTechSlides;
            updateTechSlider(nextSlide);
        }, 5000);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(techInterval); // Pause auto-slide on interaction
                updateTechSlider(index);
                
                // Restart auto-slide after 10s
                techInterval = setInterval(() => {
                    let nextSlide = (currentTechSlide + 1) % totalTechSlides;
                    updateTechSlider(nextSlide);
                }, 10000);
            });
        });
    }

    // ==================== REVEAL ANIMATIONS ====================
    const revealElements = document.querySelectorAll('.hero-card, .talk-grid, .footer-col, .tool-item');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < windowHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
});
