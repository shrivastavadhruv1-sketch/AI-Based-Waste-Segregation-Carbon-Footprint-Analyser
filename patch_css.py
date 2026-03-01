import re

with open('frontend/assets/css/styles.css', 'r') as f:
    css = f.read()

# Make the specific sections dark
old_hero = """.hero {
    background: linear-gradient(135deg, #0F172A, #0E7C66, #095042) !important;
    color: white !important;
}
.hero-title, .hero-description {"""

new_hero = """.hero, .analyzer-section, .page-hero, .dashboard-page-section {
    background: linear-gradient(135deg, #0F172A, #0E7C66, #095042) !important;
    color: white !important;
}

.hero-title, .hero-description, .section-title, .section-subtitle, .dashboard-page-header h1, .dashboard-page-header p {
    color: white !important;
}

.kpi-card, .chart-card, .dashboard-mockup, .impact-stat-card, .feature-card, .result-card {
    color: var(--gray-800) !important;
}
.section-label { color: #86efac !important; }

"""

css = css.replace(old_hero, new_hero)

with open('frontend/assets/css/styles.css', 'w') as f:
    f.write(css)

print("styles.css patched successfully.")
