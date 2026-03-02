// ========================================
// EcoSort AI — Multi-Page Application JS
// ========================================

// ========================================
// NAVIGATION
// ========================================
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

// Sticky nav
window.addEventListener('scroll', () => {
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        if (window.scrollY > 20) {
            navbar.classList.remove('dark-nav');
        } else {
            navbar.classList.add('dark-nav');
        }
    }
});

// Mobile menu toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) navLinks.classList.remove('open');
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    });
});


// ========================================
// HOME PAGE — CO₂ Counter Animation
// ========================================
function animateCO2Counter() {
    const co2Value = document.getElementById('co2-value');
    if (!co2Value) return;

    const target = 12847;
    const duration = 2500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(eased * target);
        co2Value.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}


// ========================================
// HOME PAGE — Impact Counter Animation
// ========================================
function animateCounters() {
    const counters = document.querySelectorAll('.impact-number[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}


// ========================================
// SCROLL REVEAL
// ========================================
function initScrollReveal() {
    // Select everything we want to animate on scroll
    const selectors = 'section, .feature-card, .impact-stat-card, .category-block, .cta-link-block, .insight-card, .practice-card, .equivalent-card, .kpi-card, .report-summary-card, .report-item, .comparison-card, .hero-floating-card, .dashboard-mockup';
    const revealElements = document.querySelectorAll(selectors);

    if (revealElements.length === 0) return;

    // Attach initial CSS state class
    revealElements.forEach(el => {
        // Skip hero section so it shows immediately
        if (el.id !== 'home' && !el.classList.contains('hero')) {
            el.classList.add('reveal-anim');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = Array.from(entry.target.parentElement.children);
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, (idx % 4) * 150);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-anim').forEach(el => observer.observe(el));
}


// ========================================
// WASTE ANALYZER
// ========================================
let selectedFile = null;

const wasteDatabase = {
    biodegradable: {
        icon: '🟢',
        items: ['Banana Peel', 'Food Scraps', 'Tea Bags', 'Garden Waste', 'Paper Napkin', 'Fruit Peel', 'Vegetable Scraps', 'Eggshells'],
        carbon: { saved: 0.45, wasted: 1.2 },
        disposal: [
            'Compost in a home composting bin',
            'Can be used for vermicomposting',
            'Keep separate from recyclable waste',
            'Use as mulch in garden areas'
        ],
        reuse: ['Composting', 'Biogas production', 'Natural fertilizer', 'Mulching']
    },
    recyclable: {
        icon: '🔵',
        items: ['Plastic Bottle', 'Glass Jar', 'Aluminum Can', 'Cardboard Box', 'Paper', 'Metal Container', 'PET Bottle', 'Newspaper'],
        carbon: { saved: 1.8, wasted: 3.5 },
        disposal: [
            'Clean before placing in recycling bin',
            'Remove labels and caps if possible',
            'Flatten cardboard boxes to save space',
            'Check local recycling guidelines'
        ],
        reuse: ['Material recovery', 'Upcycling', 'Remanufacturing', 'Creative reuse']
    },
    hazardous: {
        icon: '🔴',
        items: ['Battery', 'Paint Can', 'Chemical Container', 'Fluorescent Bulb', 'Electronic Waste', 'Medical Waste', 'Pesticide Container', 'Motor Oil'],
        carbon: { saved: 2.5, wasted: 8.0 },
        disposal: [
            'Take to designated hazardous waste collection point',
            'Never mix with regular waste',
            'Store in original container when possible',
            'Contact local authorities for disposal guidelines'
        ],
        reuse: ['Specialized recycling', 'Material extraction', 'Safe energy recovery', 'Professional refurbishment']
    },
    'e-waste': {
        icon: '⚡',
        items: ['Mobile Phone', 'Laptop', 'Circuit Board', 'Cable', 'Monitor', 'Keyboard'],
        carbon: { saved: 3.5, wasted: 10.0 },
        disposal: [
            'Take to certified E-Waste drop-off point',
            'Do not throw in regular trash bin',
            'Delete personal data before recycling',
            'Batteries should be removed if possible'
        ],
        reuse: ['Component recovery', 'Refurbishing', 'Precious metal extraction', 'Donation']
    }
};



function initAnalyzer() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    if (!uploadZone || !fileInput) return;

    // Click to upload
    uploadZone.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        fileInput.click();
    });

    // File selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImage = document.getElementById('preview-image');
        const uploadZoneContent = document.getElementById('upload-zone-content');
        const uploadZone = document.getElementById('upload-zone');
        const analyzeBtn = document.getElementById('analyze-btn');

        if (previewImage) {
            previewImage.src = e.target.result;
            previewImage.classList.remove('hidden');
        }
        if (uploadZoneContent) uploadZoneContent.classList.add('hidden');
        if (uploadZone) uploadZone.classList.add('has-image');
        if (analyzeBtn) analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// Camera Functions
function startCamera() {
    const cameraContainer = document.getElementById('camera-container');
    const cameraVideo = document.getElementById('camera-video');
    if (!cameraContainer || !cameraVideo) return;

    cameraContainer.classList.remove('hidden');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            cameraVideo.srcObject = stream;
        })
        .catch(err => {
            alert('Unable to access camera: ' + err.message);
            cameraContainer.classList.add('hidden');
        });
}

function capturePhoto() {
    const cameraVideo = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    if (!cameraVideo || !cameraCanvas) return;

    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    const ctx = cameraCanvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0);

    cameraCanvas.toBlob(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        handleFile(file);
        stopCamera();
    }, 'image/jpeg');
}

function stopCamera() {
    const cameraVideo = document.getElementById('camera-video');
    const cameraContainer = document.getElementById('camera-container');

    if (cameraVideo && cameraVideo.srcObject) {
        cameraVideo.srcObject.getTracks().forEach(track => track.stop());
        cameraVideo.srcObject = null;
    }
    if (cameraContainer) cameraContainer.classList.add('hidden');
}

async function analyzeWaste() {
    if (!selectedFile) return;

    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Processing with AI...';
    }

    // Toggle animation visual states
    const scanOverlay = document.getElementById('scan-overlay');
    const aiProcessing = document.getElementById('ai-processing');
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resultsContent = document.getElementById('results-content');

    if (scanOverlay) scanOverlay.classList.add('active');
    if (aiProcessing) aiProcessing.classList.add('active');
    if (resultsPlaceholder) resultsPlaceholder.classList.add('hidden');
    if (resultsContent) resultsContent.classList.add('hidden');

    try {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();

        // Match the clean Flask response string (e.g. "Biodegradable") to our dictionary keys
        const categoryKey = data.wasteType.toLowerCase();

        // Handle uncertain / out-of-distribution images
        if (data.wasteType.startsWith('Uncertain') || !wasteDatabase[categoryKey]) {
            displayResults(
                data.wasteType,
                data.confidence,
                {
                    icon: '❓',
                    carbon: { saved: 0, wasted: 0 },
                    disposal: ['This image may not be a waste item, or falls outside the classification model\'s training data. Please upload a clear image of a waste object.'],
                    reuse: ['N/A']
                }
            );
            return;
        }

        let dbData = wasteDatabase[categoryKey];
        const confidence = Math.round(data.confidence);

        // ── Use Flask's material-aware carbon values if available ────────
        // carbonData.carbonSaved is confidence-weighted at 1.0 kg.
        // We multiply by weightKg (1.5 kg default) to get real saved value.
        const WEIGHT_KG = 1.5;
        let carbonSavedDisplay = dbData.carbon.saved;  // fallback: static DB value
        let carbonSavedForSave = null;                 // null → let Node.js compute its own

        if (data.carbonData && data.carbonData.carbonSaved != null) {
            // Flask returned material-aware value (at 1kg) → scale to our hardcoded weight
            const flaskCarbonPer1kg = data.carbonData.carbonSaved;
            carbonSavedDisplay = parseFloat((flaskCarbonPer1kg * WEIGHT_KG).toFixed(3));
            carbonSavedForSave = carbonSavedDisplay;
            console.log(
                `[Carbon] ${data.carbonData.subMaterial} @ ${data.carbonData.emissionFactor} ` +
                `kg CO₂/kg · ${data.carbonData.basis} → ${carbonSavedDisplay} kg saved`
            );
        }

        // We only show waste category — the model does not predict specific item names
        displayResults(data.wasteType, confidence, dbData, carbonSavedDisplay);

        // Show small attribution label (what material Flask detected + basis)
        const materialLabelEl = document.getElementById('carbon-material-label');
        if (materialLabelEl && data.carbonData && data.carbonData.subMaterial) {
            materialLabelEl.textContent =
                `📊 Detected as: ${data.carbonData.subMaterial} · ${data.carbonData.basis}`;
        }

        // Upload the successful scan to the user's dashboard via Node API
        if (typeof apiCall === 'function') {
            const savePayload = {
                wasteType: data.wasteType,
                confidence: confidence,
                weightKg: WEIGHT_KG
            };
            // If Flask gave us a better carbon value, send it so Node stores it directly
            if (carbonSavedForSave !== null) {
                savePayload.carbonSavedOverride = carbonSavedForSave;
            }
            await apiCall('/scans/save', 'POST', savePayload);
        }

    } catch (err) {
        console.error("AI Analysis Failed:", err);
        alert("Failed to analyze image. Please ensure the Python ML server is running on port 8000.");
    } finally {
        if (analyzeBtn) {
            analyzeBtn.textContent = 'Analyze →';
            analyzeBtn.disabled = false;
        }

        const scanOverlay = document.getElementById('scan-overlay');
        const aiProcessing = document.getElementById('ai-processing');
        if (scanOverlay) scanOverlay.classList.remove('active');
        if (aiProcessing) aiProcessing.classList.remove('active');
    }
}

function displayResults(category, confidence, data, carbonSavedOverride = null) {
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resultsContent = document.getElementById('results-content');

    if (resultsPlaceholder) resultsPlaceholder.classList.add('hidden');
    if (resultsContent) resultsContent.classList.remove('hidden');

    const catIcon = document.getElementById('result-cat-icon');
    const catName = document.getElementById('result-category');
    const itemName = document.getElementById('result-item');
    const confValue = document.getElementById('confidence-value');
    const confFill = document.getElementById('confidence-fill');
    const carbonSaved = document.getElementById('carbon-saved');
    const carbonWasted = document.getElementById('carbon-wasted');
    const disposalList = document.getElementById('disposal-list');
    const reuseTags = document.getElementById('reuse-tags');

    if (catIcon) catIcon.textContent = data.icon;
    if (catName) catName.textContent = category.toUpperCase();
    // Hide the sub-item label — we only classify by category, not by specific object
    if (itemName) itemName.style.display = 'none';

    // Use Flask's material-aware value if available, otherwise fall back to static DB
    const savedValue = carbonSavedOverride !== null ? carbonSavedOverride : data.carbon.saved;
    if (carbonSaved) carbonSaved.textContent = savedValue;
    if (carbonWasted) carbonWasted.textContent = data.carbon.wasted;
    if (disposalList) disposalList.innerHTML = data.disposal.map(d => `<li>${d}</li>`).join('');
    if (reuseTags) reuseTags.innerHTML = data.reuse.map(r => `<span class="reuse-tag">${r}</span>`).join('');

    // Progress bar animation delay trick
    if (confFill) confFill.style.width = '0%';
    if (confValue) confValue.textContent = '0%';

    setTimeout(() => {
        if (confValue) confValue.textContent = confidence + '%';
        if (confFill) confFill.style.width = confidence + '%';

        // Retrigger intersection observer for scroll reveal on cards directly
        document.querySelectorAll('#results-content .reveal-anim').forEach(el => {
            el.classList.remove('active');
            setTimeout(() => el.classList.add('active'), 50);
        });
    }, 150);
}

function resetAnalyzer() {
    selectedFile = null;
    const previewImage = document.getElementById('preview-image');
    const uploadZoneContent = document.getElementById('upload-zone-content');
    const uploadZone = document.getElementById('upload-zone');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resultsContent = document.getElementById('results-content');

    if (previewImage) {
        previewImage.src = '';
        previewImage.classList.add('hidden');
    }
    if (uploadZoneContent) uploadZoneContent.classList.remove('hidden');
    if (uploadZone) uploadZone.classList.remove('has-image');
    if (analyzeBtn) analyzeBtn.disabled = true;
    if (resultsPlaceholder) resultsPlaceholder.classList.remove('hidden');
    if (resultsContent) resultsContent.classList.add('hidden');

    const confFill = document.getElementById('confidence-fill');
    const confValue = document.getElementById('confidence-value');
    if (confFill) confFill.style.width = '0%';
    if (confValue) confValue.textContent = '0%';

    // Reset material attribution label
    const materialLabelEl = document.getElementById('carbon-material-label');
    if (materialLabelEl) materialLabelEl.textContent = '';
}


// ========================================
// CARBON IMPACT PAGE — Chart
// ========================================
function initCarbonChart() {
    const canvas = document.getElementById('carbonChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const padding = { top: 40, right: 30, bottom: 50, left: 60 };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const saved = [320, 410, 380, 520, 490, 610, 580, 720, 690, 830, 920, 1284];
    const avoided = [180, 220, 200, 280, 260, 340, 310, 380, 360, 440, 490, 680];

    const maxVal = Math.max(...saved) * 1.15;
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        // Y labels
        const val = Math.round(maxVal - (maxVal / 5) * i);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val, padding.left - 10, y + 4);
    }

    // X labels
    months.forEach((m, i) => {
        const x = padding.left + (chartW / (months.length - 1)) * i;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m, x, h - padding.bottom + 24);
    });

    // Draw area + line for saved
    function drawLine(data, color, fillColor) {
        const points = data.map((val, i) => ({
            x: padding.left + (chartW / (data.length - 1)) * i,
            y: padding.top + chartH - (val / maxVal) * chartH
        }));

        // Fill area
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartH);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Dots
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    drawLine(avoided, '#ef4444', 'rgba(239, 68, 68, 0.08)');
    drawLine(saved, '#10b981', 'rgba(16, 185, 129, 0.12)');

    // Carbon tab switching
    document.querySelectorAll('.carbon-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.carbon-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}


// ========================================
// DASHBOARD PAGE — Charts
// ========================================
async function initDashboardCharts() {
    initChartTabs();
    try {
        if (typeof apiCall === 'function') {
            const stats = await apiCall('/scans/my/stats', 'GET');

            // Update KPI counters on the top of the dashboard
            const totalScansEl = document.getElementById('kpi-total-scans');
            if (totalScansEl) totalScansEl.textContent = stats.totalScans.toLocaleString();

            const co2SavedEl = document.getElementById('kpi-co2-saved');
            if (co2SavedEl) co2SavedEl.textContent = stats.totalCarbonSaved.toFixed(1) + ' kg';

            initDashboardMainChart();
            initCategoryPieChart(stats);
        } else {
            initDashboardMainChart();
            initCategoryPieChart(null);
        }
    } catch (e) {
        console.error("Failed to load live dashboard stats", e);
        // Fallback to static dummy data if API fails
        initDashboardMainChart();
        initCategoryPieChart(null);
    }
}

function initDashboardMainChart() {
    const canvas = document.getElementById('dashboardChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    drawDashboardLineChart(ctx, canvas.clientWidth, canvas.clientHeight);
}

function drawDashboardLineChart(ctx, w, h) {
    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const days = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    const scans = [45, 52, 38, 67, 73, 85, 62, 91, 78, 102, 88, 95, 110, 97, 120, 105, 130, 115, 125, 140, 132, 148, 150, 142, 160, 155, 148, 165, 170, 127];

    const maxVal = Math.max(...scans) * 1.15;
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        const val = Math.round(maxVal - (maxVal / 4) * i);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val, padding.left - 8, y + 4);
    }

    // X labels (every 5th day)
    days.forEach((d, i) => {
        if (i % 5 === 0) {
            const x = padding.left + (chartW / (days.length - 1)) * i;
            ctx.fillStyle = '#9ca3af';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Day ${d}`, x, h - padding.bottom + 20);
        }
    });

    // Gradient fill
    const points = scans.map((val, i) => ({
        x: padding.left + (chartW / (scans.length - 1)) * i,
        y: padding.top + chartH - (val / maxVal) * chartH
    }));

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
}

function initCategoryPieChart(stats) {
    const canvas = document.getElementById('categoryPieChart');
    if (!canvas) return;

    let totalScans = 2847;
    let data = [
        { value: 45, color: '#10b981', label: 'Biodegradable' },
        { value: 38, color: '#3b82f6', label: 'Recyclable' },
        { value: 17, color: '#ef4444', label: 'Hazardous' }
    ];

    if (stats && stats.categoryBreakdown) {
        totalScans = stats.totalScans;
        const bd = stats.categoryBreakdown;
        data = [
            { value: bd['Biodegradable'] || 0, color: '#10b981', label: 'Biodegradable' },
            { value: (bd['Recyclable'] || 0) + (bd['E-Waste'] || 0), color: '#3b82f6', label: 'Recyclable' },
            { value: bd['Hazardous'] || 0, color: '#ef4444', label: 'Hazardous' }
        ];

        const legends = document.querySelectorAll('.pie-legend-pct');
        if (legends.length >= 3 && totalScans > 0) {
            legends[0].textContent = Math.round((data[0].value / totalScans) * 100) + '%';
            legends[1].textContent = Math.round((data[1].value / totalScans) * 100) + '%';
            legends[2].textContent = Math.round((data[2].value / totalScans) * 100) + '%';
        } else if (legends.length >= 3) {
            legends[0].textContent = '0%'; legends[1].textContent = '0%'; legends[2].textContent = '0%';
        }
    }

    data = data.filter(d => d.value > 0);
    if (totalScans === 0) data = [{ value: 100, color: '#e5e7eb', label: 'Empty' }];

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 30;

    const total = data.reduce((s, d) => s + d.value, 0);
    let startAngle = -Math.PI / 2;

    data.forEach(segment => {
        const sliceAngle = (segment.value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (totalScans > 0 && (segment.value / total) > 0.05) {
            const midAngle = startAngle + sliceAngle / 2;
            const labelX = cx + Math.cos(midAngle) * (radius * 0.65);
            const labelY = cy + Math.sin(midAngle) * (radius * 0.65);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round((segment.value / total) * 100) + '%', labelX, labelY);
        }
        startAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(totalScans.toLocaleString(), cx, cy - 8);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Total Scans', cx, cy + 14);
}

function initChartTabs() {
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const parent = tab.closest('.chart-card-header');
            parent.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}


// ========================================
// REPORTS PAGE — Functions
// ========================================
function downloadReport(reportId) {
    // Simulate download for static demo reports
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> Preparing...';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> Downloaded!';
        btn.style.background = 'var(--primary-dark)';
        setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; btn.style.background = ''; }, 2000);
    }, 1500);
}

async function initReportsPage() {
    const label = document.getElementById('my-scan-count-label');

    // Not on the reports page, or api.js not loaded
    if (typeof apiCall !== 'function') {
        if (label) label.textContent = '📊 Login to load your data';
        return;
    }

    try {
        const stats = await apiCall('/scans/my/stats', 'GET');

        // Update the scan count label in the "My Personal Scan Report" card
        if (label) label.textContent = `📊 ${stats.totalScans} scan${stats.totalScans !== 1 ? 's' : ''} recorded`;

        // If the user has no scans yet, leave the demo cards as-is
        if (!stats || stats.totalScans === 0) return;

        // --- Swap the February summary cards with real user data ---
        const totalScansEl = document.getElementById('rpt-total-scans');
        const scansChangeEl = document.getElementById('rpt-scans-change');
        const scansBadge = document.getElementById('rpt-scans-badge');

        const carbonEl = document.getElementById('rpt-carbon-saved');
        const carbonChange = document.getElementById('rpt-carbon-change');
        const carbonBadge = document.getElementById('rpt-carbon-badge');

        if (totalScansEl) totalScansEl.textContent = stats.totalScans.toLocaleString();
        if (scansChangeEl) scansChangeEl.textContent = 'Your total lifetime scans';
        if (scansBadge) { scansBadge.textContent = 'Your data'; scansBadge.style.background = '#d1fae5'; scansBadge.style.color = '#065f46'; }

        if (carbonEl) carbonEl.textContent = stats.totalCarbonSaved.toFixed(2) + ' kg';
        if (carbonChange) carbonChange.textContent = `${stats.totalWeightKg.toFixed(2)} kg waste classified`;
        if (carbonBadge) { carbonBadge.textContent = 'Your data'; carbonBadge.style.background = '#d1fae5'; carbonBadge.style.color = '#065f46'; }

        // Update the section subtitle too
        const subtitle = document.querySelector('.reports-hero ~ main .section-subtitle, section.section-white .section-subtitle');
        // Find the subtitle near report-summary-grid
        const summaryGrid = document.querySelector('.report-summary-grid');
        if (summaryGrid) {
            const sec = summaryGrid.closest('section');
            if (sec) {
                const sub = sec.querySelector('.section-subtitle');
                if (sub) sub.textContent = 'Your personal environmental impact — based on your scan history.';
            }
        }

    } catch (e) {
        // User not logged in or API down — leave demo data, update label
        if (label) label.textContent = '📊 Log in to see your scan count';
    }
}

// ========================================
// CARBON IMPACT PAGE — Live user stats
// ========================================
async function initCarbonPageStats() {
    // Only run on carbon page (check for a unique element)
    const bigNum = document.getElementById('carbon-total-saved');
    if (!bigNum || typeof apiCall !== 'function') return;

    try {
        const stats = await apiCall('/scans/my/stats', 'GET');

        if (!stats || stats.totalScans === 0) return; // No scans yet — leave demo

        const total = stats.totalCarbonSaved;
        const bd = stats.categoryBreakdown || {};
        const carbonRates = { Biodegradable: 0.5, Recyclable: 1.2, Hazardous: 2.0, 'E-Waste': 3.5 };

        // Compute CO2 per category (count × rate × 1.5kg avg weight)
        const bioCarbon = (bd['Biodegradable'] || 0) * 1.5 * carbonRates['Biodegradable'];
        const recCarbon = ((bd['Recyclable'] || 0) + (bd['E-Waste'] || 0)) * 1.5 * carbonRates['Recyclable'];
        const hazCarbon = (bd['Hazardous'] || 0) * 1.5 * carbonRates['Hazardous'];

        const bioP = total > 0 ? Math.round((bioCarbon / total) * 100) : 0;
        const recP = total > 0 ? Math.round((recCarbon / total) * 100) : 0;
        const hazP = total > 0 ? Math.round((hazCarbon / total) * 100) : 0;

        // Update the big card
        bigNum.textContent = total.toFixed(2);

        const trendBadge = document.getElementById('carbon-trend-badge');
        if (trendBadge) trendBadge.textContent = `${stats.totalScans} items scanned`;

        const demoNote = document.getElementById('carbon-demo-note');
        if (demoNote) demoNote.style.display = 'none'; // Hide "sample data" note

        // Update the category breakdown mini-cards
        const bioVal = document.getElementById('carbon-bio-val');
        const recVal = document.getElementById('carbon-rec-val');
        const hazVal = document.getElementById('carbon-haz-val');
        const bioPct = document.getElementById('carbon-bio-pct');
        const recPct = document.getElementById('carbon-rec-pct');
        const hazPct = document.getElementById('carbon-haz-pct');

        if (bioVal) bioVal.textContent = bioCarbon.toFixed(2) + ' kg';
        if (recVal) recVal.textContent = recCarbon.toFixed(2) + ' kg';
        if (hazVal) hazVal.textContent = hazCarbon.toFixed(2) + ' kg';
        if (bioPct) bioPct.textContent = bioP + '%';
        if (recPct) recPct.textContent = recP + '%';
        if (hazPct) hazPct.textContent = hazP + '%';

        // Update items processed (total scans)
        const totalItemsEl = document.querySelector('.carbon-stat-mini-val');
        // Find the "Total Items Processed" specifically
        document.querySelectorAll('.carbon-stat-mini').forEach(card => {
            const lbl = card.querySelector('.carbon-stat-mini-label');
            if (lbl && lbl.textContent.includes('Total Items')) {
                const valEl = card.querySelector('.carbon-stat-mini-val');
                if (valEl) {
                    valEl.textContent = stats.totalScans.toLocaleString();
                    // Remove the Sample badge
                    const badge = valEl.querySelector('.demo-badge');
                    if (badge) badge.remove();
                }
            }
        });

    } catch (e) {
        // Not logged in or API down — demo data stays, no changes
        console.log('Carbon page: using demo data (user not logged in or API unavailable)');
    }
}

async function exportMyScansAsPDF(event) {
    const btn = event ? event.target.closest('button') : document.getElementById('my-report-btn');
    const originalHTML = btn ? btn.innerHTML : '';
    if (btn) { btn.innerHTML = '⏳ Fetching your data...'; btn.disabled = true; }

    try {
        if (typeof apiCall !== 'function') throw new Error('Not authenticated');

        const scans = await apiCall('/scans/my', 'GET');

        if (!scans || scans.length === 0) {
            alert('No scans found. Scan some waste items first using the Waste Analyzer!');
            return;
        }

        // ---- Build PDF ----
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        // Header bar
        doc.setFillColor(16, 185, 129); // emerald
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('EcoSort AI', 14, 12);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Personal Waste & Carbon Impact Report', 14, 20);
        doc.text(`Generated: ${dateStr}`, 196, 20, { align: 'right' });

        // Sub-header info
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Report for: ${userName}`, 14, 38);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total scans included: ${scans.length}`, 14, 44);

        // --- Compute totals ---
        let totalWeight = 0, totalCarbon = 0;
        const categoryCount = {};

        const tableRows = scans.map((scan, idx) => {
            const ts = scan.createdAt?.seconds
                ? new Date(scan.createdAt.seconds * 1000).toLocaleDateString('en-IN')
                : 'N/A';
            const w = parseFloat(scan.weightKg || 0);
            const c = parseFloat(scan.carbonSaved || 0);
            totalWeight += w;
            totalCarbon += c;
            categoryCount[scan.wasteType] = (categoryCount[scan.wasteType] || 0) + 1;
            return [
                idx + 1,
                scan.wasteType || 'Unknown',
                w.toFixed(2) + ' kg',
                c.toFixed(3) + ' kg',
                (scan.confidence || 0) + '%',
                ts
            ];
        });

        // Totals footer row
        tableRows.push([
            { content: 'TOTALS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [240, 253, 244] } },
            { content: totalWeight.toFixed(2) + ' kg', styles: { fontStyle: 'bold', fillColor: [240, 253, 244] } },
            { content: totalCarbon.toFixed(3) + ' kg CO₂', styles: { fontStyle: 'bold', fillColor: [240, 253, 244], textColor: [5, 150, 105] } },
            { content: '', styles: { fillColor: [240, 253, 244] } },
            { content: '', styles: { fillColor: [240, 253, 244] } }
        ]);

        doc.autoTable({
            startY: 50,
            head: [['#', 'Waste Type', 'Weight', 'CO₂ Saved', 'Confidence', 'Date']],
            body: tableRows,
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 38 },
                2: { cellWidth: 28, halign: 'right' },
                3: { cellWidth: 32, halign: 'right' },
                4: { cellWidth: 26, halign: 'center' },
                5: { cellWidth: 30, halign: 'center' }
            },
            margin: { left: 14, right: 14 },
            tableLineColor: [229, 231, 235],
            tableLineWidth: 0.3
        });

        // Summary box below table
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(14, finalY, 182, 36, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('Summary', 20, finalY + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);

        const catSummary = Object.entries(categoryCount)
            .map(([k, v]) => `${k}: ${v}`).join('   |   ');
        doc.text(`Total Scans: ${scans.length}`, 20, finalY + 16);
        doc.text(`Total Waste Classified: ${totalWeight.toFixed(2)} kg`, 20, finalY + 23);
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total CO₂ Saved: ${totalCarbon.toFixed(3)} kg`, 20, finalY + 30);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Breakdown — ${catSummary}`, 20, finalY + 37);

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7.5);
            doc.setTextColor(160, 160, 160);
            doc.text('EcoSort AI — NMIMS University | AI-Based Waste Segregation & Carbon Footprint Analyser', 14, 292);
            doc.text(`Page ${i} of ${pageCount}`, 196, 292, { align: 'right' });
        }

        doc.save(`EcoSort_MyReport_${now.toISOString().slice(0, 10)}.pdf`);

    } catch (err) {
        console.error('PDF Export Error:', err);
        if (err.message && err.message.includes('authenticated')) {
            alert('Please log in to export your personal report.');
        } else if (err.message && err.message.includes('timed out')) {
            alert('Backend is not responding (timed out after 8s).\nMake sure the Node.js backend is running on port 5000.');
        } else {
            alert('Failed to generate PDF. Make sure the backend is running on port 5000.');
        }
    } finally {
        if (btn) { btn.innerHTML = originalHTML; btn.disabled = false; }
    }
}

function generateCustomReport() {
    const startDate = document.getElementById('report-start-date');
    const endDate = document.getElementById('report-end-date');
    const format = document.getElementById('report-format');
    if (!startDate || !endDate || !format) return;
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Generating Report...';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = '✓ Report Generated Successfully!';
        btn.style.background = 'var(--primary-dark)';
        setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; btn.style.background = ''; }, 2500);
    }, 2000);
}


// ========================================
// PULSE DOT ANIMATION (for live indicator)
// ========================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.5); }
}
`;
document.head.appendChild(styleSheet);


// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Home page
    animateCO2Counter();

    // Scroll reveal for all pages
    initScrollReveal();

    // Impact counters (home page)
    const impactSection = document.querySelector('.impact-stats');
    if (impactSection) {
        const impactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    impactObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        impactObserver.observe(impactSection);
    }

    // Analyzer page
    initAnalyzer();

    // Carbon page
    initCarbonChart();
    initCarbonPageStats();

    // Dashboard page
    initDashboardCharts();

    // Reports page
    initReportsPage();

    // Global Button Ripple Effect
    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn')) {
            const btn = e.target.closest('.btn');

            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;

            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            btn.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
});
