import re,os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad=[]
for dp,dn,fn in os.walk(root):
    if any(s in dp for s in ('.git','tools','.backups','assets','signature')): continue
    for f in fn:
        if not f.endswith('.html'): continue
        p=os.path.join(dp,f)
        html=open(p,encoding='utf-8',errors='replace').read()
        t=re.search(r'<title>([^<]*)</title>',html,re.I)
        if t and 'ontario' in t.group(1).lower(): bad.append(f'{p}: title')
        for d in re.finditer(r'<meta[^>]+(?:description|og:description|twitter:description)[^>]+>',html,re.I):
            if 'ontario' in d.group(0).lower(): bad.append(f'{p}: meta')
        sb=re.search(r'class="specbar".*?</div>\s*</div>',html,re.S)
        if sb and 'ontario' in sb.group(0).lower(): bad.append(f'{p}: specbar')
for b in bad: print(b)
print('GEO OK' if not bad else f'{len(bad)} GEO FAIL')
sys.exit(0 if not bad else 1)
