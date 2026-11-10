/**
 * Summit Roofing - Leads Dashboard Engine (v2 Polish)
 * Features:
 * - Supabase REST sync & local fallback
 * - Full bi-directional status sync (PATCHes Supabase when configured)
 * - Safe Blob-based CSV export (no URL truncation on # or &)
 * - Mobile-responsive stacked card view + Desktop table view
 * - Real-time instant search & status filtering
 */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("leads-table-body");
  const mobileCardsContainer = document.getElementById("leads-mobile-cards");
  const countBadge = document.getElementById("leads-total-count");
  const searchInput = document.getElementById("lead-search");
  const statusFilter = document.getElementById("status-filter");
  const exportBtn = document.getElementById("export-csv-btn");
  const refreshBtn = document.getElementById("refresh-leads-btn");
  const resetDemoBtn = document.getElementById("reset-demo-leads-btn");

  const STORAGE_KEY = "summit_roofing_leads";
  let allLeads = [];

  // Initialize and load leads
  async function loadLeads() {
    allLeads = await fetchLeadsFromSource();
    renderLeadsView();
  }

  // Fetch leads: checks Supabase first if configured, else pulls from localStorage / seed
  async function fetchLeadsFromSource() {
    const config = window.SITE_CONFIG || {};
    const integrations = config.integrations || {};

    if (integrations.supabaseUrl && integrations.supabaseAnonKey) {
      try {
        const endpoint = `${integrations.supabaseUrl.replace(/\/$/, "")}/rest/v1/${integrations.supabaseTable || "leads"}?select=*&order=created_at.desc`;
        const res = await fetch(endpoint, {
          headers: {
            "apikey": integrations.supabaseAnonKey,
            "Authorization": `Bearer ${integrations.supabaseAnonKey}`
          }
        });
        if (res.ok) {
          const supabaseData = await res.json();
          if (Array.isArray(supabaseData) && supabaseData.length > 0) {
            return supabaseData;
          }
        }
      } catch (e) {
        console.warn("Supabase fetch notice, falling back to local storage:", e);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Local storage read error:", e);
    }

    // Default to seed leads from config
    const seed = (config.seedLeads || []);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  // Render both Desktop Table and Mobile Cards
  function renderLeadsView() {
    const query = (searchInput ? searchInput.value.toLowerCase().trim() : "");
    const selectedStatus = (statusFilter ? statusFilter.value : "All");

    const filtered = allLeads.filter((lead) => {
      const matchesSearch = 
        !query ||
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.toLowerCase().includes(query)) ||
        (lead.email && lead.email.toLowerCase().includes(query)) ||
        (lead.address && lead.address.toLowerCase().includes(query)) ||
        (lead.service && lead.service.toLowerCase().includes(query));

      const matchesStatus = (selectedStatus === "All" || lead.status === selectedStatus);

      return matchesSearch && matchesStatus;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'Lead' : 'Leads'}`;
    }

    // Render Empty State
    if (filtered.length === 0) {
      const emptyHtml = `
        <div class="p-8 text-center text-slate-500">
          <svg class="mx-auto h-10 w-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="font-bold text-slate-700">No matching leads found</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your filters or submit a new estimate from the landing page.</p>
        </div>
      `;
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="6">${emptyHtml}</td></tr>`;
      }
      if (mobileCardsContainer) {
        mobileCardsContainer.innerHTML = emptyHtml;
      }
      return;
    }

    // 1. Render Desktop Table Body
    if (tableBody) {
      tableBody.innerHTML = filtered.map((lead) => {
        const formattedDate = formatLeadDate(lead.created_at);

        return `
          <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td class="px-6 py-4">
              <div class="font-bold text-slate-900">${escapeHtml(lead.name)}</div>
              <div class="text-xs text-slate-500 flex items-center mt-0.5">
                <a href="mailto:${escapeHtml(lead.email)}" class="hover:text-amber-600 transition-colors">✉️ ${escapeHtml(lead.email)}</a>
              </div>
              <div class="text-xs text-slate-400 mt-0.5 truncate max-w-xs" title="${escapeHtml(lead.address)}">
                📍 ${escapeHtml(lead.address)}
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <a href="tel:${cleanPhone(lead.phone)}" class="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 font-mono bg-amber-50 px-2 py-1 rounded border border-amber-200">
                📞 ${escapeHtml(lead.phone)}
              </a>
            </td>

            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                ${escapeHtml(lead.service || "General Inquiry")}
              </span>
              <div class="text-[11px] text-slate-500 mt-1">
                Type: <span class="font-medium text-slate-700">${escapeHtml(lead.roof_type || "Not Specified")}</span>
              </div>
            </td>

            <td class="px-6 py-4 text-xs text-slate-600 max-w-xs">
              <p class="truncate" title="${escapeHtml(lead.message || '')}">
                ${escapeHtml(lead.message || 'No additional notes')}
              </p>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
              ${formattedDate}
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-right">
              <select class="status-select text-xs font-semibold rounded-lg border-slate-200 px-2.5 py-1.5 focus:ring-amber-500 focus:border-amber-500"
                      data-id="${lead.id}">
                <option value="New" ${lead.status === "New" ? "selected" : ""}>🟢 New</option>
                <option value="Contacted" ${lead.status === "Contacted" ? "selected" : ""}>🟡 Contacted</option>
                <option value="Inspection Scheduled" ${lead.status === "Inspection Scheduled" ? "selected" : ""}>🔵 Scheduled</option>
                <option value="Quoted" ${lead.status === "Quoted" ? "selected" : ""}>🟣 Quoted</option>
                <option value="Closed" ${lead.status === "Closed" ? "selected" : ""}>⚪ Closed</option>
              </select>
            </td>
          </tr>
        `;
      }).join("");
    }

    // 2. Render Mobile Stacked Card View (<640px)
    if (mobileCardsContainer) {
      mobileCardsContainer.innerHTML = filtered.map((lead) => {
        const formattedDate = formatLeadDate(lead.created_at);

        return `
          <div class="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
            <div class="flex items-start justify-between">
              <div>
                <h4 class="font-bold text-slate-900 text-sm">${escapeHtml(lead.name)}</h4>
                <p class="text-xs text-slate-400">📍 ${escapeHtml(lead.address)}</p>
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                ${escapeHtml(lead.service || "Inquiry")}
              </span>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <a href="tel:${cleanPhone(lead.phone)}" class="text-amber-600 font-bold font-mono">
                📞 ${escapeHtml(lead.phone)}
              </a>
              <span class="text-slate-400 text-[11px]">${formattedDate}</span>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs text-slate-500">Status:</span>
              <select class="status-select text-xs font-semibold rounded-lg border-slate-300 px-2 py-1"
                      data-id="${lead.id}">
                <option value="New" ${lead.status === "New" ? "selected" : ""}>🟢 New</option>
                <option value="Contacted" ${lead.status === "Contacted" ? "selected" : ""}>🟡 Contacted</option>
                <option value="Inspection Scheduled" ${lead.status === "Inspection Scheduled" ? "selected" : ""}>🔵 Scheduled</option>
                <option value="Quoted" ${lead.status === "Quoted" ? "selected" : ""}>🟣 Quoted</option>
                <option value="Closed" ${lead.status === "Closed" ? "selected" : ""}>⚪ Closed</option>
              </select>
            </div>
          </div>
        `;
      }).join("");
    }

    // Attach status select listeners
    document.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const leadId = e.target.getAttribute("data-id");
        const newStatus = e.target.value;
        updateLeadStatus(leadId, newStatus);
      });
    });
  }

  // Update lead status in state, localStorage, and upstream Supabase
  async function updateLeadStatus(id, newStatus) {
    allLeads = allLeads.map((lead) => {
      if (String(lead.id) === String(id)) {
        return { ...lead, status: newStatus };
      }
      return lead;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLeads));

    // Upstream PATCH to Supabase if configured
    const config = window.SITE_CONFIG || {};
    const integrations = config.integrations || {};
    if (integrations.supabaseUrl && integrations.supabaseAnonKey) {
      try {
        const endpoint = `${integrations.supabaseUrl.replace(/\/$/, "")}/rest/v1/${integrations.supabaseTable || "leads"}?id=eq.${id}`;
        await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": integrations.supabaseAnonKey,
            "Authorization": `Bearer ${integrations.supabaseAnonKey}`
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.warn("Notice: Upstream Supabase status patch skipped:", err);
      }
    }
  }

  // Format timestamp nicely
  function formatLeadDate(isoString) {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch (e) {
      return isoString;
    }
  }

  function cleanPhone(phone) {
    return (phone || "").replace(/\D/g, "");
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Safe Blob-based CSV Export (Zero URL truncation on # or &)
  function exportToCsv() {
    if (!allLeads || allLeads.length === 0) {
      alert("No leads to export.");
      return;
    }

    const headers = ["ID", "Date", "Name", "Phone", "Email", "Address", "Roof Type", "Service", "Status", "Message"];
    const rows = allLeads.map(l => [
      l.id,
      `"${(l.created_at || '').replace(/"/g, '""')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.roof_type || '').replace(/"/g, '""')}"`,
      `"${(l.service || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `summit-roofing-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener("input", renderLeadsView);
  if (statusFilter) statusFilter.addEventListener("change", renderLeadsView);
  if (exportBtn) exportBtn.addEventListener("click", exportToCsv);
  if (refreshBtn) refreshBtn.addEventListener("click", loadLeads);

  if (resetDemoBtn) {
    resetDemoBtn.addEventListener("click", () => {
      if (confirm("Reset leads table back to default demo records?")) {
        localStorage.removeItem(STORAGE_KEY);
        loadLeads();
      }
    });
  }

  // Initial load
  loadLeads();
});
