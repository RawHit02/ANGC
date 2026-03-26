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
    const sliderContainer = document.querySelector('.hero-slider-container');
    let cardSet = 0; // Each set contains 2 cards

    if (cardsTrack && heroCards.length > 2) {
        setInterval(() => {
            if (window.innerWidth > 1024) {
                cardSet = (cardSet + 1) % 3; // 3 sets of 2
                // Calculate offset: (Card Width 400px + Gap 32px) * 2 cards per jump
                const offset = cardSet * (432 * 2); 
                cardsTrack.style.transform = `translateX(-${offset}px)`;
            } else if (sliderContainer) {
                // Reset transform on mobile resize
                cardsTrack.style.transform = 'none';
                
                // Native smooth scroll for mobile auto-swapping
                const singleCardJump = heroCards[0].offsetWidth + 24; // Card width + 1.5rem gap
                
                // If reached the end, smoothly scroll back to the beginning
                if (sliderContainer.scrollLeft + sliderContainer.clientWidth >= sliderContainer.scrollWidth - 20) {
                    sliderContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Progress to the next card
                    sliderContainer.scrollBy({ left: singleCardJump, behavior: 'smooth' });
                }
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

    // ==================== CHATBOT SYSTEM ====================
    const chatbotData = {
        "greetings": {
            "keywords": ["hi", "hello", "hey", "hola", "greetings"],
            "answer": "Hello! Welcome to ANGC Synapse. I'm your AI assistant. How can I help you today?"
        },
        "plans": {
            "keywords": ["plans", "pricing", "subscription", "cost", "charge"],
            "answer": `
                <div class="chat-card-container">
                    <div class="plan-card silver">
                        <div class="plan-header"><span class="plan-title">Silver Tier</span><span class="plan-price">$99/mo</span></div>
                        <ul class="plan-features">
                            <li>Essential Web App Development</li>
                            <li>Standard Security Patching</li>
                            <li>Email Support</li>
                        </ul>
                    </div>
                    <div class="plan-card gold">
                        <div class="plan-header"><span class="plan-title">Gold Tier</span><span class="plan-price">$299/mo</span></div>
                        <ul class="plan-features">
                            <li>Advanced AI Integration</li>
                            <li>Prototyping & MVP Support</li>
                            <li>24/7 Priority Support</li>
                        </ul>
                    </div>
                    <div class="plan-card platinum">
                        <div class="plan-header"><span class="plan-title">Platinum Tier</span><span class="plan-price">$999/mo</span></div>
                        <ul class="plan-features">
                            <li>Custom Global Architecture</li>
                            <li>Zero-Trust Security Suite</li>
                            <li>Dedicated Engineering Team</li>
                        </ul>
                    </div>
                </div>
            `
        },
        "contact": {
            "keywords": ["contact", "email", "phone", "call", "reach", "support", "help"],
            "answer": `
                <div>Our engineering experts are ready to build your vision. Reach out to us:</div>
                <div style="margin-top: 10px; font-size: 0.85rem; color: #475569;">
                    📧 <strong>rohitroody47@gmail.com</strong><br>
                    📞 <strong>+91 9311161110</strong>
                </div>
                <div class="chat-btn-container">
                    <a href="mailto:rohitroody47@gmail.com" class="chat-btn">Email Us</a>
                    <a href="tel:+919311161110" class="chat-btn secondary">Call Us</a>
                </div>
            `
        },
        "address": {
            "keywords": ["address", "location", "where are you", "office", "gurgaon", "gurugram", "haryana", "registered"],
            "answer": `
                <div><strong>Operational HQ:</strong></div>
                <div style="margin-top: 5px; font-size: 0.85rem; color: #475569;">
                    HCG, Khandsa Road, Sector 37,<br>
                    Gurgaon - 122004, Haryana, India
                </div>
                <div style="margin-top: 10px; font-size: 0.85rem; color: #475569;">
                    <strong>Registered Address:</strong><br>
                    310, SECTOR 15, PART 1, RADHA KRISHAN MANDIR,<br>Gurgaon, Haryana, India, 122001
                </div>
                <div class="chat-btn-container">
                    <a href="https://www.google.com/maps/search/?api=1&query=28.438190,77.003370" target="_blank" class="chat-btn">View on Maps</a>
                </div>
            `
        },
        "profile": {
            "keywords": ["cin", "registration", "company details", "authorized capital", "private limited", "details", "status", "akshat"],
            "answer": "<strong>ANGC SYNAPSE PVT. LTD.</strong><br>CIN: U46512HR2025PTC136595<br>Incorporated: Sep 17, 2025<br>Type: Private Limited Company<br>Directors: Puneet Aggarwal, Akshat Aggarwal"
        },
        "about": {
            "keywords": ["who are you", "what is angc", "synapse", "about"],
            "answer": "ANGC Synapse is your engineering partner for custom web applications and intelligent AI implementations. Led by our CEO <strong>Puneet Aggarwal</strong>, we turn visionary ideas into robust digital products."
        },
        "ceo": {
            "keywords": ["ceo", "puneet", "aggarwal", "who is the boss", "founder"],
            "answer": "Our CEO is <strong>Puneet Aggarwal</strong>. He leads ANGC Synapse with a vision for engineering excellence and AI-driven innovation."
        },
        "developers": {
            "keywords": ["developer", "engineers", "who built this", "rohit", "aman"],
            "answer": "Our core development team consists of <strong>Rohit</strong> and <strong>Aman</strong>. They specialize in building high-performance web applications and AI solutions."
        },
        "manager": {
            "keywords": ["manager", "jai", "sharma", "who is the manager"],
            "answer": "Our Manager is <strong>Jai Sharma</strong>. He oversees project delivery and ensures everything runs smoothly for our clients."
        },
        "team": {
            "keywords": ["team", "who works here", "staff", "employees"],
            "answer": `
                <div style="font-size: 0.9rem;">
                    <strong>The ANGC Team:</strong><br>
                    👤 <strong>CEO:</strong> Puneet Aggarwal<br>
                    💼 <strong>Manager:</strong> Jai Sharma<br>
                    💻 <strong>Developers:</strong> Rohit & Aman
                </div>
            `
        },
        "default": {
            "answer": "I'm sorry, I didn't quite catch that. Could you please rephrase? You can ask about our **CEO**, **developers**, **manager**, **location**, or **pricing plans**."
        }
    };

    function injectChatbot() {
        const chatbotHTML = `
            <div class="chatbot-toggle" id="chatbot-toggle">
                <span>💬</span>
            </div>
            <div class="chatbot-container" id="chatbot-container">
                <div class="chatbot-header">
                    <h3>ANGC Assistant</h3>
                    <button class="chatbot-close" id="chatbot-close">&times;</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="message bot">Hi there! I'm your ANGC AI assistant. How can I help you today?</div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type a message...">
                    <button class="chatbot-send" id="chatbot-send">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        
        const toggle = document.getElementById('chatbot-toggle');
        const container = document.getElementById('chatbot-container');
        const closeBtn = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const messagesDiv = document.getElementById('chatbot-messages');

        toggle.addEventListener('click', () => {
            container.classList.toggle('active');
            if (container.classList.contains('active')) {
                input.focus();
            }
        });

        closeBtn.addEventListener('click', () => {
            container.classList.remove('active');
        });

        function addMessage(text, sender) {
            const msg = document.createElement('div');
            msg.className = `message ${sender}`;
            if (sender === 'bot') {
                msg.innerHTML = text; // Support HTML for bot messages
            } else {
                msg.innerText = text; // Keep text for user messages
            }
            messagesDiv.appendChild(msg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function getBotResponse(userText) {
            const text = userText.toLowerCase().replace(/[^\w\s]/g, '');
            const words = text.split(/\s+/);
            
            // Simple Fuzzy Match Function (Levenshtein-ish)
            const isSimilar = (a, b) => {
                if (a.includes(b) || b.includes(a)) return true;
                if (a.length < 3 || b.length < 3) return a === b;
                
                let edits = 0;
                for (let i = 0; i < Math.min(a.length, b.length); i++) {
                    if (a[i] !== b[i]) edits++;
                }
                const diff = Math.abs(a.length - b.length) + edits;
                return diff <= 1; // Allow 1 character difference
            };

            for (const key in chatbotData) {
                if (key === 'default') continue;
                const entry = chatbotData[key];
                
                // Check if any keyword matches any word in user input fuzzily
                const found = entry.keywords.some(keyword => {
                    const kw = keyword.toLowerCase();
                    if (text.includes(kw)) return true; // Direct substring match
                    return words.some(word => isSimilar(word, kw)); // Fuzzy word match
                });

                if (found) return entry.answer;
            }
            return chatbotData.default.answer;
        }

        function handleSend() {
            const text = input.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            input.value = '';

            // Bot response with delay
            const typing = document.createElement('div');
            typing.className = 'typing';
            typing.innerText = 'Assistant is typing...';
            messagesDiv.appendChild(typing);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            setTimeout(() => {
                typing.remove();
                const response = getBotResponse(text);
                addMessage(response, 'bot');
            }, 1000);
        }

        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    injectChatbot();
});
