# -*- coding: utf-8 -*-
import json, re

mapsvg   = open('_map.svg',encoding='utf-8').read().replace('Outfit,sans-serif','Montserrat,sans-serif')
sankeysvg= open('_sankey.svg',encoding='utf-8').read()
skleg    = open('_sklegend.html',encoding='utf-8').read()
tables   = json.load(open('_tables.json',encoding='utf-8'))

YEARS=['2024','2025','2026','2027','2028','2029','2030']

DATA = {
 "years": YEARS,
 "tecNueva": {"cats":['FV','CC','EO','CC/COG EF','GEO','HID','PSC','CI','BIO'],
              "vals":[12304,9979,6860,1697,694,536,150,120,71],
              "colors":['#D99A00','#7B828D','#2F94AC','#8A9A2E','#C0552E','#2E6FB0','#E07B2A','#5E6671','#4E8B3F']},
 "capOrder":['Ciclo combinado','Otras fósiles','Carboeléctrica','Otras renovables','Nuclear','Fotovoltaica','Eólica','Hidroeléctrica'],
 "capColors":['#7B828D','#5E6671','#3C424B','#4E8B3F','#7E5AA2','#D99A00','#2F94AC','#2E6FB0'],
 "cap":{
   'Ciclo combinado':[38094,41061,41943,41943,46099,46599,46599],
   'Otras fósiles':[18353,17992,17995,17995,17995,18115,18115],
   'Carboeléctrica':[5463,5463,5463,5463,5463,5463,5463],
   'Otras renovables':[1369,1369,1369,1413,1440,2292,2292],
   'Nuclear':[1608,1608,1608,1608,1608,1608,1608],
   'Fotovoltaica':[8287,8403,8413,8863,15075,19492,20706],
   'Eólica':[7728,7513,7513,7786,10695,13792,14372],
   'Hidroeléctrica':[12627,12699,12865,12905,13141,13141,13141]},
 "comp":{
   'Ciclo combinado':[40.73,42.72,43.17,42.81,41.34,38.67,38.10],
   'Otras fósiles':[19.62,18.72,18.52,18.37,16.14,15.03,14.81],
   'Carboeléctrica':[5.84,5.68,5.62,5.58,4.90,4.53,4.47],
   'Otras renovables':[1.46,1.42,1.41,1.44,1.29,1.90,1.87],
   'Nuclear':[1.72,1.67,1.65,1.64,1.44,1.33,1.31],
   'Fotovoltaica':[8.86,8.74,8.66,9.05,13.52,16.18,16.93],
   'Eólica':[8.26,7.82,7.73,7.95,9.59,11.44,11.75],
   'Hidroeléctrica':[13.50,13.21,13.24,13.17,11.78,10.91,10.74]},
 "capLine":{"Fósil":[64,65,65,64,60,56,55],"Renovable":[36,35,35,36,40,44,45]},
 "gen":{"Generación limpia":[84553,92700,105766,117820,130379,142577,155688],
        "Generación fósil":[267752,261118,262756,262244,259978,257919,254017]},
 "genLine":[24,26,29,31,33,36,38],
 "genc":{"Generación limpia":[24,26.2,28.7,31,33.4,35.6,38],"Generación fósil":[76,73.8,71.3,69,66.6,64.4,62]},
 "escYears":['2018','2019','2020','2021','2022','2023','2024','2025','2026','2027','2028','2029','2030'],
 "escA":{"Estado":[54,48.1,39.8,40.3,41.8,42.6,55.4,57.8,55.6,54,53.6,54.2,54.8],
         "Particulares":[46,51.9,60.2,59.7,58.2,57.4,44.6,42.2,44.4,46,46.4,45.8,45.2]},
 "escB":{"Estado":[54,48,40,40,42,43,55,58,55,56,56,57,60],
         "Particulares":[46,52,60,60,58,57,45,42,45,44,44,43,40]},
 "estatus":{
   "nodes":[
     {"id":"Capacidad nueva","mw":32475,"grp":"root"},
     {"id":"CFE","mw":11103,"grp":"cfe"},
     {"id":"Sociedades con CFE","mw":13127,"grp":"soc"},
     {"id":"Particulares","mw":8246,"grp":"par"},
     {"id":"Terminados inaugurados","mw":2050,"grp":"cfe"},
     {"id":"Terminados por inaugurar","mw":1334,"grp":"cfe"},
     {"id":"En proceso","mw":7099,"grp":"cfe"},
     {"id":"Por licitar","mw":620,"grp":"cfe"},
     {"id":"Asignados (soc)","mw":8026,"grp":"soc"},
     {"id":"Por asignar (soc)","mw":5101,"grp":"soc"},
     {"id":"Asignados (part)","mw":4297,"grp":"par"},
     {"id":"Por asignar (part)","mw":3949,"grp":"par"},
   ],
   "links":[
     ["Capacidad nueva","CFE"],["Capacidad nueva","Sociedades con CFE"],["Capacidad nueva","Particulares"],
     ["CFE","Terminados inaugurados"],["CFE","Terminados por inaugurar"],["CFE","En proceso"],["CFE","Por licitar"],
     ["Sociedades con CFE","Asignados (soc)"],["Sociedades con CFE","Por asignar (soc)"],
     ["Particulares","Asignados (part)"],["Particulares","Por asignar (part)"],
   ]},
}

# ---------- paleta master de tecnologías (consistente en TODO el deck) ----------
TECHCOLORS={
 'Fotovoltaica':'#D99A00','Eólica':'#2F94AC','Hidroeléctrica':'#2E6FB0','Geotermia':'#C0552E',
 'Bioenergía':'#4E8B3F','Hidrógeno':'#1F9488','Termosolar':'#E07B2A','Nuclear':'#7E5AA2',
 'Cogeneración eficiente':'#8A9A2E','Ciclo combinado':'#7B828D','Térmica convencional':'#A8743A',
 'Turbogás':'#C24A3A','Combustión interna':'#5E6671','Carboeléctrica':'#3C424B',
 'Otras fósiles':'#5E6671','Otras renovables':'#4E8B3F'}
TECHCODES={'CC':'#7B828D','CI':'#5E6671','CC/COG':'#8A9A2E','BIO':'#4E8B3F','PSC':'#E07B2A',
 'EO':'#2F94AC','FV':'#D99A00','GEO':'#C0552E','H₂':'#1F9488','HID':'#2E6FB0'}

# ---------- rampa choropleth del mapa SAEE (para encabezados de gerencias) ----------
def saee_fill(v,vmin=7,vmax=2141):
    t=((v-vmin)/(vmax-vmin))**0.62
    c0=(0xE3,0x89,0x9F); c1=(0x4F,0x0E,0x22)
    rgb=tuple(round(c0[i]+(c1[i]-c0[i])*t) for i in range(3))
    return '#%02x%02x%02x'%rgb

# ---------- anexo tables ----------
def render_table(grid,row_colors=None,col_colors=None,colzebra=False):
    head=grid[0]; body=grid[1:]
    GRP=('estado','particulares')
    GRP_PREFIX=('cfe ·','cfe·','sociedades con cfe','generación')
    def empty(s):
        s=(s or '').strip()
        return s in ('','—','-','·')
    def sw(c): return f'<span class="sw" style="background:{c}"></span>'
    def cell(s,i):
        cls=' class="num"' if i>0 else ''
        val='<span class="dash">–</span>' if empty(s) else s
        if i==0 and row_colors and (s or '').strip() in row_colors:
            val=sw(row_colors[(s or '').strip()])+val
        return f'<td{cls}>{val}</td>'
    def rowcls(first):
        f=(first or '').strip().lower()
        if f.startswith('total'): return 'total'
        if f in GRP or any(f.startswith(p) for p in GRP_PREFIX): return 'grp'
        return ''
    def thcell(h,i):
        cls=' class="num"' if i>0 else ''
        inner=(sw(col_colors[h.strip()]) if col_colors and h.strip() in col_colors else '')+h
        return f'<th{cls}>{inner}</th>'
    th=''.join(thcell(h,i) for i,h in enumerate(head))
    rows=''
    for r in body:
        rc=rowcls(r[0]) if r else ''
        cl=f' class="{rc}"' if rc else ''
        tds=''.join(cell(c,i) for i,c in enumerate(r))
        rows+=f'<tr{cl}>{tds}</tr>'
    cz=' cz' if colzebra else ''
    return f'<table class="report-table anexo{cz}"><thead><tr>{th}</tr></thead><tbody>{rows}</tbody></table>'

anx_tec   = render_table(tables['12'][0], col_colors=TECHCODES, colzebra=True)
anx_alm   = render_table(tables['13'][0])
anx_cap   = render_table(tables['14'][0], row_colors=TECHCOLORS)
anx_escA  = render_table(tables['15'][0])
anx_escB  = render_table(tables['16'][0])

LOGO='<div class="logo-right"><img class="logo-sener" src="Estilos Institucionales/img/logo_sener.png" onerror="this.style.display=\'none\'"></div>'

def header(line2,title):
    return (f'<div class="slide-header"><div class="brand-left"><span>Expansión del SEN</span>'
            f'<span class="brand-line-2">{line2}</span></div><div class="ef-title">{title}</div>{LOGO}</div>')

def cslide(idx,line2,title,lead,body,foot,noteic=''):
    if noteic:
        note=f'<div class="snote ic-note"><span class="ni"><i class="bi {noteic}"></i></span><span>{foot}</span></div>'
    else:
        note=f'<div class="snote">{foot}</div>'
    return (f'<section class="slide" id="slide-{idx}"><div class="slide-container">'
            f'{header(line2,title)}'
            f'<div class="lead">{lead}</div>'
            f'{body}'
            f'{note}'
            f'<div class="slide-footer"></div></div></section>')

def kpibox(lbl,val,sub,icon=''):
    ic=f'<i class="bi {icon}"></i>' if icon else ''
    return f'<div class="kpi-box"><span class="s-lbl">{ic}{lbl}</span><span class="s-val">{val}</span><span class="s-sub">{sub}</span></div>'

def kpicard(cls,icon,lbl,val,sub=''):
    subhtml=f'<span class="s">{sub}</span>' if sub else ''
    return (f'<div class="kpi-card {cls}"><span class="ic"><i class="bi {icon}"></i></span>'
            f'<span class="tx"><span class="l">{lbl}</span><span class="v">{val}</span>{subhtml}</span></div>')

def statpanel(title,icon,value,label):
    return (f'<div class="panel-card stat-panel"><div class="panel-head"><h3>{title}</h3></div>'
            f'<div class="stat-row"><span class="stat-ic"><i class="bi {icon}"></i></span>'
            f'<span class="stat-tx"><span class="stat-v">{value}</span><span class="stat-l">{label}</span></span></div></div>')

def panel(title,hostid,extra=''):
    return (f'<div class="panel-card"><div class="panel-head"><h3>{title}</h3>'
            f'<button class="chart-fs-btn" onclick="openChartFullscreen(\'{hostid}\',\'{title}\')" title="Pantalla completa"><i class="bi bi-arrows-fullscreen"></i></button></div>'
            f'<div class="chart-host" id="{hostid}">{extra}</div></div>')

SLIDES=[]

# ---- Slide 1: nueva generación ----
body1=(f'<div class="kpi-cards">'
   f'{kpicard("k-cap","bi-lightning-charge-fill","Capacidad nueva total","+32,475 MW","Adiciones 2026–2030 al SEN")}'
   f'{kpicard("k-lim","bi-leaf-fill","Energía limpia","70% · 22,376 MW","Renovables y cogeneración eficiente")}'
   f'{kpicard("k-alm","bi-battery-charging","Almacenamiento","+6,900 MW","Baterías asociadas a FV y eólica")}'
 f'</div>'
 f'<div class="content-grid g-11">'
   f'<div class="col">{panel("Tecnologías — capacidad nueva (MW)","c_tec_nueva")}</div>'
   f'<div class="col">{panel("Estatus de los proyectos de generación (MW)","c_estatus")}</div>'
 f'</div>')
SLIDES.append(cslide(1,"Capacidad nueva 2026–2030","Nueva generación",
 'México sumará <span class="hl">32,475 MW</span> de nueva generación; <span class="hlv">7 de cada 10 MW</span> son de energía limpia',
 body1,
 '<b>Tecnologías:</b> CC Ciclo combinado · CI Combustión interna · CC/COG EF Ciclo combinado con cogeneración eficiente · BIO Bioenergía · PSC Termosolar · EO Eólica · FV Fotovoltaica · GEO Geotermia · H₂ Hidrógeno · HID Hidroeléctrica.',
 noteic='bi-leaf-fill'))

# ---- Slide 2: SAEE map (reuse) ----
tipos=[("Asociado asignado",4024,"48%","var(--color-verde)"),
 ("Asociado no asignado",1939,"23%","#4F8A7C"),
 ("No asociado mixtos",935,"11%","var(--color-guinda)"),
 ("Sistémico",900,"11%","var(--color-dorado)"),
 ("No asociado CFE",610,"7%","var(--color-guinda-light)")]
tipos_html=''
for nm,v,pc,col in tipos:
    w=v/4024*100
    tipos_html+=(f'<div class="bar-row"><div class="b-name">{nm}</div>'
      f'<div class="bar-track"><div class="bar-fill" style="width:{w:.1f}%;background:{col};"></div>'
      f'<span class="bar-val">{v:,} · {pc}</span></div></div>')
# ordenadas menor -> mayor; encabezados con la rampa choropleth del mapa
regs=[("Mulegé",7,"0.1%"),("BC Sur",252,"3%"),("Norte",481,"6%"),("Noroeste",578,"7%"),
 ("B. Calif.",630,"8%"),("Occidental",720,"9%"),("Central",1011,"12%"),("Oriental",1288,"15%"),
 ("Peninsular",1301,"15%"),("Noreste",2141,"25%")]
REGCOL={'Noroeste':'#1E5B4F','Norte':'#9B2247','Noreste':'#3E8174','Occidental':'#A57F2C',
 'Central':'#B24C6C','Oriental':'#6FA89A','Peninsular':'#A33052','B. Calif.':'#7E3B52',
 'BC Sur':'#A9CDC3','Mulegé':'#E0CA8E'}
def _txt(h): return '#ffffff' if (0.299*int(h[1:3],16)+0.587*int(h[3:5],16)+0.114*int(h[5:7],16))<152 else '#23262b'
th_reg=''.join(f'<th class="num" style="background:{REGCOL[n]};color:{_txt(REGCOL[n])};border-bottom:none;">{n}</th>' for n,v,_ in regs)
td_v=''.join(f'<td class="num">{v:,}</td>' for _,v,_ in regs)
td_p=''.join(f'<td class="num">{p}</td>' for _,_,p in regs)
saee_table=(f'<table class="report-table saee-mini"><thead><tr><th></th>{th_reg}<th class="num tot">Total</th></tr></thead>'
 f'<tbody><tr><td class="rl">SAEE Total (MW)</td>{td_v}<td class="num tot">8,408</td></tr>'
 f'<tr class="pct"><td class="rl">% del total</td>{td_p}<td class="num tot">100%</td></tr></tbody></table>')
body2=('<div class="kpi-cards">'
 +kpicard("k-g","bi-battery-charging","Almacenamiento total",'8,408<span class="u">MW</span>',"Requerido en el SEN")
 +kpicard("k-v","bi-sun-fill","Asociado a eólica y FV",'6,863<span class="u">MW · 82%</span>',"Integrado a centrales renovables")
 +kpicard("k-d","bi-plug-fill","No asociado",'1,545<span class="u">MW</span>',"Operación 2028 · 610 CFE / 935 mixtos")
 +'</div>'
 f'<div class="map-grid">'
   f'<div class="panel-card"><div class="panel-head"><h3>Distribución por Gerencia de Control Regional (MW)</h3></div>'
     f'<div class="map-wrap" id="mapWrap">{mapsvg}<div class="map-tip" id="mapTip"></div></div></div>'
   f'<div class="panel-card"><div class="panel-head"><h3>Tipos de almacenamiento (MW)</h3></div><div class="bars">{tipos_html}</div></div>'
 f'</div>{saee_table}')
SLIDES.append(cslide(2,"Almacenamiento (SAEE)","Almacenamiento",
 'El país tendrá <span class="hl">8,408 MW</span> de almacenamiento de energía proveniente del sol y el viento',
 body2,
 'SAEE: Sistema de Almacenamiento de Energía Eléctrica. Cifras en MW; pueden no sumar por redondeo. Regiones de control · CENACE. Fuente: SENER.'))

CAPKPIS=('<div class="kpi-cards k4">'
 +kpicard("k-n","bi-lightning-charge","Capacidad 2024",'93,529<span class="u">MW</span>')
 +kpicard("k-g","bi-lightning-charge-fill","Capacidad 2030",'122,298<span class="u">MW</span>')
 +kpicard("k-v","bi-graph-up-arrow","Incremento neto",'+28,769<span class="u">MW</span>')
 +kpicard("k-d","bi-percent","Crecimiento total",'+30.76<span class="u">%</span>')
 +'</div>')
LEADCAP='En 2030 la capacidad llegará a <span class="hl">122,298 MW</span>; casi la mitad será energía <span class="hlv">renovable</span>'
FOOTCAP='Capacidad instalada en MW. La generación renovable incluye cogeneración eficiente y nuclear. Fuente: SENER.'

# ---- Slide 3: capacidad MW ----
body3=(CAPKPIS+f'<div class="content-grid g-21">'
 f'<div class="col">{panel("Capacidad instalada por tecnología (MW)","c_cap_stack")}</div>'
 f'<div class="col col-side2">{panel("Participación limpia vs fósil (%)","c_cap_line")}'
 f'{statpanel("Renovable 2030","bi-leaf-fill","45%","renovable 2030")}</div></div>')
SLIDES.append(cslide(3,"Capacidad instalada","Capacidad 2030",LEADCAP,body3,FOOTCAP))

# ---- Slide 4: composición % ----
body4=(CAPKPIS+f'<div class="content-grid g-21">'
 f'<div class="col">{panel("Composición de la capacidad por tecnología (% del total)","c_comp_stack")}</div>'
 f'<div class="col col-side2">{panel("Participación limpia vs fósil (%)","c_comp_line")}'
 f'{statpanel("Renovable 2030","bi-leaf-fill","45%","renovable 2030")}</div></div>')
SLIDES.append(cslide(4,"Composición de capacidad","Composición",LEADCAP,body4,FOOTCAP))

# ---- Slide 5: sankey (reuse) ----
body5=(f'<div class="sankey-panel"><div class="panel-head"><h3>Evolución de la capacidad eléctrica por tecnología (Sankey)</h3></div>'
 f'<div class="chart-wrap" id="skWrap">{sankeysvg}<div class="sk-tip" id="skTip"></div></div>'
 f'<div class="legend" id="skLegend">{skleg}</div></div>')
SLIDES.append(cslide(5,"Evolución por tecnología","Sankey",LEADCAP,body5,FOOTCAP))

# ---- Slide 6: generación GWh ----
GENKPIS=('<div class="kpi-cards k4">'
 +kpicard("k-n","bi-lightning","Generación 2024",'352,305<span class="u">GWh</span>')
 +kpicard("k-g","bi-lightning-fill","Generación 2030",'409,705<span class="u">GWh</span>')
 +kpicard("k-v","bi-leaf-fill","Limpia 2030",'38<span class="u">% · vs 24% 2024</span>')
 +kpicard("k-d","bi-arrow-up-circle","Incremento limpia",'+14<span class="u">pp</span>')
 +'</div>')
LEADGEN='La generación crecerá a <span class="hl">410 TWh</span> y la energía limpia llegará al <span class="hlv">38%</span>'
FOOTGEN='Generación anual en GWh (TWh = mil GWh). El porcentaje indica la participación de energía limpia. Fuente: SENER.'
body6=(GENKPIS+f'<div class="content-grid g-21">'
 f'<div class="col">{panel("Generación de electricidad por origen (GWh)","c_gen_stack")}</div>'
 f'<div class="col col-side2">{panel("Participación de energía limpia (%)","c_gen_line")}'
 f'{statpanel("Limpia 2030","bi-leaf-fill","38%","limpia 2030")}</div></div>')
SLIDES.append(cslide(6,"Generación por origen","Generación",LEADGEN,body6,FOOTGEN))

# ---- Slide 7: generación % ----
body7=(GENKPIS+f'<div class="content-grid g-21">'
 f'<div class="col">{panel("Composición de la generación por origen (% del total)","c_genc_stack")}</div>'
 f'<div class="col col-side2">{panel("Participación de energía limpia (%)","c_genc_line")}'
 f'{statpanel("Limpia 2030","bi-leaf-fill","38%","limpia 2030")}</div></div>')
SLIDES.append(cslide(7,"Composición de generación","Composición gen.",LEADGEN,body7,FOOTGEN))

# ---- Slide 8: Escenario A ----
escAk=('<div class="kpi-cards k4">'
 +kpicard("k-g","bi-bank2","Estado en 2030",'55<span class="u">%</span>')
 +kpicard("k-d","bi-people-fill","Particulares en 2030",'44<span class="u">%</span>')
 +kpicard("k-n","bi-arrow-up-circle","Salto del Estado 2023→2024",'+13<span class="u">pp</span>')
 +kpicard("k-n","bi-graph-down","Máximo de particulares (2020)",'60<span class="u">%</span>')
 +'</div>')
body8=(escAk+f'<div class="content-grid g-1full">{panel("Participación en la generación eléctrica (%) · 2018–2030","c_escA")}</div>')
SLIDES.append(cslide(8,"Escenario A · 55% contratos mixtos","Escenario A",
 'El Estado generará el <span class="hl">55%</span> de la electricidad del país en 2030',body8,
 'Participación en la generación eléctrica. Excluye generación distribuida. Crecimiento medio anual del PIB 2%. Fuente: SENER.'))

# ---- Slide 9: Escenario B ----
escBk=('<div class="kpi-cards k4">'
 +kpicard("k-g","bi-bank2","Estado en 2030",'58<span class="u">%</span>')
 +kpicard("k-d","bi-people-fill","Particulares en 2030",'40<span class="u">%</span>')
 +kpicard("k-n","bi-arrow-up-circle","Salto del Estado 2023→2024",'+12<span class="u">pp</span>')
 +kpicard("k-n","bi-file-earmark-text","Contratos mixtos al Estado",'100<span class="u">%</span>')
 +'</div>')
body9=(escBk+f'<div class="content-grid g-1full">{panel("Participación en la generación eléctrica (%) · 2018–2030","c_escB")}</div>'
 f'<div class="hl-banner"><i class="bi bi-shield-fill-check"></i>El Estado recupera la soberanía energética</div>')
SLIDES.append(cslide(9,"Escenario B · 100% contratos CFE mixtos","Escenario B",
 'Si el Estado toma todos los contratos mixtos, generará el <span class="hl">58%</span>',body9,
 'Mismo análisis del escenario anterior, con el Estado participando al 100% en los contratos mixtos con CFE. Excluye generación distribuida. Fuente: SENER.'))

# ---- Slide 10: ANEXOS divider (estilo portada) ----
SLIDES.append('<section class="slide cover" id="slide-10"><div class="slide-container">'
 '<div class="cv-photo"><img src="reno_anexos.png" alt="" onerror="this.parentNode.style.display=\'none\'"></div>'
 '<div class="cv-diag"></div><div class="cv-dots"></div>'
 '<div class="cv-logos"><img class="gob" src="Estilos Institucionales/img/logo_gob.png" onerror="this.style.display=\'none\'">'
 '<div class="cdiv"></div><img class="energia" src="Estilos Institucionales/img/logo_sener.png" onerror="this.style.display=\'none\'"></div>'
 '<div class="cv-unit">DGMESNIE · Subsecretaría de Planeación</div>'
 '<div class="cv-body">'
   '<div class="eyebrow">Información de soporte</div>'
   '<h1 class="anx-h1">Anexos</h1>'
   '<div class="cover-rule"></div>'
   '<div class="unidad">Detalle de capacidad, almacenamiento y generación</div>'
   '<div class="unidad-sub">Periodo 2024 — 2030 · <span class="acronym">DGMESNIE</span></div>'
 '</div>'
 '<div class="bottom-band"></div></div></section>')

# ---- Slides 11-15: anexo tables ----
def anexslide(idx,line2,title,lead,tbl,foot):
    return (f'<section class="slide" id="slide-{idx}"><div class="slide-container">'
            f'{header(line2,title)}<div class="lead small">{lead}</div>'
            f'<div class="anex-wrap">{tbl}</div>'
            f'<div class="snote">{foot}</div><div class="slide-footer"></div></div></section>')
SLIDES.append(anexslide(11,"Anexo · Capacidad nueva","Anexo capacidad nueva",
 'Capacidad nueva por tipo de proyecto y tecnología (MW) · 2026–2030',anx_tec,
 'CC Ciclo combinado · CI Combustión interna · CC/COG Ciclo combinado con cogeneración · BIO Bioenergía · PSC Termosolar · EO Eólica · FV Fotovoltaica · GEO Geotermia · H₂ Hidrógeno · HID Hidroeléctrica.'))
SLIDES.append(anexslide(12,"Anexo · Almacenamiento","Anexo almacenamiento",
 'Almacenamiento por Gerencia de Control Regional y tipo (MW)',anx_alm,
 'SAEE: Sistema de Almacenamiento de Energía Eléctrica. Cifras en MW; pueden no sumar por redondeo.'))
SLIDES.append(anexslide(13,"Anexo · Capacidad","Anexo capacidad instalada",
 'Capacidad instalada por tecnología (MW) · 2024–2030',anx_cap,
 'La generación renovable incluye cogeneración eficiente y nuclear. Cifras pueden no sumar por redondeo.'))
SLIDES.append(anexslide(14,"Anexo · Escenario A","Anexo quién genera A",
 'Quién genera la electricidad — Escenario A (GWh) · 2024–2030',anx_escA,
 '1/ LIE incluye permisionarios de LSE · 2/ Contrato de Interconexión Legado · 3/ Subastas de Largo Plazo. Cifras pueden no sumar por redondeo.'))
SLIDES.append(anexslide(15,"Anexo · Escenario B","Anexo Estado vs particulares B",
 'Estado frente a particulares — Escenario B (GWh) · 2024–2030',anx_escB,
 'GWh por tipo de productor. PIE Productores Independientes · LIE Ley de la Industria Eléctrica · CIL Contratos de Interconexión Legados. Fuente: SENER · CFE.'))

SLIDES_HTML='\n'.join(SLIDES)

template=open('_template.html',encoding='utf-8').read()
html=(template
  .replace('@@SLIDES@@',SLIDES_HTML)
  .replace('@@DATA@@', json.dumps(DATA, ensure_ascii=False)))
open('EXPANSION-RENOVABLES.html','w',encoding='utf-8').write(html)
print('written EXPANSION-RENOVABLES.html', len(html),'chars · slides', len(SLIDES)+1)
