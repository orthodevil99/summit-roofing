// window.CLIENT_CONFIG loaded from config.js

    var DEFAULT_LEADS = [
      {
        id: "lead_104",
        name: "Marcus Vance",
        phone: "(303) 555-0182",
        email: "mvance.denver@example.com",
        address: "2815 E 4th Ave, Denver, CO 80206",
        roof_type: "Asphalt Shingle",
        service: "Storm Damage",
        message: "Hail storm last week knocked granules into our gutters. Looking for a free inspection.",
        created_at: "2026-11-10T09:15:00.000Z",
        status: "New"
      },
      {
        id: "lead_103",
        name: "Rachel Lindqvist",
        phone: "(303) 555-0134",
        email: "rachel.l@example.com",
        address: "742 S Xenon Ct, Lakewood, CO 80228",
        roof_type: "Metal",
        service: "Replacement",
        message: "Interested in upgrading our 22-year-old shingle roof to standing seam bronze metal.",
        created_at: "2026-11-09T16:40:00.000Z",
        status: "New"
      },
      {
        id: "lead_102",
        name: "Carlos & Sofia Mendez",
        phone: "(720) 555-0168",
        email: "cmendez.home@example.com",
        address: "15900 E Briarwood Cir, Aurora, CO 80016",
        roof_type: "Asphalt Shingle",
        service: "Gutters",
        message: "Need 6-inch seamless gutters and leaf guards on a 2-story home.",
        created_at: "2026-11-09T11:20:00.000Z",
        status: "Scheduled"
      },
      {
        id: "lead_101",
        name: "Brian Holloway",
        phone: "(303) 555-0191",
        email: "bholloway@example.com",
        address: "5810 S Windermere St, Littleton, CO 80120",
        roof_type: "Tile",
        service: "Repair",
        message: "Small leak near the south valley after heavy rain. Need flashing and tile check.",
        created_at: "2026-11-08T14:05:00.000Z",
        status: "Contacted"
      }
    ];

    var appState = {
      currentView: "home",
      galleryCityFilter: "All",
      filteredGallery: [],
      lightboxIndex: 0,
      leadStatusFilter: "All",
      leads: [],
      formLoadedAt: Date.now()
    };

    function loadLeadsFromStorage() {
      try {
        var raw = localStorage.getItem("summit_roofing_leads_v1");
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            appState.leads = parsed;
            return;
          }
        }
      } catch (e) {}
      appState.leads = DEFAULT_LEADS.slice();
    }

    function saveLeadsToStorage() {
      try {
        localStorage.setItem("summit_roofing_leads_v1", JSON.stringify(appState.leads));
      } catch (e) {}
    }

    function loadIntegrationSettings() {
      try {
        var raw = localStorage.getItem("summit_roofing_integrations_v1");
        if (raw) {
          var cfg = JSON.parse(raw);
          if (cfg.googleSheetWebhookUrl) window.CLIENT_CONFIG.googleSheetWebhookUrl = cfg.googleSheetWebhookUrl;
          if (cfg.supabaseUrl) window.CLIENT_CONFIG.supabaseUrl = cfg.supabaseUrl;
          if (cfg.supabaseAnonKey) window.CLIENT_CONFIG.supabaseAnonKey = cfg.supabaseAnonKey;
          if (cfg.formspreeEndpoint) window.CLIENT_CONFIG.formspreeEndpoint = cfg.formspreeEndpoint;
        }
      } catch (e) {}
    }

    var toastTimer = null;
    function showToast(msg) {
      var banner = document.getElementById("toastBanner");
      var text = document.getElementById("toastBannerText");
      if (!banner || !text) return;
      text.textContent = msg;
      banner.classList.remove("hidden");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function() {
        banner.classList.add("hidden");
      }, 4000);
    }

    function handlePhoneClick(event, phoneStr) {
      showToast("Calling " + window.CLIENT_CONFIG.companyName + " at " + phoneStr + "...");
    }

    // Multi-Page View Router ('home' | 'services' | 'gallery' | 'reviews' | 'estimate' | 'thank-you' | 'leads')
    function switchView(viewName) {
      appState.currentView = viewName;
      var views = ["home", "services", "gallery", "reviews", "estimate", "thank-you", "leads"];
      for (var i = 0; i < views.length; i++) {
        var el = document.getElementById("view-" + views[i]);
        if (el) {
          if (views[i] === viewName) {
            el.classList.remove("hidden");
            el.classList.add("block");
          } else {
            el.classList.add("hidden");
            el.classList.remove("block");
          }
        }
      }

      // Update top utility bar tabs
      var tabMap = {
        "home": document.getElementById("utilTabHome"),
        "services": document.getElementById("utilTabServices"),
        "gallery": document.getElementById("utilTabGallery"),
        "reviews": document.getElementById("utilTabReviews"),
        "estimate": document.getElementById("utilTabEstimate"),
        "leads": document.getElementById("utilTabLeads"),
        "thank-you": document.getElementById("utilTabThanks")
      };
      for (var k in tabMap) {
        if (tabMap[k]) {
          if (k === viewName) {
            tabMap[k].className = "px-2 py-1 rounded font-semibold transition bg-amber-500 text-slate-950 flex items-center gap-1";
          } else {
            tabMap[k].className = "px-2 py-1 rounded font-semibold transition bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1";
          }
        }
      }

      // Update main navbar active indicator
      var navPages = ["home", "services", "gallery", "reviews", "estimate"];
      for (var j = 0; j < navPages.length; j++) {
        var navBtn = document.getElementById("navLink-" + navPages[j]);
        if (navBtn) {
          if (navPages[j] === viewName) {
            navBtn.className = "px-3 py-2 rounded-lg transition bg-white/15 text-amber-400";
          } else {
            navBtn.className = "px-3 py-2 rounded-lg transition hover:bg-white/10 hover:text-amber-400";
          }
        }
      }

      if (viewName === "leads") {
        renderLeadsTable();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Navigate to dedicated page ('services', 'gallery', 'reviews', 'estimate')
    function navigateToSection(sectionId, focusFirstInput) {
      switchView(sectionId);
      if (focusFirstInput) {
        setTimeout(function() {
          var nameInput = document.getElementById("leadName");
          if (nameInput) nameInput.focus();
        }, 250);
      }
    }

    function selectServiceAndScroll(serviceVal, roofTypeVal) {
      switchView("estimate");
      var serviceSelect = document.getElementById("leadService");
      if (serviceSelect && serviceVal) {
        serviceSelect.value = serviceVal;
        clearFieldError("leadService");
      }
      var roofSelect = document.getElementById("leadRoofType");
      if (roofSelect && roofTypeVal) {
        roofSelect.value = roofTypeVal;
        clearFieldError("leadRoofType");
      }
      showToast("Opened Free Estimate Page — pre-selected " + serviceVal + ".");
    }

    function toggleMobileMenu() {
      var menu = document.getElementById("mobileMenuDropdown");
      var openIcon = document.getElementById("menuIconOpen");
      var closeIcon = document.getElementById("menuIconClose");
      var btn = document.getElementById("mobileMenuBtn");
      if (!menu) return;
      var isHidden = menu.classList.contains("hidden");
      if (isHidden) {
        menu.classList.remove("hidden");
        openIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
        btn.setAttribute("aria-expanded", "true");
      } else {
        closeMobileMenu();
      }
    }

    function closeMobileMenu() {
      var menu = document.getElementById("mobileMenuDropdown");
      var openIcon = document.getElementById("menuIconOpen");
      var closeIcon = document.getElementById("menuIconClose");
      var btn = document.getElementById("mobileMenuBtn");
      if (!menu) return;
      menu.classList.add("hidden");
      openIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    }

    function filterGallery(city) {
      appState.galleryCityFilter = city;
      var cities = ["All", "Denver", "Aurora", "Lakewood", "Littleton"];
      for (var i = 0; i < cities.length; i++) {
        var btn = document.getElementById("galFilter-" + cities[i]);
        if (btn) {
          if (cities[i] === city) {
            btn.className = "gal-filter-btn px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition brand-navy-bg text-white shadow-sm";
          } else {
            btn.className = "gal-filter-btn px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition bg-white hover:bg-slate-200 text-slate-700 border border-slate-200";
          }
        }
      }
      renderGallery();
    }

    function buildGalleryCardHtml(g, index) {
      return '<div onclick="openLightbox(' + index + ')" class="contractor-card group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col justify-between">' +
        '<div class="relative overflow-hidden bg-slate-900 aspect-[4/3]">' +
          '<img src="' + g.src + '" alt="' + g.title + '" width="720" height="540" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">' +
          '<div class="absolute top-2.5 left-2.5 bg-navy-900/85 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-white/15">' +
            g.city + ', CO' +
          '</div>' +
          '<div class="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow">' +
            g.roofType +
          '</div>' +
          '<div class="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/35 transition flex items-center justify-center">' +
            '<span class="opacity-0 group-hover:opacity-100 transition bg-white text-navy-900 font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">' +
              '🔍 Click to Enlarge' +
            '</span>' +
          '</div>' +
        '</div>' +
        '<div class="p-4">' +
          '<h3 class="font-display font-bold text-sm sm:text-base text-navy-800 group-hover:text-amber-600 transition">' + g.title + '</h3>' +
          '<p class="text-xs text-slate-500 mt-1">' + g.spec + '</p>' +
        '</div>' +
      '</div>';
    }

    function renderGallery() {
      var grid = document.getElementById("galleryGrid");
      var homeGrid = document.getElementById("homeFeaturedGalleryGrid");
      var items = window.CLIENT_CONFIG.gallery.filter(function(item) {
        return appState.galleryCityFilter === "All" || item.city === appState.galleryCityFilter;
      });
      appState.filteredGallery = items;

      if (grid) {
        var html = "";
        for (var i = 0; i < items.length; i++) {
          html += buildGalleryCardHtml(items[i], i);
        }
        grid.innerHTML = html;
      }

      if (homeGrid) {
        var homeHtml = "";
        var topFour = window.CLIENT_CONFIG.gallery.slice(0, 4);
        for (var k = 0; k < topFour.length; k++) {
          homeHtml += buildGalleryCardHtml(topFour[k], k);
        }
        homeGrid.innerHTML = homeHtml;
      }
    }

    function openLightbox(index) {
      if (!appState.filteredGallery || appState.filteredGallery.length === 0) {
        appState.filteredGallery = window.CLIENT_CONFIG.gallery.slice();
      }
      appState.lightboxIndex = index % appState.filteredGallery.length;
      updateLightboxView();
      var modal = document.getElementById("lightboxModal");
      if (modal) modal.classList.remove("hidden");
    }

    function updateLightboxView() {
      var list = appState.filteredGallery;
      if (!list || list.length === 0) return;
      var item = list[appState.lightboxIndex];
      document.getElementById("lightboxCounter").textContent = (appState.lightboxIndex + 1) + " / " + list.length;
      document.getElementById("lightboxTitle").textContent = item.title;
      var img = document.getElementById("lightboxImg");
      img.src = item.src;
      img.alt = item.title;
      document.getElementById("lightboxSpec").textContent = item.spec;
    }

    function stepLightbox(delta) {
      var list = appState.filteredGallery;
      if (!list || list.length === 0) return;
      appState.lightboxIndex = (appState.lightboxIndex + delta + list.length) % list.length;
      updateLightboxView();
    }

    function closeLightbox() {
      var modal = document.getElementById("lightboxModal");
      if (modal) modal.classList.add("hidden");
    }

    function requestSimilarFromLightbox() {
      var item = appState.filteredGallery[appState.lightboxIndex];
      closeLightbox();
      if (item) {
        selectServiceAndScroll(item.service, item.roofType);
      } else {
        navigateToSection("estimate", true);
      }
    }

    document.addEventListener("keydown", function(e) {
      var lb = document.getElementById("lightboxModal");
      if (lb && !lb.classList.contains("hidden")) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") stepLightbox(1);
        if (e.key === "ArrowLeft") stepLightbox(-1);
      } else if (e.key === "Escape") {
        closeModal("customizerModal");
        closeModal("integrationsModal");
      }
    });

    function formatPhoneInput(input) {
      var digits = input.value.replace(/\D/g, "");
      if (digits.length > 10 && digits.charAt(0) === "1") {
        digits = digits.substring(1);
      }
      digits = digits.substring(0, 10);
      if (digits.length === 0) {
        input.value = "";
      } else if (digits.length <= 3) {
        input.value = "(" + digits;
      } else if (digits.length <= 6) {
        input.value = "(" + digits.substring(0, 3) + ") " + digits.substring(3);
      } else {
        input.value = "(" + digits.substring(0, 3) + ") " + digits.substring(3, 6) + "-" + digits.substring(6, 10);
      }
    }

    function setFieldError(fieldId, show) {
      var input = document.getElementById(fieldId);
      var err = document.getElementById("err-" + fieldId);
      if (input) {
        if (show) {
          input.classList.add("border-red-500", "bg-red-50/40");
          input.classList.remove("border-slate-300");
        } else {
          input.classList.remove("border-red-500", "bg-red-50/40");
          input.classList.add("border-slate-300");
        }
      }
      if (err) {
        if (show) err.classList.remove("hidden");
        else err.classList.add("hidden");
      }
    }

    function clearFieldError(fieldId) {
      setFieldError(fieldId, false);
      var banner = document.getElementById("formErrorBanner");
      if (banner) banner.classList.add("hidden");
    }

    function fillDemoLeadData() {
      var samples = [
        {
          name: "Taylor Brooks",
          phone: "(303) 555-0176",
          email: "taylor.brooks@denverhome-demo.com",
          address: "1842 S Pearl St, Denver, CO 80210",
          roofType: "Asphalt Shingle",
          service: "Replacement",
          message: "Our 18-year-old shingle roof took hail damage last month. Would like a free inspection and quote for impact-resistant shingles."
        },
        {
          name: "Morgan Chen",
          phone: "(720) 555-0142",
          email: "mchen.lakewood@example.com",
          address: "9102 W Union Ave, Lakewood, CO 80227",
          roofType: "Metal",
          service: "Inspection",
          message: "Buying a home in Lakewood and need a 21-point roof inspection before closing."
        }
      ];
      var pick = samples[Math.floor(Math.random() * samples.length)];
      document.getElementById("leadName").value = pick.name;
      document.getElementById("leadPhone").value = pick.phone;
      document.getElementById("leadEmail").value = pick.email;
      document.getElementById("leadAddress").value = pick.address;
      document.getElementById("leadRoofType").value = pick.roofType;
      document.getElementById("leadService").value = pick.service;
      document.getElementById("leadMessage").value = pick.message;
      document.getElementById("humanVerifyCheck").checked = true;

      var fields = ["leadName", "leadPhone", "leadEmail", "leadAddress", "leadRoofType", "leadService", "humanVerifyCheck"];
      for (var i = 0; i < fields.length; i++) clearFieldError(fields[i]);
      showToast("Test lead data filled! Click 'Submit & Get My Free Estimate' to test.");
    }

    async function handleEstimateSubmit(event) {
      event.preventDefault();

      var hp = document.getElementById("hp_company_website");
      if (hp && hp.value.trim() !== "") {
        showToast("Spam submission blocked.");
        return;
      }

      var nameVal = document.getElementById("leadName").value.trim();
      var phoneVal = document.getElementById("leadPhone").value.trim();
      var emailVal = document.getElementById("leadEmail").value.trim();
      var addressVal = document.getElementById("leadAddress").value.trim();
      var roofTypeVal = document.getElementById("leadRoofType").value.trim();
      var serviceVal = document.getElementById("leadService").value.trim();
      var messageVal = document.getElementById("leadMessage").value.trim();
      var humanChecked = document.getElementById("humanVerifyCheck").checked;

      var errors = [];
      if (nameVal.length < 2) {
        setFieldError("leadName", true);
        errors.push("Full Name");
      } else {
        setFieldError("leadName", false);
      }

      var phoneDigits = phoneVal.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        setFieldError("leadPhone", true);
        errors.push("10-digit Phone Number");
      } else {
        setFieldError("leadPhone", false);
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        setFieldError("leadEmail", true);
        errors.push("Valid Email Address");
      } else {
        setFieldError("leadEmail", false);
      }

      if (addressVal.length < 5) {
        setFieldError("leadAddress", true);
        errors.push("Property Address");
      } else {
        setFieldError("leadAddress", false);
      }

      if (!roofTypeVal) {
        setFieldError("leadRoofType", true);
        errors.push("Roof Type");
      } else {
        setFieldError("leadRoofType", false);
      }

      if (!serviceVal) {
        setFieldError("leadService", true);
        errors.push("Service Needed");
      } else {
        setFieldError("leadService", false);
      }

      if (!humanChecked) {
        setFieldError("humanVerifyCheck", true);
        errors.push("Spam Protection Check");
      } else {
        setFieldError("humanVerifyCheck", false);
      }

      if (errors.length > 0) {
        var banner = document.getElementById("formErrorBanner");
        var bannerText = document.getElementById("formErrorBannerText");
        if (banner && bannerText) {
          bannerText.textContent = "Missing or invalid: " + errors.join(", ") + ".";
          banner.classList.remove("hidden");
        }
        return;
      }

      var newLead = {
        id: "lead_" + Date.now(),
        name: nameVal,
        phone: phoneVal,
        email: emailVal,
        address: addressVal,
        roof_type: roofTypeVal,
        service: serviceVal,
        message: messageVal || "No additional notes provided.",
        created_at: new Date().toISOString(),
        status: "New"
      };

      var submitBtn = document.getElementById("submitEstimateBtn");
      var submitText = document.getElementById("submitBtnText");
      if (submitBtn && submitText) {
        submitBtn.disabled = true;
        submitText.textContent = "Saving Lead & Sending Notification...";
      }

      var deliveryNotes = ["Local Lead Store ✓"];

      if (window.CLIENT_CONFIG.googleSheetWebhookUrl) {
        try {
          await fetch(window.CLIENT_CONFIG.googleSheetWebhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLead)
          });
          deliveryNotes.push("Google Sheet ✓");
        } catch (e) {}
      }

      if (window.CLIENT_CONFIG.supabaseUrl && window.CLIENT_CONFIG.supabaseAnonKey) {
        try {
          var sbUrl = window.CLIENT_CONFIG.supabaseUrl.replace(/\/$/, "") + "/rest/v1/leads";
          var sbRes = await fetch(sbUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": window.CLIENT_CONFIG.supabaseAnonKey,
              "Authorization": "Bearer " + window.CLIENT_CONFIG.supabaseAnonKey,
              "Prefer": "return=minimal"
            },
            body: JSON.stringify({
              name: newLead.name,
              phone: newLead.phone,
              email: newLead.email,
              address: newLead.address,
              roof_type: newLead.roof_type,
              service: newLead.service,
              message: newLead.message,
              created_at: newLead.created_at,
              status: "New"
            })
          });
          if (sbRes.ok) deliveryNotes.push("Supabase ✓");
        } catch (e) {}
      }

      if (window.CLIENT_CONFIG.formspreeEndpoint) {
        try {
          await fetch(window.CLIENT_CONFIG.formspreeEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(newLead)
          });
          deliveryNotes.push("Formspree Email ✓");
        } catch (e) {}
      }

      appState.leads.unshift(newLead);
      saveLeadsToStorage();
      updateLeadBadges();

      document.getElementById("tyName").textContent = newLead.name;
      document.getElementById("tyPhone").textContent = newLead.phone;
      document.getElementById("tyEmail").textContent = newLead.email;
      document.getElementById("tyAddress").textContent = newLead.address;
      document.getElementById("tyRoofType").textContent = newLead.roof_type;
      document.getElementById("tyService").textContent = newLead.service;
      document.getElementById("tyDeliveryStatus").textContent = deliveryNotes.join(" • ");

      document.getElementById("estimateForm").reset();
      document.getElementById("humanVerifyCheck").checked = true;
      if (submitBtn && submitText) {
        submitBtn.disabled = false;
        submitText.textContent = "Submit & Get My Free Estimate";
      }

      switchView("thank-you");
      showToast("Estimate submitted! Saved to Leads table.");
    }

    function updateLeadBadges() {
      var count = appState.leads.length;
      var ids = ["headerLeadCountBadge", "navLeadBadge", "mobileMenuLeadBadge"];
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.textContent = String(count);
      }
    }

    function setLeadFilter(status) {
      appState.leadStatusFilter = status;
      var statuses = ["All", "New", "Contacted", "Scheduled"];
      for (var i = 0; i < statuses.length; i++) {
        var btn = document.getElementById("leadFilter-" + statuses[i]);
        if (btn) {
          if (statuses[i] === status) {
            btn.className = "lead-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold brand-navy-bg text-white";
          } else {
            btn.className = "lead-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200";
          }
        }
      }
      renderLeadsTable();
    }

    function updateLeadStatus(leadId, newStatus) {
      for (var i = 0; i < appState.leads.length; i++) {
        if (appState.leads[i].id === leadId) {
          appState.leads[i].status = newStatus;
          break;
        }
      }
      saveLeadsToStorage();
      renderLeadsTable();
      showToast("Lead status updated to '" + newStatus + "'");
    }

    function formatReadableDate(isoStr) {
      try {
        var d = new Date(isoStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
               " • " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      } catch (e) {
        return isoStr;
      }
    }

    function renderLeadsTable() {
      updateLeadBadges();
      var total = appState.leads.length;
      var newCount = 0, schedCount = 0, contactedCount = 0;
      for (var i = 0; i < appState.leads.length; i++) {
        var st = appState.leads[i].status;
        if (st === "New") newCount++;
        else if (st === "Scheduled") schedCount++;
        else contactedCount++;
      }

      var elTotal = document.getElementById("kpiTotalLeads");
      var elNew = document.getElementById("kpiNewLeads");
      var elSched = document.getElementById("kpiScheduledLeads");
      var elCont = document.getElementById("kpiContactedLeads");
      if (elTotal) elTotal.textContent = String(total);
      if (elNew) elNew.textContent = String(newCount);
      if (elSched) elSched.textContent = String(schedCount);
      if (elCont) elCont.textContent = String(contactedCount);

      var searchEl = document.getElementById("leadSearchInput");
      var query = searchEl ? searchEl.value.trim().toLowerCase() : "";

      var filtered = appState.leads.filter(function(item) {
        var matchesStatus = (appState.leadStatusFilter === "All") || (item.status === appState.leadStatusFilter);
        var matchesQuery = !query ||
          item.name.toLowerCase().indexOf(query) !== -1 ||
          item.phone.toLowerCase().indexOf(query) !== -1 ||
          item.address.toLowerCase().indexOf(query) !== -1 ||
          item.service.toLowerCase().indexOf(query) !== -1 ||
          item.roof_type.toLowerCase().indexOf(query) !== -1;
        return matchesStatus && matchesQuery;
      });

      var tbody = document.getElementById("leadsTableBody");
      if (!tbody) return;

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-slate-500 text-sm">No leads match the current filter.</td></tr>';
        return;
      }

      var rowsHtml = "";
      for (var j = 0; j < filtered.length; j++) {
        var lead = filtered[j];
        var badgeStyle = "bg-amber-100 text-amber-800 border-amber-300";
        if (lead.status === "Contacted") badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
        if (lead.status === "Scheduled") badgeStyle = "bg-blue-100 text-blue-800 border-blue-300";

        rowsHtml += '<tr class="hover:bg-slate-50 transition">' +
          '<td class="py-4 px-4 align-top">' +
            '<div class="font-bold text-navy-800 text-sm">' + escapeHtml(lead.name) + '</div>' +
            '<div class="text-xs text-slate-500 mt-0.5">' + escapeHtml(lead.address) + '</div>' +
            (lead.message ? '<div class="text-xs text-slate-600 italic mt-1 bg-slate-100 px-2.5 py-1 rounded max-w-md">"' + escapeHtml(lead.message) + '"</div>' : '') +
          '</td>' +
          '<td class="py-4 px-4 align-top whitespace-nowrap">' +
            '<a href="tel:' + escapeHtml(lead.phone) + '" onclick="handlePhoneClick(event, \'' + escapeHtml(lead.phone) + '\')" class="font-bold text-navy-800 hover:text-amber-600 block">' + escapeHtml(lead.phone) + '</a>' +
            '<a href="mailto:' + escapeHtml(lead.email) + '" class="text-xs text-slate-500 hover:underline">' + escapeHtml(lead.email) + '</a>' +
          '</td>' +
          '<td class="py-4 px-4 align-top">' +
            '<span class="inline-block font-bold text-xs px-2.5 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-100">' + escapeHtml(lead.service) + '</span>' +
            '<div class="text-xs text-slate-500 mt-1">Roof: <strong>' + escapeHtml(lead.roof_type) + '</strong></div>' +
          '</td>' +
          '<td class="py-4 px-4 align-top whitespace-nowrap text-xs text-slate-600">' +
            formatReadableDate(lead.created_at) +
          '</td>' +
          '<td class="py-4 px-4 align-top whitespace-nowrap">' +
            '<select onchange="updateLeadStatus(\'' + lead.id + '\', this.value)" aria-label="Lead Status for ' + escapeHtml(lead.name) + '" class="text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ' + badgeStyle + '">' +
              '<option value="New" ' + (lead.status === "New" ? "selected" : "") + '>New</option>' +
              '<option value="Contacted" ' + (lead.status === "Contacted" ? "selected" : "") + '>Contacted</option>' +
              '<option value="Scheduled" ' + (lead.status === "Scheduled" ? "selected" : "") + '>Scheduled</option>' +
            '</select>' +
          '</td>' +
        '</tr>';
      }
      tbody.innerHTML = rowsHtml;
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function addSampleLeadDirectly() {
      var names = ["Hannah Sterling", "Devon Brooks", "Lucas & Priya Patel", "Grant Kowalski"];
      var cities = ["Denver, CO 80209", "Aurora, CO 80014", "Lakewood, CO 80226", "Littleton, CO 80123"];
      var roofs = ["Asphalt Shingle", "Metal", "Tile", "Flat"];
      var services = ["Replacement", "Storm Damage", "Repair", "Inspection", "Gutters"];
      var idx = appState.leads.length % names.length;

      var simulated = {
        id: "lead_" + Date.now(),
        name: names[idx],
        phone: "(303) 555-01" + String(10 + (appState.leads.length * 7) % 89),
        email: names[idx].split(" ")[0].toLowerCase() + "@denver-demo.com",
        address: (1100 + idx * 240) + " S Marion St, " + cities[idx],
        roof_type: roofs[idx],
        service: services[idx],
        message: "Simulated lead added from Leads Tracker to verify instant table update.",
        created_at: new Date().toISOString(),
        status: "New"
      };
      appState.leads.unshift(simulated);
      saveLeadsToStorage();
      renderLeadsTable();
      showToast("Added new test lead: " + simulated.name);
    }

    function exportLeadsToCSV() {
      var headers = ["name", "phone", "email", "address", "roof_type", "service", "message", "created_at", "status"];
      var lines = [headers.join(",")];
      for (var i = 0; i < appState.leads.length; i++) {
        var r = appState.leads[i];
        var row = [
          csvEscape(r.name),
          csvEscape(r.phone),
          csvEscape(r.email),
          csvEscape(r.address),
          csvEscape(r.roof_type),
          csvEscape(r.service),
          csvEscape(r.message),
          csvEscape(r.created_at),
          csvEscape(r.status)
        ];
        lines.push(row.join(","));
      }
      var csvContent = lines.join("\n");
      var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "summit_roofing_leads_google_sheets.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Exported " + appState.leads.length + " leads to CSV for Google Sheets!");
    }

    function csvEscape(val) {
      var s = val ? String(val).replace(/"/g, '""') : "";
      return '"' + s + '"';
    }

    function openModal(modalId) {
      var m = document.getElementById(modalId);
      if (m) m.classList.remove("hidden");
    }

    function closeModal(modalId) {
      var m = document.getElementById(modalId);
      if (m) m.classList.add("hidden");
    }

    function applyClientCustomization() {
      var name = document.getElementById("custCompanyName").value.trim() || "Summit Roofing";
      var city = document.getElementById("custCity").value.trim() || "Denver";
      var phone = document.getElementById("custPhone").value.trim() || "(303) 555-0147";
      var areas = document.getElementById("custAreas").value.trim() || "Denver, Aurora, Lakewood, Littleton";

      window.CLIENT_CONFIG.companyName = name;
      window.CLIENT_CONFIG.city = city;
      window.CLIENT_CONFIG.phone = phone;
      window.CLIENT_CONFIG.serviceAreas = areas.split(",").map(function(s) { return s.trim(); });

      document.getElementById("brandLogoText").textContent = name;
      document.getElementById("brandCitySubtext").textContent = areas;
      document.getElementById("heroHeadline").textContent = "Roof Replacement & Repair in " + city;
      document.getElementById("heroServiceAreaPill").textContent = "Serving " + areas;

      var brandNames = document.querySelectorAll(".brand-name-display");
      for (var i = 0; i < brandNames.length; i++) brandNames[i].textContent = name;

      var phoneEls = document.querySelectorAll(".brand-phone-display");
      for (var j = 0; j < phoneEls.length; j++) phoneEls[j].textContent = phone;

      closeModal("customizerModal");
      showToast("Template rebranded to " + name + " (" + city + ")!");
    }

    function resetClientTemplate() {
      document.getElementById("custCompanyName").value = "Summit Roofing";
      document.getElementById("custCity").value = "Denver";
      document.getElementById("custPhone").value = "(303) 555-0147";
      document.getElementById("custAreas").value = "Denver, Aurora, Lakewood, Littleton";
      applyClientCustomization();
    }

    function saveIntegrationSettings() {
      var gs = document.getElementById("cfgGoogleSheetUrl").value.trim();
      var sbUrl = document.getElementById("cfgSupabaseUrl").value.trim();
      var sbKey = document.getElementById("cfgSupabaseKey").value.trim();
      var fsUrl = document.getElementById("cfgFormspreeUrl").value.trim();

      window.CLIENT_CONFIG.googleSheetWebhookUrl = gs;
      window.CLIENT_CONFIG.supabaseUrl = sbUrl;
      window.CLIENT_CONFIG.supabaseAnonKey = sbKey;
      window.CLIENT_CONFIG.formspreeEndpoint = fsUrl;

      try {
        localStorage.setItem("summit_roofing_integrations_v1", JSON.stringify({
          googleSheetWebhookUrl: gs,
          supabaseUrl: sbUrl,
          supabaseAnonKey: sbKey,
          formspreeEndpoint: fsUrl
        }));
      } catch (e) {}

      var badge = document.getElementById("storageConnectionBadge");
      if (badge) {
        var active = ["Local Table"];
        if (gs) active.push("Google Sheet");
        if (sbUrl && sbKey) active.push("Supabase");
        if (fsUrl) active.push("Formspree");
        badge.textContent = "Active Store: " + active.join(" + ");
      }
      closeModal("integrationsModal");
      showToast("Integration endpoints saved!");
    }

    window.addEventListener("DOMContentLoaded", function() {
      loadIntegrationSettings();
      loadLeadsFromStorage();
      renderGallery();
      renderLeadsTable();

      var h = window.location.hash.replace("#/", "").replace("#", "") || window.INITIAL_PAGE_VIEW || "home";
      var validPages = ["home", "services", "gallery", "reviews", "estimate", "thank-you", "leads"];
      if (validPages.indexOf(h) !== -1) {
        switchView(h);
      }
    });