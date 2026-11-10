/**
 * Summit Roofing - Interactive Photo Gallery & Lightbox (v2 Polish)
 * Features:
 * - 8 High-resolution responsive project photos
 * - Mobile touch swipe navigation (left / right swipe)
 * - Keyboard navigation (Esc, ArrowLeft, ArrowRight)
 * - Accessible focus trapping and focus restoration on close
 */

document.addEventListener("DOMContentLoaded", () => {
  const galleryContainer = document.getElementById("gallery-grid");
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxLocation = document.getElementById("lightbox-location");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCloseBtn = document.getElementById("lightbox-close");
  const lightboxPrevBtn = document.getElementById("lightbox-prev");
  const lightboxNextBtn = document.getElementById("lightbox-next");

  if (!galleryContainer || !window.SITE_CONFIG || !window.SITE_CONFIG.gallery) return;

  const photos = window.SITE_CONFIG.gallery;
  let currentIndex = 0;
  let lastActiveTrigger = null;

  // Render 8-photo grid
  galleryContainer.innerHTML = photos.map((item, index) => `
    <div class="gallery-item group relative h-64 md:h-72 rounded-xl overflow-hidden cursor-pointer shadow-md bg-slate-800"
         data-index="${index}"
         tabindex="0"
         role="button"
         aria-haspopup="dialog"
         aria-label="View photo: ${item.title} - ${item.location}">
      <img src="${item.thumbnail}" 
           alt="${item.title} - ${item.location}" 
           loading="lazy"
           class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
        <span class="inline-block w-fit text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 backdrop-blur-sm px-2.5 py-1 rounded-full mb-1.5">
          ${item.category}
        </span>
        <h3 class="text-white font-bold text-lg leading-snug group-hover:text-amber-300 transition-colors">
          ${item.title}
        </h3>
        <p class="text-slate-300 text-sm flex items-center mt-1">
          <svg class="w-4 h-4 mr-1 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          ${item.location}
        </p>
      </div>
      <div class="absolute top-3 right-3 bg-slate-900/70 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
        </svg>
      </div>
    </div>
  `).join("");

  // Open Lightbox with Focus Management
  function openLightbox(index, triggerEl) {
    currentIndex = index;
    lastActiveTrigger = triggerEl || document.activeElement;
    updateLightboxContent();
    lightboxModal.classList.add("active");
    document.body.style.overflow = "hidden";
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  // Update image and caption
  function updateLightboxContent() {
    const item = photos[currentIndex];
    lightboxImg.src = item.full;
    lightboxImg.alt = `${item.title} - ${item.location}`;
    lightboxTitle.textContent = item.title;
    lightboxLocation.textContent = item.location;
    lightboxCaption.textContent = item.caption;
  }

  // Close Lightbox and restore focus
  function closeLightbox() {
    lightboxModal.classList.remove("active");
    document.body.style.overflow = "";
    if (lastActiveTrigger && typeof lastActiveTrigger.focus === "function") {
      lastActiveTrigger.focus();
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % photos.length;
    updateLightboxContent();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    updateLightboxContent();
  }

  // Grid click handlers
  galleryContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (item) {
      const idx = parseInt(item.getAttribute("data-index"), 10);
      openLightbox(idx, item);
    }
  });

  // Keyboard accessibility on grid items
  galleryContainer.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const item = e.target.closest(".gallery-item");
      if (item) {
        e.preventDefault();
        const idx = parseInt(item.getAttribute("data-index"), 10);
        openLightbox(idx, item);
      }
    }
  });

  // Lightbox controls
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener("click", showNext);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener("click", showPrev);

  // Close on backdrop click
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal || e.target.classList.contains("lightbox-backdrop")) {
        closeLightbox();
      }
    });
  }

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchEndX = 0;

  lightboxModal.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxModal.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      showNext(); // Swiped left -> next
    } else if (touchEndX > touchStartX + swipeThreshold) {
      showPrev(); // Swiped right -> prev
    }
  }

  // Keyboard navigation & modal focus trap
  document.addEventListener("keydown", (e) => {
    if (!lightboxModal.classList.contains("active")) return;

    if (e.key === "Escape") {
      closeLightbox();
      return;
    }
    if (e.key === "ArrowRight") {
      showNext();
      return;
    }
    if (e.key === "ArrowLeft") {
      showPrev();
      return;
    }

    // Tab key focus trap inside dialog
    if (e.key === "Tab") {
      const focusable = lightboxModal.querySelectorAll("button, [tabindex='0']");
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });
});
