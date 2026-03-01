import re

html_path = "/home/kriteshgoud/Documents/NMIMS/hack-web/frontend/dashboard.html"
with open(html_path, "r") as f:
    html = f.read()

# 1. wrap dashboard-charts-row in dashboard-main-column
html = html.replace('<div class="dashboard-charts-row">', '<div class="dashboard-main-column">\n                    <div class="dashboard-charts-row">')

# 2. Extract Activity Feed
activity_feed_match = re.search(r'(<div class="activity-feed-card">.*?)<div class="quick-stats-card">', html, re.DOTALL)
activity_feed = activity_feed_match.group(1).strip()

# 3. Extract Quick Stats
quick_stats_match = re.search(r'(<div class="quick-stats-card">.*?)</div>\s*</div>\s*</div>\s*</section>', html, re.DOTALL)
quick_stats = quick_stats_match.group(1).strip()

# 4. We need to close the dashboard-main-column right after the dashboard-charts-row closes
# The dashboard-charts-row closes right before <!-- Eco Score & Gamification -->
html = html.replace('</div>\n\n                    <!-- Eco Score & Gamification -->', 
                    f'</div>\n\n                    <!-- Activity Feed (Moved inside main column) -->\n                    {activity_feed}\n                </div>\n\n                    <!-- Eco Score & Gamification -->')


# 5. We need to add quick-stats-card at the end of dashboard-sidebar-row
html = html.replace('</div>\n                </div>\n\n                <!-- Activity Feed & Quick Stats -->',
                    f'    <!-- Quick Stats (Moved inside sidebar) -->\n                        {quick_stats}\n                    </div>\n                </div>\n\n                <!-- Activity Feed & Quick Stats -->')


# 6. We need to completely remove the dashboard-bottom-row.
# It starts at <!-- Activity Feed & Quick Stats -->
bottom_row_pattern = r'<!-- Activity Feed & Quick Stats -->\s*<div class="dashboard-bottom-row">.*?</div>\s*</div>\s*</div>\s*</section>'
html = re.sub(bottom_row_pattern, '</div>\n        </section>', html, flags=re.DOTALL)

with open(html_path, "w") as f:
    f.write(html)

css_path = "/home/kriteshgoud/Documents/NMIMS/hack-web/frontend/assets/css/styles.css"
css_append = """
/* Fix dashboard main column */
.dashboard-main-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
}
"""
with open(css_path, "a") as f:
    f.write(css_append)

print("Done reorganizing layout")
