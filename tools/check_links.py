import re,os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad=[]
pages=[]
for dp,dn,fn in os.walk(root):
    if any(s in dp for s in ('.git','tools','.backups','node_modules','assets','signature')): continue
    for f in fn:
        if f.endswith('.html'): pages.append(os.path.join(dp,f))
for p in pages:
    html=open(p,encoding='utf-8',errors='replace').read()
    ids=set(re.findall(r'id="([^"]+)"',html))
    for m in re.finditer(r'(?:href|src)="([^"]+)"',html):
        u=m.group(1)
        if u.startswith(('http://','https://','mailto:','tel:','data:')): continue
        if u=='#': bad.append(f'{p}: dead href "#"'); continue
        if u.startswith('#'):
            if u[1:] not in ids: bad.append(f'{p}: missing anchor {u}')
            continue
        path=u.split('#')[0].split('?')[0]
        fs=os.path.join(root,path.lstrip('/')) if path.startswith('/') else os.path.join(os.path.dirname(p),path)
        if fs.endswith('/'): fs+='index.html'
        if os.path.isdir(fs): fs=os.path.join(fs,'index.html')
        if not os.path.exists(fs): bad.append(f'{p}: broken {u}')
for b in bad: print(b)
print('LINKS OK' if not bad else f'{len(bad)} BROKEN')
sys.exit(0 if not bad else 1)
