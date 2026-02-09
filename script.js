// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling (prevent default for demo)
const bookingForm = document.querySelector('.form');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(bookingForm);

        const values = {
            name: formData.get('name')?.toString().trim() || '',
            phone: formData.get('phone')?.toString().trim() || '',
            email: formData.get('email')?.toString().trim() || '',
            date: formData.get('date')?.toString().trim() || '',
            serviceType: formData.get('service-type')?.toString().trim() || '',
            vehicleChoice: formData.get('vehicle-choice')?.toString().trim() || '',
            tripDetails: formData.get('trip-details')?.toString().trim() || ''
        };

        const lines = [
            'New Booking Request',
            '',
            `Name: ${values.name}`,
            `Phone: ${values.phone}`,
            `Email: ${values.email}`,
            `Date: ${values.date}`,
            `Service Type: ${values.serviceType}`,
            `Vehicle Choice: ${values.vehicleChoice}`,
            'Trip Details:',
            values.tripDetails
        ];

        const message = lines.join('\n');
        const subject = encodeURIComponent('Booking Request - Raj Limo Service');
        const body = encodeURIComponent(message);

        const mailTo = `mailto:adipsingh96@gmail.com?subject=${subject}&body=${body}`;
        const whatsappText = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/16095925001?text=${whatsappText}`;

        // Open email client and WhatsApp with prefilled details.
        window.location.href = mailTo;
        window.open(whatsappUrl, '_blank', 'noopener');
    });
}

// Services Carousel
class ServicesCarousel {
    constructor() {
        this.container = document.querySelector('.carousel-container');
        this.wrapper = document.querySelector('.carousel-wrapper');
        this.track = document.querySelector('.carousel-track');
        this.nextButton = document.querySelector('.carousel-btn-next');
        this.prevButton = document.querySelector('.carousel-btn-prev');
        this.indicatorsContainer = document.querySelector('.carousel-indicators');

        const initialCards = Array.from(this.track?.querySelectorAll('.service-card') || []);
        this.cardTemplates = initialCards.map((el) => el.cloneNode(true));

        this.cardsPerView = 3;
        this.pagesCount = 0; // real pages (no clones)
        this.currentIndex = 0; // index in track pages including clones
        this.autoPlayInterval = null;
        this.touchStartX = null;
        this.isAnimating = false;

        this.handleResize = this.handleResize.bind(this);
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);

        this.init();
    }
    
    init() {
        if (!this.container || !this.wrapper || !this.track || !this.cardTemplates.length) return;

        this.updateCardsPerView();
        this.build();

        this.nextButton?.addEventListener('click', () => this.next());
        this.prevButton?.addEventListener('click', () => this.prev());
        window.addEventListener('resize', this.handleResize);
        this.track.addEventListener('transitionend', this.handleTransitionEnd);

        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());

        this.addTouchSupport();
        this.startAutoPlay();
    }
    
    updateCardsPerView() {
        this.cardsPerView = window.innerWidth <= 768 ? 1 : 3;
        this.container.style.setProperty('--cards-per-view', String(this.cardsPerView));
    }

    build() {
        // Build "pages" (groups) so each slide is always 3 tiles on desktop / 1 tile on mobile.
        const groups = [];
        for (let i = 0; i < this.cardTemplates.length; i += this.cardsPerView) {
            const group = this.cardTemplates.slice(i, i + this.cardsPerView);
            // If the last page is short, wrap from the start so every slide shows 3/1 tiles.
            if (group.length < this.cardsPerView) {
                const needed = this.cardsPerView - group.length;
                group.push(...this.cardTemplates.slice(0, needed));
            }
            groups.push(group);
        }

        this.pagesCount = groups.length;
        this.track.innerHTML = '';

        const pages = groups.map((group) => {
            const page = document.createElement('div');
            page.className = 'carousel-page';
            group.forEach((tpl) => page.appendChild(tpl.cloneNode(true)));
            return page;
        });

        if (pages.length <= 1) {
            pages.forEach((p) => this.track.appendChild(p));
            this.currentIndex = 0;
            this.createIndicators();
            this.jumpToIndex(this.currentIndex, false);
            this.container.classList.add('is-ready');
            return;
        }

        const firstClone = pages[0].cloneNode(true);
        firstClone.classList.add('is-clone');
        const lastClone = pages[pages.length - 1].cloneNode(true);
        lastClone.classList.add('is-clone');

        this.track.appendChild(lastClone);
        pages.forEach((p) => this.track.appendChild(p));
        this.track.appendChild(firstClone);

        this.currentIndex = 1; // first real page
        this.createIndicators();
        this.jumpToIndex(this.currentIndex, false);
        this.container.classList.add('is-ready');
    }

    pageWidth() {
        return this.wrapper.getBoundingClientRect().width;
    }

    jumpToIndex(index, animate) {
        if (!this.track) return;
        const x = -index * this.pageWidth();
        this.track.style.transition = animate ? '' : 'none';
        this.track.style.transform = `translateX(${x}px)`;
        this.track.style.webkitTransform = this.track.style.transform;

        if (!animate) {
            // Re-enable transitions after the instant jump.
            requestAnimationFrame(() => {
                this.track.style.transition = '';
            });
        }

        this.updateIndicators();
    }

    next() {
        if (this.pagesCount <= 1) return;
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex += 1;
        this.jumpToIndex(this.currentIndex, true);
    }

    prev() {
        if (this.pagesCount <= 1) return;
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex -= 1;
        this.jumpToIndex(this.currentIndex, true);
    }

    goToPage(pageIndex) {
        if (this.pagesCount <= 1) return;
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = pageIndex + 1; // account for leading clone
        this.jumpToIndex(this.currentIndex, true);
    }

    handleTransitionEnd() {
        if (this.pagesCount <= 1) return;

        // Track layout: [lastClone][page0..pageN-1][firstClone]
        if (this.currentIndex === 0) {
            this.currentIndex = this.pagesCount;
            this.jumpToIndex(this.currentIndex, false);
            this.isAnimating = false;
            return;
        }

        if (this.currentIndex === this.pagesCount + 1) {
            this.currentIndex = 1;
            this.jumpToIndex(this.currentIndex, false);
            this.isAnimating = false;
            return;
        }

        this.isAnimating = false;
    }

    createIndicators() {
        if (!this.indicatorsContainer) return;
        this.indicatorsContainer.innerHTML = '';

        for (let i = 0; i < this.pagesCount; i++) {
            const indicator = document.createElement('span');
            indicator.className = 'indicator';
            indicator.setAttribute('data-slide', String(i));
            indicator.addEventListener('click', () => this.goToPage(i));
            this.indicatorsContainer.appendChild(indicator);
        }

        this.updateIndicators();
    }

    updateIndicators() {
        if (!this.indicatorsContainer) return;
        const indicators = Array.from(this.indicatorsContainer.querySelectorAll('.indicator'));
        if (!indicators.length) return;

        const activeIndex = this.pagesCount <= 1
            ? 0
            : (this.currentIndex - 1 + this.pagesCount) % this.pagesCount;

        indicators.forEach((el, i) => {
            el.classList.toggle('active', i === activeIndex);
        });
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        if (this.pagesCount <= 1) return;
        this.autoPlayInterval = setInterval(() => this.next(), 5000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    addTouchSupport() {
        if (!this.wrapper) return;

        this.wrapper.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.stopAutoPlay();
        }, { passive: true });

        this.wrapper.addEventListener('touchend', (e) => {
            if (this.touchStartX == null) return;
            const endX = e.changedTouches[0].clientX;
            const diff = this.touchStartX - endX;
            this.touchStartX = null;

            if (Math.abs(diff) > 50) {
                diff > 0 ? this.next() : this.prev();
            }

            this.startAutoPlay();
        }, { passive: true });
    }

    handleResize() {
        const old = this.cardsPerView;
        this.updateCardsPerView();

        if (old !== this.cardsPerView) {
            this.build();
            return;
        }

        // If only dimensions changed, keep the same index and re-apply transform in px.
        this.jumpToIndex(this.currentIndex, false);
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ServicesCarousel();
});

// Add scroll effect to header
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.6)';
    } else {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
    }
    
    lastScroll = currentScroll;
});
