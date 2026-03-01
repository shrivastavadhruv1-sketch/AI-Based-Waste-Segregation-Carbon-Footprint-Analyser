import glob
import re

for filename in glob.glob("frontend/*.html"):
    with open(filename, "r") as f:
        content = f.read()

    # If we have <nav class="navbar dark-nav"\n        <div then we know it's missing id="navbar">
    content = re.sub(r'<nav class="navbar dark-nav"(\s*)<div class="nav-container"', r'<nav class="navbar dark-nav" id="navbar">\1<div class="nav-container"', content)
    
    # Also just in case:
    content = re.sub(r'<nav class="navbar dark-nav">(\s*)<div class="nav-container"', r'<nav class="navbar dark-nav" id="navbar">\1<div class="nav-container"', content)

    with open(filename, "w") as f:
        f.write(content)

print("Nav fixed")
