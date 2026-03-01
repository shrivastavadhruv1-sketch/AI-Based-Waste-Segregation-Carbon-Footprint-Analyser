import re

dashboard_path = "/home/kriteshgoud/Documents/NMIMS/hack-web/frontend/dashboard.html"
css_path = "/home/kriteshgoud/Documents/NMIMS/hack-web/frontend/assets/css/styles.css"

with open(dashboard_path, "r") as f:
    html = f.read()

# 1. Add System Status Bar
system_status = """
    <!-- System Status Bar -->
    <div class="system-status-bar">
        <div class="container status-container">
            <span class="status-item"><span class="status-dot healthy"></span> ML Service: Healthy</span>
            <span class="status-item"><span class="status-dot healthy"></span> API Latency: 220ms</span>
            <span class="status-item"><span class="status-dot healthy"></span> Prediction Queue: 0</span>
        </div>
    </div>
"""
if "system-status-bar" not in html:
    html = html.replace('<nav class="navbar dark-nav"', system_status + '\    <nav class="navbar dark-nav"')

# 2. Update Header Actions to Export Buttons
export_actions = """
                        <div class="export-actions">
                            <button class="btn btn-secondary btn-sm" onclick="alert('Downloading PDF...')">📄 Export PDF</button>
                            <button class="btn btn-secondary btn-sm" onclick="alert('Downloading CSV...')">📊 Export CSV</button>
                            <button class="btn btn-outline btn-sm" style="color:white; border-color:white;" onclick="alert('Scheduling Report...')">✉️ Schedule</button>
                        </div>
"""
html = re.sub(r'<a href="reports.html" class="btn btn-secondary">Export Report →</a>', export_actions, html)

# 3. Add Dashboard Filters
filters_row = """
                <!-- Filters -->
                <div class="dashboard-filters">
                    <select class="filter-select"><option>Last 7 Days</option><option selected>Last 30 Days</option><option>Custom Range</option></select>
                    <select class="filter-select"><option>All Categories</option><option>Biodegradable</option><option>Recyclable</option><option>Hazardous</option></select>
                    <select class="filter-select"><option>All Users (Admin)</option><option>Top Performers</option></select>
                    <select class="filter-select"><option>All Confidences</option><option>&gt; 90% Confidence</option><option>&lt; 70% Confidence</option></select>
                </div>
"""
html = html.replace('<!-- KPI Cards -->', filters_row + '\n                <!-- KPI Cards -->')
# remove the old Dashboard Date badge since we have filters now
html = re.sub(r'<div class="dashboard-date-badge">.*?</div>', '', html, flags=re.DOTALL)


# 4. Add AI Insights Row
ai_insights = """
                <!-- AI Predictive Insights -->
                <div class="ai-insights-row">
                    <div class="insight-card positive-insight">
                        <div class="insight-icon">📈</div>
                        <div class="insight-text"><strong>Trending +12%</strong> vs last month in proper recyclable sorting.</div>
                    </div>
                    <div class="insight-card warning-insight">
                        <div class="insight-icon">⚠️</div>
                        <div class="insight-text"><strong>Hazardous waste</strong> increased 18% this week. Please review protocols.</div>
                    </div>
                    <div class="insight-card suggestion-insight">
                        <div class="insight-icon">💡</div>
                        <div class="insight-text">If this trend continues, you’ll save <strong>620kg CO₂</strong> this year!</div>
                    </div>
                </div>
"""
html = html.replace('<!-- KPI Cards -->', ai_insights + '\n                <!-- KPI Cards -->')

# 5. Charts Row Drill Down Class. 
# Also modify the middle row. We currently have "dashboard-charts-row" with 2 charts. Let's make it 3 columns:
# Charts | Eco Score | Impact Projection
new_middle_row = """
                <div class="dashboard-charts-layout">
                    <!-- Charts Row with drill down -->
                    <div class="dashboard-charts-row">
                        <div class="dashboard-chart-card main-chart interactive-chart" onclick="alert('Drilling down into Classification Trends...')">
                            <div class="chart-card-header">
                                <h3>Classification Trends <span class="chart-hint">(Click to Drill Down)</span></h3>
                                <div class="chart-tabs">
                                    <button class="chart-tab active" data-chart="overview">Overview</button>
                                    <button class="chart-tab" data-chart="carbon">Carbon</button>
                                </div>
                            </div>
                            <div class="chart-card-body">
                                <canvas id="dashboardChart" width="500" height="250"></canvas>
                            </div>
                        </div>
                        <div class="dashboard-chart-card side-chart interactive-chart" onclick="alert('Drilling down into Category Distribution...')">
                            <div class="chart-card-header">
                                <h3>Category Distribution <span class="chart-hint">(Click)</span></h3>
                            </div>
                            <div class="chart-card-body" style="display:flex; justify-content:center;">
                                <canvas id="categoryPieChart" width="200" height="200"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Eco Score & Gamification -->
                    <div class="dashboard-sidebar-row">
                        <div class="dashboard-chart-card gamification-card">
                            <div class="chart-card-header">
                                <h3>Eco Score</h3>
                            </div>
                            <div class="eco-score-body">
                                <div class="eco-badge gold">🏅 Gold Rank</div>
                                <div class="eco-points">8,240 <span class="pts">pts</span></div>
                                <div class="eco-rank-text">Top 5% of all users this month</div>
                                <div class="score-breakdown">
                                    <div class="score-item"><span>Recycling Ratio</span> <span class="green-text">+340</span></div>
                                    <div class="score-item"><span>Hazard Reduction</span> <span class="green-text">+120</span></div>
                                    <div class="score-item"><span>Consistency Streak</span> <span class="blue-text">14 Days</span></div>
                                </div>
                            </div>
                        </div>

                        <!-- Impact Projection & Equivalents -->
                        <div class="dashboard-chart-card projection-card">
                            <div class="chart-card-header">
                                <h3>Annual Projection</h3>
                            </div>
                            <div class="projection-body">
                                <div class="proj-main">~850 kg CO₂</div>
                                <p class="proj-sub">Projected savings based on 30-day run rate.</p>
                                <div class="equivalent-list">
                                    <div class="eq-item"><span>🌳 <strong>42</strong> Trees</span> planted</div>
                                    <div class="eq-item"><span>🚗 <strong>3,400</strong> km</span> driving avoided</div>
                                    <div class="eq-item"><span>⚡ <strong>14</strong> homes</span> powered 1 day</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Performance Comparison -->
                        <div class="dashboard-chart-card comparison-card">
                            <div class="chart-card-header">
                                <h3>Performance & Model Health</h3>
                            </div>
                            <div class="comparison-body">
                                <div class="comp-row"><span>You vs Avg User</span> <span class="comp-val positive">+24% Better</span></div>
                                <div class="comp-row"><span>This Wk vs Last</span> <span class="comp-val positive">+8% Scans</span></div>
                                <div class="comp-row"><span>Avg Confidence</span> <span class="comp-val positive">96.4% ↗</span></div>
                                <div class="comp-row"><span>Misclassification</span> <span class="comp-val warning">1.2% Flagged</span></div>
                            </div>
                        </div>
                    </div>
                </div>
"""
# Replace old charts row
html = re.sub(r'<!-- Charts Row -->.*?<!-- Activity Feed & Quick Stats -->', new_middle_row + '\n                <!-- Activity Feed & Quick Stats -->', html, flags=re.DOTALL)

with open(dashboard_path, "w") as f:
    f.write(html)

# Now append CSS for the new features
css_append = """
/* ---- New Dashboard Features Additions ---- */

/* System Status Bar */
.system-status-bar {
    background: var(--gray-900);
    color: var(--gray-300);
    font-size: 11px;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    position: relative;
    z-index: 1001;
}
.status-container {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
}
.status-item {
    display: flex;
    align-items: center;
    gap: 6px;
}
.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}
.status-dot.healthy {
    background: var(--primary-light);
    box-shadow: 0 0 5px var(--primary-light);
}

/* Nav Adjustment for status bar */
.navbar {
    top: 25px; /* push down slightly for status bar */
}

/* Filters */
.dashboard-filters {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}
.filter-select {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.1);
    color: white;
    font-size: 13px;
    outline: none;
    backdrop-filter: blur(4px);
    cursor: pointer;
}
.filter-select option {
    background: var(--gray-800);
    color: white;
}

/* Header actions */
.export-actions {
    display: flex;
    gap: 8px;
}

/* AI Insights */
.ai-insights-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
}
.insight-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 16px;
    border-radius: 12px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    backdrop-filter: blur(10px);
}
.positive-insight { border-left: 4px solid var(--primary-light); }
.warning-insight { border-left: 4px solid var(--accent-orange); }
.suggestion-insight { border-left: 4px solid var(--accent-blue); }

.insight-icon {
    font-size: 20px;
}
.insight-text {
    font-size: 14px;
    color: white;
    line-height: 1.5;
}
.insight-text strong {
    color: var(--primary-light);
}
.warning-insight .insight-text strong { color: var(--accent-orange); }
.suggestion-insight .insight-text strong { color: var(--accent-blue); }

/* Dashboard Layout Update */
.dashboard-charts-layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
}
@media (max-width: 900px) {
    .dashboard-charts-layout {
        grid-template-columns: 1fr;
    }
}
.dashboard-sidebar-row {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Interactive Charts */
.interactive-chart {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.interactive-chart:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-light);
}
.chart-hint {
    font-size: 11px;
    color: var(--gray-400);
    font-weight: 500;
    margin-left: 8px;
}

/* Gamification & Eco Score */
.eco-score-body {
    padding: 16px 20px;
    text-align: center;
}
.eco-badge.gold {
    display: inline-block;
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    color: white;
    padding: 6px 12px;
    border-radius: 100px;
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 12px;
    box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
}
.eco-points {
    font-size: 36px;
    font-weight: 800;
    color: var(--gray-900);
}
.eco-points .pts {
    font-size: 16px;
    color: var(--gray-500);
    font-weight: 600;
}
.eco-rank-text {
    font-size: 13px;
    color: var(--primary);
    font-weight: 600;
    margin-bottom: 20px;
}
.score-breakdown {
    border-top: 1px solid var(--gray-200);
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
}
.score-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--gray-600);
    font-weight: 500;
}
.score-item .green-text { font-weight: 700; }
.score-item .blue-text { color: var(--accent-blue); font-weight: 700; }

/* Projections & Equivalents */
.projection-body {
    padding: 16px 20px;
}
.proj-main {
    font-size: 24px;
    font-weight: 800;
    color: var(--primary-dark);
}
.proj-sub {
    font-size: 12px;
    color: var(--gray-500);
    margin-bottom: 16px;
}
.equivalent-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.eq-item {
    background: var(--gray-50);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    color: var(--gray-700);
    display: flex;
    align-items: center;
}
.eq-item span {
    width: 65px;
}

/* Comparison body */
.comparison-body {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.comp-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--gray-700);
    font-weight: 500;
    border-bottom: 1px solid var(--gray-100);
    padding-bottom: 8px;
}
.comp-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
}
.comp-val {
    font-weight: 700;
}
.comp-val.positive { color: var(--primary); }
.comp-val.warning { color: var(--accent-orange); }

/* Fix Top padding of hero sections to account for status bar */
.dashboard-page-section {
    padding-top: calc(var(--nav-height) + 60px) !important;
}

"""
with open(css_path, "a") as f:
    f.write(css_append)

print("HTML and CSS patched successfully.")

