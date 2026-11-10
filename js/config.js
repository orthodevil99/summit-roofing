/**
 * Summit Roofing - Master Site Configuration
 * All business details, service area data, and API integration settings.
 * Designed for easy re-skinning for future contractor clients in <2 minutes.
 */

window.SITE_CONFIG = {
  // Business Information
  company: {
    name: "Summit Roofing",
    city: "Denver",
    state: "Colorado",
    metroArea: "Denver Metro & Front Range",
    serviceAreas: ["Denver", "Aurora", "Lakewood", "Littleton"],
    phone: "(303) 555-0147",
    phoneRaw: "3035550147",
    email: "hello@summitroofing-demo.com",
    tagline: "Roof Replacement & Repair in Denver",
    subheadline: "Denver's trusted local roofing contractor. Protecting Colorado homes from hail, wind, and mountain winter storms with high-grade impact-resistant roofing.",
    trustLine: "Licensed & Insured • 15 Years Experience • Free Inspection",
    licenseNumber: "CO-ROOF-78421-LIC",
    businessHours: "Mon–Sat: 8:00 AM – 6:00 PM | Sun: Emergency Storm Service Only",
    copyrightYear: new Date().getFullYear(),
    socialProof: {
      completedJobs: "2,400+",
      averageRating: "4.9",
      reviewCount: "185+",
      experienceYears: "15"
    }
  },

  // 6 Core Roofing Services
  services: [
    {
      id: "replacement",
      title: "Roof Replacement",
      shortDesc: "Full tear-off and replacement using Class 4 hail-resistant architectural shingles built for Colorado.",
      icon: "home",
      features: ["50-Year Manufacturer Warranty", "Full Ice & Water Shield Barrier", "Clean-yard magnetic nail sweep"]
    },
    {
      id: "repair",
      title: "Roof Repair",
      shortDesc: "Fast, reliable leak diagnostics and precision repairs to extend your roof's lifespan without full replacement.",
      icon: "hammer",
      features: ["Emergency leak detection", "Pipe boot & flashing repairs", "Windblown shingle matching"]
    },
    {
      id: "inspection",
      title: "Roof Inspection",
      shortDesc: "Complimentary 21-point photo inspection and condition report with honest, zero-pressure advice.",
      icon: "clipboard-check",
      features: ["Digital photo documentation", "Attic ventilation assessment", "100% Free with zero obligation"]
    },
    {
      id: "gutters",
      title: "Seamless Gutters",
      shortDesc: "Custom on-site 5\" and 6\" seamless aluminum gutters engineered to handle heavy mountain snowmelt.",
      icon: "droplets",
      features: ["Heavy-duty hidden hangers", "Leaf protection systems", "Custom color matching"]
    },
    {
      id: "storm-damage",
      title: "Storm Damage Repair",
      shortDesc: "Rapid response hail and wind restoration with expert assistance navigating insurance claims.",
      icon: "cloud-lightning",
      features: ["Same-day emergency tarping", "Insurance adjuster walkthroughs", "Xactimate itemized pricing"]
    },
    {
      id: "commercial",
      title: "Commercial Roofing",
      shortDesc: "Durable TPO, EPDM, and flat roof maintenance and installations for Denver commercial properties.",
      icon: "building-2",
      features: ["Energy Star cool roof systems", "Minimal business disruption", "Annual maintenance agreements"]
    }
  ],

  // 8 High Quality Curated Unsplash Photos (Fast CDN, high-res roofing & work)
  gallery: [
    {
      id: 1,
      title: "Architectural Shingle Replacement",
      location: "Aurora, CO",
      category: "Replacement",
      thumbnail: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=85",
      caption: "Complete tear-off and installation of CertainTeed Landmark Class 4 impact shingles after severe summer hail."
    },
    {
      id: 2,
      title: "Standing Seam Metal Roofing",
      location: "Littleton, CO",
      category: "Metal Roof",
      thumbnail: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85",
      caption: "Custom 24-gauge standing seam matte black metal roof engineered for maximum snow shedding."
    },
    {
      id: 3,
      title: "Precision Ridge Vent & Shingle Repair",
      location: "Lakewood, CO",
      category: "Repair",
      thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=85",
      caption: "Wind damage ridge cap repair and upgraded high-airflow continuous ventilation installation."
    },
    {
      id: 4,
      title: "Front Range Modern Residence",
      location: "Denver (Washington Park)",
      category: "Replacement",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      caption: "Premium designer shingle upgrade with color-matched flashing and integrated ice shield."
    },
    {
      id: 5,
      title: "Seamless 6-Inch Gutter Installation",
      location: "Denver (Highlands)",
      category: "Gutters",
      thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85",
      caption: "Heavy-gauge seamless aluminum gutter system equipped with micro-mesh leaf filtration."
    },
    {
      id: 6,
      title: "Emergency Storm Damage Tarping & Fix",
      location: "Centennial, CO",
      category: "Storm Damage",
      thumbnail: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&q=85",
      caption: "Rapid 90-minute storm response following 2-inch golf ball hail in the Denver south metro."
    },
    {
      id: 7,
      title: "Suburban Two-Story Roof Tear-Off",
      location: "Aurora, CO",
      category: "Replacement",
      thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      caption: "Complete 3,200 sq ft re-roof finished in a single day with zero debris left on property."
    },
    {
      id: 8,
      title: "Commercial Flat Roof TPO Membrane",
      location: "Denver (RiNo Arts District)",
      category: "Commercial",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      full: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
      caption: "Energy-efficient 60-mil white TPO single-ply roofing system installed over ISO insulation board."
    }
  ],

  // Customer Reviews (Authentic Denver Homeowner Proof)
  reviews: [
    {
      name: "Mike R.",
      location: "Denver (Washington Park)",
      rating: 5,
      date: "2 weeks ago",
      tag: "Full Roof Replacement",
      quote: "After the big May hailstorm, Summit Roofing was out the next morning for a free inspection. They walked my insurance adjuster through every inch of damage. Crew finished in one day and left my driveway cleaner than they found it."
    },
    {
      name: "Sarah K.",
      location: "Aurora, CO",
      rating: 5,
      date: "1 month ago",
      tag: "Storm Damage & Gutters",
      quote: "Outstanding local crew! Other roofers gave me confusing estimates with hidden fees. Summit gave me a crystal-clear written warranty, itemized pricing, and installed beautiful seamless gutters that handled our recent downpour with zero issues."
    },
    {
      name: "David L.",
      location: "Lakewood, CO",
      rating: 5,
      date: "3 months ago",
      tag: "Roof Repair & Inspection",
      quote: "Had a mystery leak in our master bedroom ceiling. Another company tried to sell us an entire $18k replacement. Summit found the cracked chimney flashing, fixed it for a fraction of the cost, and proved their honesty. They have my business for life."
    }
  ],

  // 4 Core Why Us Pillars
  whyUs: [
    {
      icon: "shield-check",
      title: "Free 21-Point Inspection",
      desc: "Complete digital photo report with zero sales pressure and zero obligation."
    },
    {
      icon: "award",
      title: "Written Transferable Warranty",
      desc: "Comprehensive 10-year workmanship warranty plus 50-year manufacturer backing."
    },
    {
      icon: "users",
      title: "In-House Local Denver Crew",
      desc: "Experienced Colorado roofers who understand Front Range weather extremes."
    },
    {
      icon: "clock",
      title: "Fast Response Time",
      desc: "Calls returned within 1 business day and emergency storm tarping within hours."
    }
  ],

  // External Integrations (Easily override with your actual free keys)
  integrations: {
    // Formspree Form ID (Replace with your actual form ID e.g. "xaykzpqw")
    formspreeId: "demo-summit-roofing",
    // Google Sheet Webhook URL (Optional: Paste your deployed Google Apps Script Web App URL)
    googleSheetWebhookUrl: "",
    // Supabase credentials (Replace with your free project keys)
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseTable: "leads",
    // Enable local mock persistence so the prototype always works flawlessly even without keys
    useLocalPersistenceFallback: true
  },

  // Seed sample leads for prototype evaluation
  seedLeads: [
    {
      id: 101,
      name: "Marcus Vance",
      phone: "(303) 555-8912",
      email: "mvance@colorado-homes.com",
      address: "1420 S Gaylord St, Denver, CO 80210",
      roof_type: "Asphalt Shingle",
      service: "Replacement",
      message: "Hail damage from last week. Insurance adjuster visiting on Thursday.",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "New"
    },
    {
      id: 102,
      name: "Elena Rostova",
      phone: "(720) 555-3490",
      email: "elena.rostova@aurorafamily.net",
      address: "18942 E Quincy Ave, Aurora, CO 80015",
      roof_type: "Tile",
      service: "Repair",
      message: "Two cracked tiles near valley leaking water into attic during heavy rain.",
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: "Contacted"
    },
    {
      id: 103,
      name: "Brian Callahan",
      phone: "(303) 555-7145",
      email: "brian.c@lakewoodrealty.com",
      address: "7405 W 10th Ave, Lakewood, CO 80214",
      roof_type: "Metal",
      service: "Inspection",
      message: "Pre-sale real estate roof certification needed before closing.",
      created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
      status: "Inspection Scheduled"
    }
  ]
};
