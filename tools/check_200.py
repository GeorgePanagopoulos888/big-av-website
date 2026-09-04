import urllib.request,sys
urls=['/','/about.html','/services.html','/contact.html','/privacy.html','/terms.html','/agentic-ai/','/markets/']+['/markets/%s.html'%v for v in ['commercial','healthcare','institutional','landscape','retail-hospitality','residential','industrial','entertainment-venues']]
bad=[]
for u in urls:
    try:
        c=urllib.request.urlopen('http://localhost:8932'+u,timeout=5).status
        if c!=200: bad.append((u,c))
    except Exception as e: bad.append((u,str(e)))
for b in bad: print(b)
print('ALL 200' if not bad else f'{len(bad)} FAILING')
sys.exit(0 if not bad else 1)
