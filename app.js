// Shared JS: product data, rendering, filters, compare, and utils

// Sample catalog mapped to your existing images
const PRODUCTS = [
  {id:'p1', name:'Blooming Delight', price:3990, image:'bloom.jpg.jpg', category:'Birthdays', flowerType:'Roses', summary:'Cheerful bouquet perfect for birthdays.', docUrl:'docs/product-p1.docx'},
  {id:'p2', name:'Blossom Haven', price:14500, image:'noor.jpg.jpg', category:'Anniversaries', flowerType:'Lilies', summary:'Elegant arrangement to celebrate milestones.', docUrl:'docs/product-p2.docx'},
  {id:'p3', name:'Pink Paradise', price:3900, image:'pink.jpg.jpg', category:'Birthdays', flowerType:'Carnations', summary:'Soft pink tones with a sweet vibe.', docUrl:'docs/product-p3.docx'},
  {id:'p4', name:'Pouring Love', price:4300, image:'pouring.jpg.jpg', category:'Marriages', flowerType:'Roses', summary:'Romantic gift set for the special day.', docUrl:'docs/product-p4.docx'},
  {id:'p5', name:'Sweets', price:4300, image:'final.jpg.jpg', category:'Birthdays', flowerType:'Mixed', summary:'Sweet treats paired with florals.', docUrl:'docs/product-p5.docx'},
  {id:'p6', name:'Deluxe Delight', price:7500, image:'mithai.jpg.jpg', category:'Anniversaries', flowerType:'Mixed', summary:'Premium hamper with mithai and blooms.', docUrl:'docs/product-p6.docx'},
  {id:'p7', name:'Chocolate Treat', price:3900, image:'chocolate.jpg.jpg', category:'Birthdays', flowerType:'Mixed', summary:'Chocolate and flowers combo.', docUrl:'docs/product-p7.docx'},
  {id:'p8', name:'Cherished Hamper', price:7900, image:'cherished.jpg.jpg', category:'Marriages', flowerType:'Roses', summary:'Curated hamper to cherish moments.', docUrl:'docs/product-p8.docx'}
];

const CATEGORIES = ['Birthdays','Anniversaries','Marriages'];
const FLOWER_TYPES = ['Roses','Lilies','Carnations','Mixed'];

// Utilities
function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function formatPKR(v){ return 'PKR ' + v.toLocaleString(); }

// Render a product card
function productCard(p){
  return `
  <div class="col">
    <div class="card h-100 shadow-sm">
      <img src="${p.image}" class="card-img-top" alt="${p.name}">
      <div class="card-body">
        <h5 class="card-title">${p.name}</h5>
        <p class="card-text small text-muted mb-2">${p.summary}</p>
        <div class="d-flex align-items-center justify-content-between">
          <span class="price">${formatPKR(p.price)}</span>
          <div class="form-check">
            <input class="form-check-input compare-check" type="checkbox" value="${p.id}" id="cmp-${p.id}">
            <label class="form-check-label" for="cmp-${p.id}">Compare</label>
          </div>
        </div>
      </div>
      <div class="card-footer bg-white d-flex gap-2">
        <a class="btn btn-sm btn-outline-secondary" href="${p.docUrl}" download>Details (DOCX)</a>
        <a class="btn btn-sm btn-brand" href="products.html?flower=${encodeURIComponent(p.flowerType)}">More ${p.flowerType}</a>
      </div>
    </div>
  </div>`;
}

// Load compare state
function loadCompare(){
  try { return JSON.parse(localStorage.getItem('compare')||'[]'); } catch { return []; }
}
function saveCompare(list){ localStorage.setItem('compare', JSON.stringify(list)); }

// Initialize Products page
function initProductsPage(){
  const grid = qs('#products-grid');
  if(!grid) return; // not on this page

  const query = new URLSearchParams(location.search);
  const byFlower = query.get('flower');
  const byCategory = query.get('category');

  const chipsCat = qs('#chips-categories');
  const chipsFlower = qs('#chips-flowers');

  // build filter chips
  CATEGORIES.forEach(c=>{
    const b = document.createElement('span');
    b.className = 'badge text-bg-light border me-2 mb-2 badge-filter';
    b.textContent = c;
    b.addEventListener('click',()=>{
      render({category:c});
      history.replaceState({},'',`?category=${encodeURIComponent(c)}`);
    });
    chipsCat.appendChild(b);
  });
  FLOWER_TYPES.forEach(f=>{
    const b = document.createElement('span');
    b.className = 'badge text-bg-light border me-2 mb-2 badge-filter';
    b.textContent = f;
    b.addEventListener('click',()=>{
      render({flower:f});
      history.replaceState({},'',`?flower=${encodeURIComponent(f)}`);
    });
    chipsFlower.appendChild(b);
  });

  function render(filter){
    const list = PRODUCTS.filter(p=>{
      if(filter?.flower) return p.flowerType===filter.flower;
      if(filter?.category) return p.category===filter.category;
      if(byFlower) return p.flowerType===byFlower;
      if(byCategory) return p.category===byCategory;
      return true;
    });

    grid.innerHTML = list.map(productCard).join('');

    // wire compare checkboxes
    const selected = new Set(loadCompare());
    qsa('.compare-check', grid).forEach(chk=>{
      if(selected.has(chk.value)) chk.checked = true;
      chk.addEventListener('change', e=>{
        const cur = new Set(loadCompare());
        if(e.target.checked) cur.add(chk.value); else cur.delete(chk.value);
        saveCompare([...cur]);
      });
    });
  }

  render({});
}

// Initialize Home featured section with carousel
function initHome(){
  const track = qs('#cardsTrack');
  if(!track) return;
  
  const prevBtn = qs('#prevBtn');
  const nextBtn = qs('#nextBtn');
  const indicatorsWrap = qs('#indicators');
  const carousel = qs('.cards-carousel');
  
  let activeIndex = 0;
  let autoplayInterval;

  // Render all products as card items
  const cardHTML = PRODUCTS.map(p => `
    <div class="card-item">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}" style="height: 280px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text small text-muted mb-2">${p.summary}</p>
          <div class="d-flex align-items-center justify-content-between">
            <span class="price">${formatPKR(p.price)}</span>
          </div>
        </div>
        <div class="card-footer bg-white d-flex gap-2">
          <a class="btn btn-sm btn-outline-secondary" href="${p.docUrl}" download>Details</a>
          <a class="btn btn-sm btn-brand" href="products.html?flower=${encodeURIComponent(p.flowerType)}">More ${p.flowerType}</a>
        </div>
      </div>
    </div>
  `).join('');
  
  track.innerHTML = cardHTML;
  
  const cardNodes = qsa('.card', track);
  if(!cardNodes.length) return;

  // Create indicators
  const indicators = cardNodes.map((_, idx) => {
    const dot = document.createElement('button');
    if (idx === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      setActive(idx);
      scrollToCard(idx);
    });
    indicatorsWrap.appendChild(dot);
    return dot;
  });

  function setActive(idx) {
    cardNodes[activeIndex].classList.remove('active');
    indicators[activeIndex].classList.remove('active');

    activeIndex = ((idx % cardNodes.length) + cardNodes.length) % cardNodes.length;

    cardNodes[activeIndex].classList.add('active');
    indicators[activeIndex].classList.add('active');
  }

  function scrollToCard(idx) {
    const card = cardNodes[idx].closest('.card-item');
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = cardRect.left - trackRect.left + track.scrollLeft;
    const scrollPos = offset - (track.clientWidth - card.offsetWidth) / 2;

    track.scrollTo({ left: scrollPos, behavior: 'smooth' });
  }

  // Navigation buttons
  prevBtn.addEventListener('click', () => {
    setActive(activeIndex - 1);
    scrollToCard(activeIndex);
  });

  nextBtn.addEventListener('click', () => {
    setActive(activeIndex + 1);
    scrollToCard(activeIndex);
  });

  // Autoplay
  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      setActive(activeIndex + 1);
      scrollToCard(activeIndex);
    }, 3000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Start autoplay immediately
  startAutoplay();

  // Pause/resume on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Card click sets active
  cardNodes.forEach((card, i) => {
    card.addEventListener('click', () => {
      setActive(i);
      scrollToCard(i);
    });
  });

  // Set first card active
  setActive(0);
}

// Initialize Compare page
function initCompare(){
  const wrap = qs('#compare-wrap');
  if(!wrap) return;
  const ids = loadCompare();
  const items = PRODUCTS.filter(p=>ids.includes(p.id));
  if(!items.length){
    wrap.innerHTML = '<p class="text-muted">No products selected. Go to Products and tick "Compare".</p>';
    return;
  }
  const cols = items.map(p=>`
    <th class="text-center">
      <img src="${p.image}" alt="${p.name}" style="height:120px;object-fit:cover" class="mb-2 d-block mx-auto">
      <div>${p.name}</div>
      <div class="price">${formatPKR(p.price)}</div>
    </th>`).join('');

  const row = (label, fn) => `<tr><th>${label}</th>${items.map(fn).join('')}</tr>`;

  wrap.innerHTML = `
    <div class="table-responsive">
      <table class="table align-middle">
        <thead><tr><th></th>${cols}</tr></thead>
        <tbody>
          ${row('Category', p=>`<td class="text-center">${p.category}</td>`)}
          ${row('Flower', p=>`<td class="text-center">${p.flowerType}</td>`)}
          ${row('Summary', p=>`<td class="small">${p.summary}</td>`)}
          ${row('Details', p=>`<td><a href="${p.docUrl}" download>Download DOCX</a></td>`)}
        </tbody>
      </table>
      <button class="btn btn-outline-secondary" id="clear-compare">Clear selection</button>
    </div>`;

  qs('#clear-compare').addEventListener('click', ()=>{ saveCompare([]); location.reload(); });
}

// Contact page: map init
function initContact(){
  const mapDiv = qs('div#map');
  if(!mapDiv) return;
  const map = L.map('map').setView([24.8607, 67.0011], 12); // Karachi as example
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  const shop = L.marker([24.8607, 67.0011]).addTo(map);
  shop.bindPopup('<b>Floral Boutique</b><br>Shop no. 12, Main Street, Karachi');

  // Geolocate the user (optional)
  const locBtn = qs('#locate-me');
  if(locBtn && navigator.geolocation){
    locBtn.addEventListener('click', ()=>{
      navigator.geolocation.getCurrentPosition(pos=>{
        const {latitude, longitude} = pos.coords;
        L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();
        map.setView([latitude, longitude], 13);
      });
    });
  }
}

// Initialize Background Slider
function initBgSlider(){
  const slides = qsa('.bg-slide');
  const dotsContainer = qs('#bgSliderDots');
  
  if(!slides.length || !dotsContainer) return;
  
  let currentSlide = 0;
  let bgSliderInterval;
  
  // Create dots
  const dots = slides.map((_, idx) => {
    const dot = document.createElement('button');
    if(idx === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToSlide(idx);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
    return dot;
  });
  
  function goToSlide(n){
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = n;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }
  
  function nextSlide(){
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }
  
  function startAutoplay(){
    bgSliderInterval = setInterval(nextSlide, 4000);
  }
  
  function resetAutoplay(){
    clearInterval(bgSliderInterval);
    startAutoplay();
  }
  
  startAutoplay();
}

// Initialize Header Mobile Toggler
function initHeaderToggler(){
  const toggler = qs('#headerToggler');
  const nav = qs('#headerNav');
  
  if(!toggler || !nav) return;
  
  toggler.addEventListener('click', ()=>{
    nav.classList.toggle('show');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e)=>{
    if(!toggler.contains(e.target) && !nav.contains(e.target)){
      nav.classList.remove('show');
    }
  });
  
  // Close menu when a link is clicked
  qsa('a', nav).forEach(link=>{
    link.addEventListener('click', ()=>{
      nav.classList.remove('show');
    });
  });
}

// Initialize Search Functionality
function initSearch(){
  const searchForm = qs('.search-form');
  const searchInput = qs('.search-input');
  
  if(!searchForm || !searchInput) return;
  
  searchForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if(query){
      // Redirect to products page with search query
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  });
  
  // Add live search suggestions (optional)
  searchInput.addEventListener('input', (e)=>{
    const query = e.target.value.trim().toLowerCase();
    
    if(query.length > 2){
      // Filter products based on search query
      const results = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.flowerType.toLowerCase().includes(query)
      );
      
      // You can display suggestions here if needed
      console.log('Search results:', results);
    }
  });
}

// Initialize Themes Slider
function initThemesSlider(){
  const track = qs('#themesTrack');
  const prevBtn = qs('#themePrev');
  const nextBtn = qs('#themeNext');
  const dotsContainer = qs('#themeDots');
  
  if(!track) {
    console.log('Themes track not found');
    return;
  }
  
  console.log('Initializing themes slider...');
  
  // Theme data with images arranged by occasion
  const themes = [
    {
      title: 'Birthdays',
      icon: '🎂',
      description: 'Bright and joyful arrangements, party-ready hampers.',
      images: ['sale.jpg', 'brown.jpg', 'sun.jpg'],
      category: 'Birthdays'
    },
    {
      title: 'Anniversaries',
      icon: '💕',
      description: 'Elegant florals that celebrate lasting love.',
      images: ['gajra.jpg', 'small.jpg', 'box.jpg'],
      category: 'Anniversaries'
    },
    {
      title: 'Marriages',
      icon: '💐',
      description: 'Romantic sets fit for wedding moments.',
      images: ['get.jpg', 'grey.jpg', 'bouq.jpg'],
      category: 'Marriages'
    },
    {
      title: 'Special Occasions',
      icon: '🎉',
      description: 'Unique arrangements for memorable celebrations.',
      images: ['lol.jpg', 'blue.jpg', 'bow.jpg'],
      category: 'Birthdays'
    }
  ];
  
  let currentIndex = 0;
  let autoplayInterval;
  
  // Render theme cards
  const cardsHTML = themes.map((theme, idx) => `
    <div class="theme-card" data-index="${idx}">
      <img src="${theme.images[0]}" alt="${theme.title}" class="theme-card-image">
      <div class="theme-card-content">
        <div class="theme-card-icon">${theme.icon}</div>
        <h3 class="theme-card-title">${theme.title}</h3>
        <p class="theme-card-desc">${theme.description}</p>
        <a href="products.html?category=${encodeURIComponent(theme.category)}" class="theme-card-btn">
          <span>Explore ${theme.title}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  `).join('');
  
  track.innerHTML = cardsHTML;
  console.log('Cards rendered:', themes.length);
  
  // Set first card as active
  const firstCard = track.querySelector('.theme-card');
  if(firstCard) {
    firstCard.classList.add('active');
    console.log('First card set as active');
  }
  
  // Create dots
  const dots = [];
  if(dotsContainer){
    themes.forEach((_, idx) => {
      const dot = document.createElement('button');
      if(idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });
  }
  
  function setActive(idx) {
    const cardNodes = qsa('.theme-card', track);
    cardNodes[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    currentIndex = ((idx % cardNodes.length) + cardNodes.length) % cardNodes.length;

    cardNodes[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
  }

  function scrollToCard(idx) {
    const card = qsa('.theme-card', track)[idx];
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = cardRect.left - trackRect.left + track.scrollLeft;
    const scrollPos = offset - (track.clientWidth - card.offsetWidth) / 2;

    track.scrollTo({ left: scrollPos, behavior: 'smooth' });
  }
  
  function goToSlide(index){
    setActive(index);
    scrollToCard(index);
  }
  
  function nextSlide(){
    const nextIndex = (currentIndex + 1) % themes.length;
    goToSlide(nextIndex);
  }
  
  function prevSlide(){
    const prevIndex = (currentIndex - 1 + themes.length) % themes.length;
    goToSlide(prevIndex);
  }
  
  // Navigation
  if(prevBtn) prevBtn.addEventListener('click', prevSlide);
  if(nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  // Autoplay
  function startAutoplay(){
    autoplayInterval = setInterval(nextSlide, 4000);
  }
  
  function stopAutoplay(){
    clearInterval(autoplayInterval);
  }
  
  startAutoplay();
  
  // Pause on hover
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);
  
  // Card hover effect - cycle through images with smooth transition
  const cards = qsa('.theme-card', track);
  console.log('Setting up hover for', cards.length, 'cards');
  
  cards.forEach((card, idx) => {
    let imageIndex = 0;
    const images = themes[idx].images;
    const img = card.querySelector('.theme-card-image');
    let cycleInterval;
    
    console.log(`Card ${idx} has images:`, images);
    
    card.addEventListener('mouseenter', () => {
      console.log(`Hovering over card ${idx}`);
      cycleInterval = setInterval(() => {
        imageIndex = (imageIndex + 1) % images.length;
        console.log(`Card ${idx} showing image ${imageIndex}: ${images[imageIndex]}`);
        // Smooth fade transition
        img.style.opacity = '0';
        setTimeout(() => {
          img.src = images[imageIndex];
          img.style.opacity = '1';
        }, 200);
      }, 1500);
    });
    
    card.addEventListener('mouseleave', () => {
      console.log(`Mouse left card ${idx}`);
      if(cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
      }
      // Smooth reset to first image
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = images[0];
        img.style.opacity = '1';
        imageIndex = 0;
      }, 200);
    });
  });
}

// Run initializers
window.addEventListener('DOMContentLoaded',()=>{
  initHeaderToggler();
  initBgSlider();
  initHome();
  initThemesSlider();
  initSearch();
  initProductsPage();
  initCompare();
  initContact();
});
