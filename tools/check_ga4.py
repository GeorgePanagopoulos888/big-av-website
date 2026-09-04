import os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad=[]
for dp,dn,fn in os.walk(root):
    if any(s in dp for s in ('.git','tools','.backups','assets','signature')): continue
    for f in fn:
        if not f.endswith('.html'): continue
        p=os.path.join(dp,f)
        if p.endswith('agentic-ai/orbit.html'): continue
        if 'G-5VL1D6XPD2' not in open(p,encoding='utf-8',errors='replace').read(): bad.append(p)
for b in bad: print(b)
print('GA4 OK' if not bad else f'{len(bad)} MISSING GA4')
sys.exit(0 if not bad else 1)
