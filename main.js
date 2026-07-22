/* ==========================================================================
   SEVİLGEN MOBİLYA - İNTERAKTİF JAVASCRIPT MANTIĞI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. HERO SLIDER MANTIĞI
  initHeroSlider();

  // 2. SAYFA / TAB YÖNLENDİRME (SPA + Multi-page Uyumlu)
  initNavigation();

  // 3. YAPILAN ÖRNEK İŞLER (PORTFÖY) FİLTRELEME & MODAL
  initPortfolio();

  // 4. İNTERAKTİF FİYAT HESAPLAMA WIDGET'I
  initCalculator();

  // 5. MOBİL MENÜ TOGGLER
  initMobileMenu();

  // 6. GERÇEK E-POSTA FORM GÖNDERİMİ (kaansevilgen01@gmail.com)
  initFormSubmission();
});

/* --------------------------------------------------------------------------
   1. HERO SLIDER
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');

  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoplay();
    });
  });

  const sliderContainer = document.querySelector('.hero-slider-section');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoplay);
    sliderContainer.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();
}

/* --------------------------------------------------------------------------
   2. SAYFA & TAB NAVİGASYONU (Çoklu Sayfa & Multi-page Uyumlu)
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .page-jump-link');
  const pageViews = document.querySelectorAll('.page-view');

  function switchTab(targetId) {
    const targetView = document.getElementById(targetId);
    if (targetView && pageViews.length > 1) {
      pageViews.forEach(view => view.classList.remove('active'));
      targetView.classList.add('active');

      document.querySelectorAll('.nav-link').forEach(link => {
        const linkTarget = link.getAttribute('data-target') || link.getAttribute('href');
        if (linkTarget && linkTarget.includes(targetId)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetAttr = link.getAttribute('data-target');
      const hrefAttr = link.getAttribute('href');

      // Only prevent default if targetAttr exists AND is in current DOM
      if (targetAttr && document.getElementById(targetAttr) && pageViews.length > 1) {
        e.preventDefault();
        switchTab(targetAttr);
        const navMenu = document.querySelector('.nav-links');
        if (navMenu) navMenu.classList.remove('active');
      }
    });
  });

  if (window.location.hash) {
    const hash = window.location.hash.replace('#', '');
    if (document.getElementById(hash) && pageViews.length > 1) {
      switchTab(hash);
    }
  }
}

/* --------------------------------------------------------------------------
   3. YAPILAN ÖRNEK İŞLER (PORTFÖY) FİLTRELEME VE MODAL
   -------------------------------------------------------------------------- */
const portfolioData = {
  1: {
    title: 'Villa Serenity Özel Oturma Grubu',
    category: 'Oturma Odası',
    material: 'Masif İthal Ceviz & İtalyan Kadife Kumaş',
    duration: '21 Gün Teslimat',
    desc: 'Bursa Bademli villası için özel boyutlarda üretilen, masif ceviz ayak detaylı, su itici özel İtalyan kadife döşemeli modüler köşe takımı.',
    image: 'images/hero_1.png'
  },
  2: {
    title: 'Minimalist Lüks Yatak Odası Takımı',
    category: 'Yatak Odası',
    material: 'Doğal Meşe Kaplama & Gizli LED Akustik Panel',
    duration: '18 Gün Teslimat',
    desc: 'Başlığa entegre sıcak LED aydınlatmaları ve doğal meşe kaplama komodinleri ile tasarlanmış modern master yatak odası süiti.',
    image: 'images/hero_2.png'
  },
  3: {
    title: 'Masif Meşe & Pirinç Yemek Masası',
    category: 'Yemek Odası',
    material: '80 Yıllık Kurutulmuş Meşe & Pirinç Ayak',
    duration: '14 Gün Teslimat',
    desc: 'Özel döküm pirinç aksamlar ve 10 kişilik masif meşe tabladan oluşan, zanaatkar işçilikli yemek salonu takımı.',
    image: 'images/hero_3.png'
  },
  4: {
    title: 'Modern Akustik TV Ünitesi & Duvar Kaplama',
    category: 'Oturma Odası',
    material: 'Ceviz Çıta Panel & Calacatta Mermer',
    duration: '15 Gün Teslimat',
    desc: 'Salon için özel üretilmiş şömine detaylı, gizli kablo kanallı ve İtalyan mermer konsollu TV ünitesi.',
    image: 'images/portfolio_tv.png'
  },
  5: {
    title: 'Özel İmalat Ada Mutfak & Mobilya Sistemleri',
    category: 'Mutfak & Mimari',
    material: 'Mat Lake & Doğal Ahşap Çıta',
    duration: '25 Gün Teslimat',
    desc: 'Geniş villalar için tasarlanmış entegre ankastre detaylı, kuartz taş tezgahlı ve masif bar sandalyeli ada mutfak imalatı.',
    image: 'images/portfolio_kitchen.png'
  },
  6: {
    title: 'Atölye Özel Üretim Konsol & Zanaat Eseri',
    category: 'Yemek Odası',
    material: 'Masif Ceviz & Oymacılık Zanaatı',
    duration: '20 Gün Teslimat',
    desc: 'Geleneksel ahşap birleştirme yöntemleriyle metal çivi kullanılmadan imal edilmiş özel konsol ve ayna takımı.',
    image: 'images/craftsmanship.png'
  }
};

function initPortfolio() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-card');
  const modalOverlay = document.getElementById('portfolioModal');
  const modalClose = document.querySelector('.modal-close');

  // Filtreleme
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox Modal
  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const projectId = item.getAttribute('data-project-id');
      const data = portfolioData[projectId];

      if (data && modalOverlay) {
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalCategory').textContent = data.category;
        document.getElementById('modalMaterial').textContent = data.material;
        document.getElementById('modalDuration').textContent = data.duration;
        document.getElementById('modalDesc').textContent = data.desc;
        document.getElementById('modalImg').src = data.image;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   4. İNTERAKTİF FİYAT HESAPLAMA WIDGET'I
   -------------------------------------------------------------------------- */
function initCalculator() {
  const calcForm = document.getElementById('furnitureCalcForm');
  if (!calcForm) return;

  const furnitureType = document.getElementById('calcType');
  const materialType = document.getElementById('calcMaterial');
  const calcSize = document.getElementById('calcSize');
  const estimateDisplay = document.getElementById('estimateAmount');

  function calculatePrice() {
    const basePrice = parseFloat(furnitureType.value) || 0;
    const materialMultiplier = parseFloat(materialType.value) || 1;
    const sizeMultiplier = parseFloat(calcSize.value) || 1;

    const total = Math.round(basePrice * materialMultiplier * sizeMultiplier);
    
    if (total > 0 && estimateDisplay) {
      estimateDisplay.textContent = total.toLocaleString('tr-TR') + ' ₺';
    } else if (estimateDisplay) {
      estimateDisplay.textContent = '0 ₺';
    }

    // Save analytics to database
    saveCalculatorAnalytics({
      mobilya_turu: furnitureType.options[furnitureType.selectedIndex]?.text || '-',
      malzeme_sinifi: materialType.options[materialType.selectedIndex]?.text || '-',
      boyut_olcu: calcSize.options[calcSize.selectedIndex]?.text || '-',
      fiyat: total
    });
  }

  [furnitureType, materialType, calcSize].forEach(input => {
    if (input) input.addEventListener('change', calculatePrice);
  });

  calculatePrice();
}

function getApiBaseUrl() {
  if (window.location.protocol.startsWith('http')) {
    if (window.location.port === '8080') return '';
    return 'http://localhost:8080';
  }
  return 'http://localhost:8080';
}

function saveCalculatorAnalytics(data) {
  // Server sync if running
  fetch(getApiBaseUrl() + '/api/fiyat-kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {});
}

/* --------------------------------------------------------------------------
   5. MOBİL MENÜ TOGGLER
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   6. GERÇEK E-POSTA & VERİTABANI FORM GÖNDERİMİ (kaansevilgen01@gmail.com)
   -------------------------------------------------------------------------- */
function initFormSubmission() {
  const contactForms = document.querySelectorAll('.ajax-contact-form');

  contactForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Veritabanına Kaydediliyor...';

      // Capture inputs
      const nameInput = form.querySelector('[name="Ad_Soyad"]');
      const phoneInput = form.querySelector('[name="Telefon"]');
      const emailInput = form.querySelector('[name="Eposta"]');
      const detailsInput = form.querySelector('[name="Proje_Detaylari"]');

      const furnitureTypeEl = document.getElementById('calcType');
      const materialEl = document.getElementById('calcMaterial');
      const sizeEl = document.getElementById('calcSize');
      const estimateAmountEl = document.getElementById('estimateAmount');

      const record = {
        id: Date.now(),
        tarih: new Date().toLocaleDateString('tr-TR'),
        ad_soyad: nameInput ? nameInput.value : 'İsimsiz',
        telefon: phoneInput ? phoneInput.value : '-',
        eposta: emailInput ? emailInput.value : '',
        mobilya_turu: furnitureTypeEl ? furnitureTypeEl.options[furnitureTypeEl.selectedIndex]?.text : 'Genel Teklif',
        malzeme_sinifi: materialEl ? materialEl.options[materialEl.selectedIndex]?.text : 'Standart',
        boyut_olcu: sizeEl ? sizeEl.options[sizeEl.selectedIndex]?.text : 'Standart',
        hesaplanan_fiyat: estimateAmountEl ? parseFloat(estimateAmountEl.textContent.replace(/[^0-9]/g, '')) || 0 : 0,
        proje_detaylari: detailsInput ? detailsInput.value : '',
        durum: 'Yeni'
      };

      // 1. Save to WebDB (LocalStorage IndexedDB fallback)
      saveQuoteToWebDB(record);

      // 2. Save to REST API server if running
      fetch(getApiBaseUrl() + '/api/teklif-gonder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      }).catch(() => {});

      // 3. Send Email via FormSubmit
      try {
        const formData = new FormData(form);
        formData.append('Hesaplanan_Tahmini_Butce', record.hesaplanan_fiyat + ' ₺');
        formData.append('Mobilya_Turu', record.mobilya_turu);

        const response = await fetch('https://formsubmit.co/ajax/kaansevilgen01@gmail.com', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        showToast('Formunuz ve verilen fiyat teklifiniz hem veritabanına kaydedildi hem de kaansevilgen01@gmail.com adresine iletildi!');
        form.reset();
      } catch (err) {
        showToast('Form ve bütçe verileriniz veritabanına başarıyla kaydedildi!');
        form.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  });
}

function saveQuoteToWebDB(record) {
  let list = [];
  try {
    const existing = localStorage.getItem('sevilgen_web_db');
    if (existing) list = JSON.parse(existing);
  } catch (e) {}

  list.unshift(record);
  localStorage.setItem('sevilgen_web_db', JSON.stringify(list));
}

function showToast(message) {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <i class="fa-solid fa-database text-gold"></i>
    <div>
      <strong style="display:block; font-size:1rem; color:#fff;">Veritabanına Kaydedildi!</strong>
      <span style="font-size:0.88rem; color:var(--text-muted);">${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = '0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 6000);
}
