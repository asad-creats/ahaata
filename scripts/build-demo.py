"""Build a single-file HTML demo (CSS and JS inlined) at dist-demo/ehata-demo.html."""
import os, re, subprocess, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run(['npx', 'vite', 'build', '--outDir', 'dist-demo', '--base', './'], cwd=root, check=True, env={**os.environ, 'VITE_DEMO': '1'})
d = os.path.join(root, 'dist-demo')
html = open(os.path.join(d, 'index.html')).read()
css = ''.join(open(os.path.join(d, m)).read() for m in re.findall(r'href="\./(assets/[^"]+\.css)"', html))
js = ''.join(open(os.path.join(d, m)).read() for m in re.findall(r'src="\./(assets/[^"]+\.js)"', html)).replace('</script', '<\\/script')
out = ('<title>Ehata CRM</title>\n'
       '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">\n'
       f'<style>{css}</style>\n<div id="root"></div>\n<script type="module">{js}</script>\n')
open(os.path.join(d, 'ehata-demo.html'), 'w').write(out)
print('wrote', os.path.join(d, 'ehata-demo.html'), len(out), 'bytes')
