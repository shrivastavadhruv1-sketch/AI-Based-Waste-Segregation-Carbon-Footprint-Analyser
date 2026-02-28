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
    const revealElements = document.querySelectorAll('.feature-card, .impact-stat-card, .category-block, .cta-link-block, .reveal-on-scroll');

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = Array.from(entry.target.parentElement.children);
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, idx * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    revealElements.forEach(el => observer.observe(el));
}

// Add scroll reveal classes to new elements
function addRevealClasses() {
    const selectors = '.insight-card, .practice-card, .equivalent-card, .kpi-card, .report-summary-card, .report-item, .comparison-card';
    document.querySelectorAll(selectors).forEach(el => {
        el.classList.add('reveal-on-scroll');
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });
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

function analyzeWaste() {
    if (!selectedFile) return;

    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
    }

    // Simulate AI processing delay
    setTimeout(() => {
        const categories = Object.keys(wasteDatabase);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const data = wasteDatabase[category];
        const item = data.items[Math.floor(Math.random() * data.items.length)];
        const confidence = Math.floor(Math.random() * 10) + 90;

        displayResults(category, item, confidence, data);

        if (analyzeBtn) {
            analyzeBtn.textContent = 'Analyze →';
            analyzeBtn.disabled = false;
        }
    }, 1500);
}

function displayResults(category, item, confidence, data) {
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
    if (catName) catName.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    if (itemName) itemName.textContent = item;
    if (confValue) confValue.textContent = confidence + '%';
    if (confFill) confFill.style.width = confidence + '%';
    if (carbonSaved) carbonSaved.textContent = data.carbon.saved;
    if (carbonWasted) carbonWasted.textContent = data.carbon.wasted;
    if (disposalList) disposalList.innerHTML = data.disposal.map(d => `<li>${d}</li>`).join('');
    if (reuseTags) reuseTags.innerHTML = data.reuse.map(r => `<span class="reuse-tag">${r}</span>`).join('');
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
function initDashboardCharts() {
    initDashboardMainChart();
    initCategoryPieChart();
    initChartTabs();
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

function initCategoryPieChart() {
    const canvas = document.getElementById('categoryPieChart');
    if (!canvas) return;

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

    const data = [
        { value: 45, color: '#10b981', label: 'Biodegradable' },
        { value: 38, color: '#3b82f6', label: 'Recyclable' },
        { value: 17, color: '#ef4444', label: 'Hazardous' }
    ];

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

        // White border between slices
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = cx + Math.cos(midAngle) * (radius * 0.65);
        const labelY = cy + Math.sin(midAngle) * (radius * 0.65);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(segment.value + '%', labelX, labelY);

        startAngle += sliceAngle;
    });

    // Center circle (donut effect)
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2,847', cx, cy - 8);
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
    // Simulate download
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> Preparing...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> Downloaded!';
        btn.style.background = 'var(--primary-dark)';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
        }, 2000);
    }, 1500);
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

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
        }, 2500);
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
    addRevealClasses();
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

    // Dashboard page
    initDashboardCharts();
});
