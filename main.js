document.addEventListener('DOMContentLoaded', () => {
    // --- Toast System ---
    function createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    window.showToast = function(message, type = 'success') {
        createToastContainer();
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '✅' : '❌';
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    };

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70, // Header offset
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form Submission Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'Sending...';
            btn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
                _subject: document.getElementById('subject')?.value || "New IT Infrastructure Enquiry",
                _template: "table",
                _captcha: false,
                _honey: "" // Spam protection (leave empty)
            };

            // 1. Abort Controller for Timeouts
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 10000); 

            try {
                console.log('🚀 Form Submission Started...', new Date().toLocaleTimeString());
                
                // 2. Local Database Save (Background)
                const localController = new AbortController();
                const localId = setTimeout(() => localController.abort(), 1500);
                
                fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        message: formData.message,
                        subject: formData._subject
                    }),
                    signal: localController.signal
                })
                .then(r => r.ok ? console.log('✅ Local Log Success') : console.warn('⚠️ Local Server Error'))
                .catch(() => console.warn('⚠️ Local Server Offline'))
                .finally(() => clearTimeout(localId));

                // 3. Primary Email Send via FormSubmit.co
                console.time('⌛ Email Delivery');
                const emailResponse = await fetch('https://formsubmit.co/ajax/rohitroody47@gmail.com', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json' 
                    },
                    body: JSON.stringify(formData),
                    signal: controller.signal
                });
                console.timeEnd('⌛ Email Delivery');

                let result;
                const resultText = await emailResponse.text();
                try {
                    result = JSON.parse(resultText);
                } catch (e) {
                    console.error('❌ Response was not JSON:', resultText);
                    throw new Error('Server returned invalid response. Please check your activation.');
                }

                if (emailResponse.ok && result.success !== "false" && result.success !== false) {
                    console.log('🎉 Form Delivered Successfully!', result);
                    showToast('Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                } else {
                    console.error('❌ FormSubmit Error Details:', result || resultText);
                    throw new Error(result?.message || 'FormSubmit delivery failed. Have you activated your email?');
                }
            } catch (error) {
                console.error('❌ Submission Error:', error);
                const message = error.message || 'Unknown error occurred.';
                
                if (error.name === 'AbortError') {
                    showToast('Connection timeout. The server is taking too long to respond.', 'error');
                } else if (message.includes('Failed to fetch')) {
                    showToast('Connection Blocked! Please disable any ad-blockers or try a different browser.', 'error');
                } else {
                    showToast('Error: ' + message, 'error');
                }
            } finally {
                clearTimeout(id);
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
                console.log('🏁 Submission Process Finished.');
            }
        });
    }

    // Header sticky-hide on scroll
    const header = document.getElementById('main-header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/show logic
        if (currentScrollY > lastScrollY && currentScrollY > 500) {
            // Scrolling Down
            header.classList.add('header-hidden');
        } else if (currentScrollY < lastScrollY) {
            // Scrolling Up
            header.classList.remove('header-hidden');
        }
        
        lastScrollY = currentScrollY;
    });

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('faq-active');
        });
    });

    // Active Link Highlighting
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when any nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Dynamic Auth Button Logic - update BOTH desktop and mobile buttons
    function updateAuthButton() {
        const desktopBtn = document.querySelector('.auth-nav-btn');
        const mobileAuthBtn = document.querySelector('.mobile-auth-btn');
        const mobileHeaderAuth = document.querySelector('.mobile-header-auth');
        const allBtns = [desktopBtn, mobileAuthBtn, mobileHeaderAuth].filter(Boolean);
        
        if (allBtns.length === 0) return;

        const user = localStorage.getItem('user');
        const isKnownUser = localStorage.getItem('isKnownUser');

        allBtns.forEach(btn => {
            if (user) {
                btn.innerText = 'Logout';
                btn.href = '#';
                btn.onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem('user');
                    showToast('Logged out successfully', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                };
            } else if (isKnownUser) {
                btn.innerText = 'Login';
                btn.href = 'auth.html?mode=login';
                btn.onclick = null;
            } else {
                btn.innerText = 'Signup';
                btn.href = 'auth.html?mode=signup';
                btn.onclick = null;
            }
        });
    }

    updateAuthButton();

    // Theme Toggle (default is light mode)
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved dark preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Search Suggestions Logic
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    const searchIndex = [
        { title: 'Cloud Infrastructure', url: 'cloud.html', cat: 'Platforms' },
        { title: 'Cybersecurity', url: 'security.html', cat: 'Platforms' },
        { title: 'Network Architecture', url: 'network.html', cat: 'Platforms' },
        { title: 'Managed IT', url: 'index.html#services', cat: 'Services' },
        { title: 'AI Integration', url: 'index.html#services', cat: 'Services' },
        { title: 'Data Analytics', url: 'index.html#services', cat: 'Services' },
        { title: 'About ANGC', url: 'about.html', cat: 'Company' },
        { title: 'Careers', url: 'index.html#about', cat: 'Company' },
        { title: 'Methodology', url: 'index.html#process', cat: 'Process' },
        { title: 'Contact Us', url: 'index.html#contact', cat: 'Support' }
    ];

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 1) {
                searchResults.classList.remove('active');
                return;
            }

            const filtered = searchIndex.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.cat.toLowerCase().includes(query)
            );

            if (filtered.length > 0) {
                searchResults.innerHTML = filtered.map(item => `
                    <a href="${item.url}" class="result-item">
                        <span>${item.title}</span>
                        <span class="result-category">${item.cat}</span>
                    </a>
                `).join('');
                searchResults.classList.add('active');
            } else {
                searchResults.innerHTML = '<div class="result-item">No results found</div>';
                searchResults.classList.add('active');
            }
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // Shortcut focus (Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    // --- Chatbot System ---
    const chatbotData = {
        "greetings": {
            "keywords": ["hi", "hello", "hey", "hola", "greetings"],
            "answer": "Hello! Welcome to ANGC Synapse. How can I assist you with your IT infrastructure today?"
        },
        "whats_up": {
            "keywords": ["whats up", "how are you", "how goes it"],
            "answer": "I'm doing great, thank you! I'm here to help you navigate our enterprise-grade AI-driven IT solutions. How can I help you today?"
        },
        "plans": {
            "keywords": ["plans", "pricing", "subscription", "cost", "charge"],
            "answer": `
                <div class="chat-card-container">
                    <div class="plan-card silver">
                        <div class="plan-header"><span class="plan-title">Silver Tier</span><span class="plan-price">$99/mo</span></div>
                        <ul class="plan-features">
                            <li>Essential Cloud Infrastructure</li>
                            <li>Standard Security Patching</li>
                            <li>9x5 Email Support</li>
                        </ul>
                    </div>
                    <div class="plan-card gold">
                        <div class="plan-header"><span class="plan-title">Gold Tier</span><span class="plan-price">$299/mo</span></div>
                        <ul class="plan-features">
                            <li>Advanced Multi-cloud Setup</li>
                            <li>AI-driven Threat Detection</li>
                            <li>24/7 Priority Support</li>
                        </ul>
                    </div>
                    <div class="plan-card platinum">
                        <div class="plan-header"><span class="plan-title">Platinum Tier</span><span class="plan-price">$999/mo</span></div>
                        <ul class="plan-features">
                            <li>Custom Global Architecture</li>
                            <li>Zero-Trust Security Suite</li>
                            <li>Dedicated Solutions Architect</li>
                        </ul>
                    </div>
                </div>
            `
        },
        "contact": {
            "keywords": ["contact", "email", "phone", "call", "reach", "support", "help"],
            "answer": `
                <div>Our expert architects are ready to help you scale. How would you like to connect?</div>
                <div class="chat-btn-container">
                    <a href="mailto:jai616263@gmail.com" class="chat-btn">Email Us</a>
                    <a href="tel:9311161110" class="chat-btn secondary">Call Us</a>
                </div>
            `
        },
        "security": {
            "keywords": ["security", "safe", "cybersecurity", "protection", "zero trust", "firewall"],
            "answer": "Security is our core principle. We implement Zero-Trust architectures and AI-driven threat detection to ensure your infrastructure is protected 24/7/365."
        },
        "methodology": {
            "keywords": ["methodology", "process", "steps", "how you work", "implementation"],
            "answer": "Our 4-step methodology ensures seamless transformation: 1. Discovery (Audit), 2. Blueprint (Design), 3. Execution (Migration), and 4. Maintain (Optimization)."
        },
        "location": {
            "keywords": ["location", "office", "where are you", "regions", "global"],
            "answer": "ANGC Synapse has a global footprint with infrastructure nodes in 25+ regions, ensuring low-latency connectivity for your users worldwide."
        },
        "uptime": {
            "keywords": ["uptime", "reliability", "sla", "guarantee"],
            "answer": "We guarantee a 99.99% uptime SLA through redundant systems and AI-driven failover mechanisms."
        },
        "careers": {
            "keywords": ["careers", "job", "hiring", "work at angc", "join the team"],
            "answer": "We're always looking for talented architects and engineers! Check out our Careers page to see our open positions and learn about our culture."
        },
        "services_cloud": {
            "keywords": ["cloud", "infrastructure", "migration", "multi-cloud"],
            "answer": "We specialize in end-to-end cloud migration and multi-cloud orchestration for maximum scalability and uptime."
        },
        "services_ai": {
            "keywords": ["ai", "machine learning", "automation", "integration"],
            "answer": "Our AI Integration service leverages cutting-edge machine learning to automate and optimize your business workflows."
        },
        "values": {
            "keywords": ["mission", "vision", "values", "philosophy", "goal"],
            "answer": "Our mission is to redefine enterprise infrastructure through engineering excellence, security-first thinking, and AI-driven optimization."
        },
        "industries": {
            "keywords": ["industries", "sectors", "fintech", "healthcare", "ecommerce", "who do you serve"],
            "answer": "We serve a wide range of industries, including FinTech, Healthcare, E-commerce, and SaaS providers, delivering high-performance infrastructure tailored to their specific regulatory needs."
        },
        "compliance": {
            "keywords": ["compliance", "gdpr", "soc2", "iso", "regulations", "standards"],
            "answer": "We adhere to the highest industry standards, including GDPR, SOC2, and ISO 27001, ensuring your data and infrastructure meet global compliance requirements."
        },
        "history": {
            "keywords": ["history", "founded", "story", "start", "background"],
            "answer": "ANGC Synapse was founded with the vision of creating the 'nervous system' for modern digital businesses, combining traditional reliability with next-generation AI."
        },
        "support_hours": {
            "keywords": ["hours", "open", "available", "support time"],
            "answer": "Our core infrastructure monitoring and emergency support are available 24/7/365. Standard business support is available 9 AM - 6 PM (Local Time)."
        },
        "partnership": {
            "keywords": ["partner", "collaboration", "affiliate", "work together"],
            "answer": "We're always open to strategic partnerships! Please reach out to our team at jai616263@gmail.com to discuss how we can collaborate."
        },
        "about": {
            "keywords": ["who are you", "what is angc", "synapse", "about"],
            "answer": "ANGC Synapse is a leader in enterprise-grade IT infrastructure. We specialize in AI-driven cloud solutions, cybersecurity, and global network architectures."
        },
        "capabilities": {
            "keywords": ["what can you do", "capabilities", "features"],
            "answer": "We provide end-to-end cloud migration, AI threat detection, zero-trust networking, and 24/7 managed IT services."
        },
        "bye": {
            "keywords": ["bye", "goodbye", "exit", "stop"],
            "answer": "Goodbye! Feel free to reach out if you have any more questions. Have a great day!"
        },
        "default": {
            "answer": "I'm sorry, I didn't quite catch that. Could you please rephrase your question? Alternatively, you can use the interactive options below."
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
            const text = userText.toLowerCase();
            for (const key in chatbotData) {
                if (key === 'default') continue;
                if (chatbotData[key].keywords.some(keyword => text.includes(keyword))) {
                    return chatbotData[key].answer;
                }
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
