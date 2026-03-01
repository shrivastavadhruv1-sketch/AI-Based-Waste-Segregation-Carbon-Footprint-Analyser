import re

with open('frontend/assets/css/styles.css', 'r') as f:
    css = f.read()

# Replace color variables
css = re.sub(r'--primary: #[a-zA-Z0-9]+;', '--primary: #0E7C66;', css)
css = re.sub(r'--primary-dark: #[a-zA-Z0-9]+;', '--primary-dark: #095042;', css)
css = re.sub(r'--primary-darker: #[a-zA-Z0-9]+;', '--primary-darker: #06382e;', css)
css = re.sub(r'--primary-light: #[a-zA-Z0-9]+;', '--primary-light: #22C55E;', css)
css = re.sub(r'--primary-lightest: #[a-zA-Z0-9]+;', '--primary-lightest: #dcfce7;', css)

css = re.sub(r'--accent-blue: #[a-zA-Z0-9]+;', '--accent-blue: #3B82F6;', css)

# Font families - replace with Poppins/Inter stack if not already
css = re.sub(r"--font: 'Inter', [^;]+;", "--font: 'Poppins', 'Satoshi', 'Inter', sans-serif;", css)

# Add new CSS classes for the scanning effect, blobs, ripple, progress bars
new_css = """

/* Background Blobs */
.bg-blob {
    position: absolute;
    filter: blur(80px);
    z-index: 0;
    border-radius: 50%;
    opacity: 0.4;
    animation: blob-float 10s infinite alternate;
}
.blob-1 {
    top: -10%; left: -10%;
    width: 400px; height: 400px;
    background: var(--primary-light);
}
.blob-2 {
    bottom: -10%; right: -10%;
    width: 500px; height: 500px;
    background: var(--accent-blue);
    animation-delay: -5s;
}

@keyframes blob-float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(30px, 50px) scale(1.1); }
}

/* Texture overlay */
.noise-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 9999;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03;
}

/* Hero Dark Override */
.hero {
    background: linear-gradient(135deg, #0F172A, #0E7C66, #095042) !important;
    color: white !important;
}
.hero-title, .hero-description {
    color: white !important;
}
.hero-grid-bg {
    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px) !important;
}
.hero-badge {
    background: rgba(34, 197, 94, 0.2) !important;
    color: var(--primary-light) !important;
    border: 1px solid rgba(34, 197, 94, 0.4) !important;
}

/* Scanning Overlay */
.scan-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    overflow: hidden;
    display: none;
    border-radius: 12px;
}
.scan-overlay.active {
    display: block;
}
.scan-line {
    position: absolute;
    top: -10%; left: 0; right: 0;
    height: 10%;
    background: linear-gradient(to bottom, transparent, rgba(34, 197, 94, 0.8));
    animation: scanning 2s linear infinite;
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.5);
}
@keyframes scanning {
    0% { top: -10%; }
    100% { top: 100%; }
}

/* Pulsing AI Indicator */
.ai-processing {
    display: none;
    text-align: center;
    padding: 20px;
}
.ai-processing.active {
    display: block;
}
.ai-pulse {
    width: 60px; height: 60px;
    border-radius: 50%;
    background: var(--primary-light);
    margin: 0 auto 16px;
    animation: bigPulse 1.5s infinite;
}
@keyframes bigPulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); transform: scale(0.95); }
    70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); transform: scale(1); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); transform: scale(0.95); }
}

/* Huge Prediction Results */
.huge-result {
    text-align: center;
    padding: 30px;
    background: rgba(255, 255, 255, 0.8) !important;
    border: 2px solid var(--primary-light) !important;
    border-radius: 24px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1) !important;
}
.huge-result-icon {
    font-size: 64px;
    margin-bottom: 10px;
}
.huge-result-title {
    font-size: 36px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--primary);
    margin-bottom: 5px;
    letter-spacing: 1px;
}
.huge-result-item {
    font-size: 20px;
    color: var(--gray-600);
    margin-bottom: 20px;
    font-weight: 600;
}

/* Progress Bars */
.confidence-bar-container {
    background: var(--gray-200);
    border-radius: 100px;
    height: 12px;
    overflow: hidden;
    position: relative;
    margin: 10px 0;
}
.confidence-bar-fill {
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 0%;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    border-radius: 100px;
    transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ripple {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-anim 600ms linear;
    background-color: rgba(255, 255, 255, 0.7);
}

@keyframes ripple-anim {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.btn {
    position: relative;
    overflow: hidden;
}

/* Add Angled Separators */
.section-slanted {
    clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%);
    background: var(--primary-lightest);
    padding: 160px 0 !important;
    margin: -60px 0;
    z-index: 1;
    position: relative;
}

.dark-nav {
    background: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
}
.dark-nav .nav-link, .dark-nav .nav-logo {
    color: white !important;
}
.dark-nav .nav-link:hover {
    background: rgba(255,255,255,0.1);
}

"""

if '/* Background Blobs */' not in css:
    css += new_css

with open('frontend/assets/css/styles.css', 'w') as f:
    f.write(css)

print("CSS variables and new classes patched successfully.")
