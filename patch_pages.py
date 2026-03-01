import glob
import re

for filename in glob.glob("frontend/*.html"):
    with open(filename, "r") as f:
        content = f.read()

    # 1. Add noise-overlay right after <body> if not present
    if '<div class="noise-overlay"></div>' not in content:
        content = re.sub(r'(<body[^>]*>)', r'\1\n    <div class="noise-overlay"></div>', content)

    # 2. Add dark-nav to navbar if not present
    content = re.sub(r'<nav class="navbar"(?!.*dark-nav)[^>]*>', r'<nav class="navbar dark-nav"', content)
    content = re.sub(r'<nav class="navbar" id="navbar">', r'<nav class="navbar dark-nav" id="navbar">', content)
    
    # 3. Add bg-blobs to the first top section of each page
    # Look for the first <section> or specifically the known top sections
    # They are: <section class="hero", <section class="analyzer-section", <section class="page-hero", <section class="dashboard-page-section"
    # We will insert the blobs right inside them 
    if '<div class="bg-blob blob-1"></div>' not in content:
        content = re.sub(
            r'(<section\s+class="[^"]*(hero|analyzer-section|page-hero|dashboard-page-section|login-section|register-section)[^"]*"[^>]*>)', 
            r'\1\n            <div class="bg-blob blob-1"></div>\n            <div class="bg-blob blob-2"></div>', 
            content, 1
        )

    with open(filename, "w") as f:
        f.write(content)

print("HTML pages patched.")

