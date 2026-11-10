/**
 * Summit Roofing - Form Validation, Anti-Spam & Multi-Destination Lead Engine (v2 Polish)
 * Features:
 * - Real-time US phone auto-formatting (XXX) XXX-XXXX
 * - WCAG AA accessible error states with aria-describedby & aria-invalid
 * - Intelligent anti-spam: Honeypot check + autofill-friendly speed check
 * - Awaited async dispatch to Supabase & Formspree with timeout guard
 * - Resilient LocalStorage lead persistence fallback
 * - Full failure recovery with friendly inline alerts
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("estimate-form");
  if (!form) return;

  const phoneInput = document.getElementById("phone");
  const formTimeField = document.getElementById("form_rendered_at");
  const honeypotField = document.getElementById("company_website_url");
  const submitButton = document.getElementById("submit-btn");
  const submitSpinner = document.getElementById("submit-spinner");
  const submitText = document.getElementById("submit-text");
  const formAlertBox = document.getElementById("form-general-alert");

  // Track form render timestamp
  const renderTimestamp = Date.now();
  if (formTimeField) {
    formTimeField.value = renderTimestamp.toString();
  }

  // Auto-format phone number as (XXX) XXX-XXXX
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let x = e.target.value.replace(/\D/g, "").match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : `(${x[1]}) ${x[2]}` + (x[3] ? `-${x[3]}` : "");
      clearFieldError(phoneInput);
    });
  }

  // Clear field error on change or input
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.addEventListener("input", () => clearFieldError(input));
    input.addEventListener("change", () => clearFieldError(input));
  });

  // Client-side Validation Rules
  function validateForm() {
    let isValid = true;

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const address = form.address.value.trim();
    const roofType = form.roof_type.value;
    const service = form.service.value;

    // Name Validation
    if (!name || name.length < 2) {
      showFieldError("name", "Please enter your full name.");
      isValid = false;
    }

    // Phone Validation (must have 10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone || phoneDigits.length < 10) {
      showFieldError("phone", "Please enter a valid 10-digit phone number.");
      isValid = false;
    }

    // Email Validation (RFC regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showFieldError("email", "Please enter a valid email address.");
      isValid = false;
    }

    // Address Validation
    if (!address || address.length < 5) {
      showFieldError("address", "Please provide your street address or neighborhood.");
      isValid = false;
    }

    // Dropdown Validation
    if (!roofType) {
      showFieldError("roof_type", "Please select your approximate roof type.");
      isValid = false;
    }
    if (!service) {
      showFieldError("service", "Please select the service required.");
      isValid = false;
    }

    return isValid;
  }

  function showFieldError(fieldName, message) {
    const field = form[fieldName];
    if (!field) return;
    field.classList.add("form-input-error");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", `${fieldName}-error`);

    const errorEl = document.getElementById(`${fieldName}-error`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
    }
  }

  function clearFieldError(field) {
    field.classList.remove("form-input-error");
    field.removeAttribute("aria-invalid");
    const errorEl = document.getElementById(`${field.name}-error`);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }
  }

  // Handle Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (formAlertBox) {
      formAlertBox.classList.add("hidden");
      formAlertBox.textContent = "";
    }

    // 1. Anti-Spam Check: Honeypot trap (Invisible input)
    if (honeypotField && honeypotField.value.trim().length > 0) {
      console.warn("Spam bot trapped via honeypot field. Suppressing submission.");
      // Soft redirect to waste bot resources
      window.location.href = "thank-you.html";
      return;
    }

    // 2. Anti-Spam Check: Speed check with human-friendly feedback
    const elapsed = Date.now() - renderTimestamp;
    if (elapsed < 500) {
      console.warn("Submission suspiciously fast (<500ms).");
      if (formAlertBox) {
        formAlertBox.textContent = "Please take a moment to review your details before submitting.";
        formAlertBox.classList.remove("hidden");
      }
      return;
    }

    // 3. Client Validation
    if (!validateForm()) {
      const firstError = form.querySelector(".form-input-error");
      if (firstError) firstError.focus();
      return;
    }

    // Set UI to loading state
    submitButton.disabled = true;
    if (submitSpinner) submitSpinner.classList.remove("hidden");
    if (submitText) submitText.textContent = "Securing Your Free Estimate...";

    // Prepare lead payload matching Supabase schema
    const newLead = {
      id: Date.now(),
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      roof_type: form.roof_type.value,
      service: form.service.value,
      message: form.message.value.trim() || "No additional message provided.",
      status: "New",
      created_at: new Date().toISOString()
    };

    try {
      // 4. Save to Local Prototype Leads Database (Guarantees leads.html updates instantly)
      saveLeadToLocalStorage(newLead);

      // 5. Store latest lead in session for personalized thank-you page
      try {
        sessionStorage.setItem("summit_latest_lead", JSON.stringify(newLead));
      } catch (e) {}

      // 6. Asynchronous Dispatch to Supabase & Formspree with a safety timeout guard
      const config = window.SITE_CONFIG || {};
      const integrations = config.integrations || {};
      const dispatchPromises = [];

      // Supabase Dispatch (if configured)
      if (integrations.supabaseUrl && integrations.supabaseAnonKey) {
        dispatchPromises.push(submitToSupabase(integrations, newLead));
      }

      // Formspree Dispatch (if configured)
      if (integrations.formspreeId && integrations.formspreeId !== "demo-summit-roofing") {
        dispatchPromises.push(submitToFormspree(integrations.formspreeId, newLead));
      }

      // Google Sheet Webhook Dispatch (if configured)
      if (integrations.googleSheetWebhookUrl) {
        dispatchPromises.push(submitToGoogleSheet(integrations.googleSheetWebhookUrl, newLead));
      }

      // If remote calls exist, await with 2000ms max timeout so user isn't kept waiting
      if (dispatchPromises.length > 0) {
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
        await Promise.race([
          Promise.allSettled(dispatchPromises),
          timeoutPromise
        ]);
      } else {
        // Micro UX pause for feel
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // Smooth redirect to Thank You page
      window.location.href = "thank-you.html";

    } catch (err) {
      console.error("Submission processing issue:", err);
      // Even if network errored, lead was saved to local storage!
      // But let's show user feedback if something critical failed
      submitButton.disabled = false;
      if (submitSpinner) submitSpinner.classList.add("hidden");
      if (submitText) submitText.textContent = "Submit For Free Estimate";

      if (formAlertBox) {
        formAlertBox.innerHTML = `Notice: Your request was logged locally. You can also call us directly at <a href="tel:3035550147" class="font-bold underline">(303) 555-0147</a>.`;
        formAlertBox.classList.remove("hidden");
      }
    }
  });

  // Local storage lead synchronizer
  function saveLeadToLocalStorage(lead) {
    try {
      const STORAGE_KEY = "summit_roofing_leads";
      let existing = [];
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        existing = JSON.parse(stored);
      } else if (window.SITE_CONFIG && window.SITE_CONFIG.seedLeads) {
        existing = [...window.SITE_CONFIG.seedLeads];
      }
      // Add new lead to the beginning
      existing.unshift(lead);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  // Supabase REST insert helper
  async function submitToSupabase(integrations, lead) {
    const endpoint = `${integrations.supabaseUrl.replace(/\/$/, "")}/rest/v1/${integrations.supabaseTable || "leads"}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": integrations.supabaseAnonKey,
        "Authorization": `Bearer ${integrations.supabaseAnonKey}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        roof_type: lead.roof_type,
        service: lead.service,
        message: lead.message,
        status: lead.status,
        created_at: lead.created_at
      })
    });
    return response.ok;
  }

  // Google Sheets Webhook helper
  async function submitToGoogleSheet(webhookUrl, lead) {
    return fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(lead)
    });
  }

  // Formspree submission helper
  async function submitToFormspree(formspreeId, lead) {
    const endpoint = `https://formspree.io/f/${formspreeId}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        roofType: lead.roof_type,
        serviceNeeded: lead.service,
        message: lead.message,
        _subject: `New Roofing Lead: ${lead.name} (${lead.service} - ${lead.roof_type})`
      })
    });
    return response.ok;
  }
});
