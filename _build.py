# -*- coding: utf-8 -*-
import json, re

mapsvg   = open('_map.svg',encoding='utf-8').read().replace('Outfit,sans-serif','Montserrat,sans-serif')
sankeysvg= open('_sankey.svg',encoding='utf-8').read()
skleg    = open('_sklegend.html',encoding='utf-8').read()
tables   = json.load(open('_tables.json',encoding='utf-8'))

# ===== Capacidad nueva 2026-2030 desde "Tabla PVIRCE.xlsx" (_pvirce.xlsx) =====
import openpyxl
_wb=openpyxl.load_workbook('_pvirce.xlsx',data_only=True); _ws=_wb.active
def _v(r,c):
    x=_ws.cell(r,c).value
    return 0.0 if x is None else float(x)
def _i(x): return int(round(x))
CN_TECHS=['CC','CC/COG_EF','CI','CI/BIO','CI/COG','CSP','EO','FV','GEO','H2','HID']
HDR_DISP={'CC':'CC','CC/COG_EF':'CC/COG EF','CI':'CI','CI/BIO':'CI/BIO','CI/COG':'CI/COG',
 'CSP':'CSP','EO':'EO','FV':'FV','GEO':'GEO','H2':'H₂','HID':'HID'}
_rowmap=[(44,'CFE en proceso'),(45,'CFE por licitar'),(46,'CFE terminados inaugurados'),
 (47,'CFE terminados por inaugurar'),(48,'Mixtos de CFE asignados'),(49,'Mixtos de CFE por asignar'),
 (50,'Particulares asignados'),(51,'Particulares por asignar')]
CN_ROWS=[(nm,{t:_v(r,4+i) for i,t in enumerate(CN_TECHS)},_v(r,15)) for r,nm in _rowmap]
CN_TOT={t:_v(52,4+i) for i,t in enumerate(CN_TECHS)}
CN_TOTAL=_v(52,15)
BAT_TOTAL=_v(68,4)
FOSIL_T={'CC','CI','CI/COG'}
CN_LIMPIA=_i(sum(v for t,v in CN_TOT.items() if t not in FOSIL_T))
CN_LIMPIA_PCT=round(CN_LIMPIA/CN_TOTAL*100)

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

# ===== overrides desde Tabla PVIRCE.xlsx =====
_TC={'CC':'#7B828D','CC/COG EF':'#8A9A2E','CI':'#5E6671','CI/BIO':'#4E8B3F','CI/COG':'#9AA0A6',
 'CSP':'#E07B2A','EO':'#2F94AC','FV':'#D99A00','GEO':'#C0552E','H₂':'#1F9488','HID':'#2E6FB0'}
_ordn=[t for t in sorted(CN_TECHS,key=lambda t:-CN_TOT[t]) if CN_TOT[t]>=1]
DATA["tecNueva"]={"cats":[HDR_DISP[t] for t in _ordn],
 "vals":[_i(CN_TOT[t]) for t in _ordn],
 "colors":[_TC[HDR_DISP[t]] for t in _ordn]}
_cfe=_i(sum(CN_ROWS[i][2] for i in range(4)))
_soc=_i(CN_ROWS[4][2]+CN_ROWS[5][2])
_par=_i(CN_ROWS[6][2]+CN_ROWS[7][2])
DATA["estatus"]={"nodes":[
   {"id":"Capacidad nueva","mw":_i(CN_TOTAL),"grp":"root"},
   {"id":"CFE","mw":_cfe,"grp":"cfe"},{"id":"Sociedades con CFE","mw":_soc,"grp":"soc"},
   {"id":"Particulares","mw":_par,"grp":"par"},
   {"id":"En proceso","mw":_i(CN_ROWS[0][2]),"grp":"cfe"},
   {"id":"Por licitar","mw":_i(CN_ROWS[1][2]),"grp":"cfe"},
   {"id":"Terminados inaugurados","mw":_i(CN_ROWS[2][2]),"grp":"cfe"},
   {"id":"Terminados por inaugurar","mw":_i(CN_ROWS[3][2]),"grp":"cfe"},
   {"id":"Asignados (soc)","mw":_i(CN_ROWS[4][2]),"grp":"soc"},
   {"id":"Por asignar (soc)","mw":_i(CN_ROWS[5][2]),"grp":"soc"},
   {"id":"Asignados (part)","mw":_i(CN_ROWS[6][2]),"grp":"par"},
   {"id":"Por asignar (part)","mw":_i(CN_ROWS[7][2]),"grp":"par"},
 ],"links":[
   ["Capacidad nueva","CFE"],["Capacidad nueva","Sociedades con CFE"],["Capacidad nueva","Particulares"],
   ["CFE","En proceso"],["CFE","Por licitar"],["CFE","Terminados inaugurados"],["CFE","Terminados por inaugurar"],
   ["Sociedades con CFE","Asignados (soc)"],["Sociedades con CFE","Por asignar (soc)"],
   ["Particulares","Asignados (part)"],["Particulares","Por asignar (part)"],
 ]}

# ---------- paleta master de tecnologías (consistente en TODO el deck) ----------
TECHCOLORS={
 'Fotovoltaica':'#D99A00','Eólica':'#2F94AC','Hidroeléctrica':'#2E6FB0','Geotermia':'#C0552E',
 'Bioenergía':'#4E8B3F','Hidrógeno':'#1F9488','Termosolar':'#E07B2A','Nuclear':'#7E5AA2',
 'Cogeneración eficiente':'#8A9A2E','Ciclo combinado':'#7B828D','Térmica convencional':'#A8743A',
 'Turbogás':'#C24A3A','Combustión interna':'#5E6671','Carboeléctrica':'#3C424B',
 'Otras fósiles':'#5E6671','Otras renovables':'#4E8B3F'}
TECHCODES={'CC':'#7B828D','CC/COG EF':'#8A9A2E','CI':'#5E6671','CI/BIO':'#4E8B3F','CI/COG':'#9AA0A6',
 'CSP':'#E07B2A','EO':'#2F94AC','FV':'#D99A00','GEO':'#C0552E','H₂':'#1F9488','HID':'#2E6FB0'}

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

def _fmt(v): return f"{v:,}"
_cn_grid=[['Tipo de proyecto']+[HDR_DISP[t] for t in CN_TECHS]+['Total']]
for _nm,_vals,_tot in CN_ROWS:
    _cn_grid.append([_nm]+[(_fmt(_i(_vals[t])) if _vals[t] else '') for t in CN_TECHS]+[_fmt(_i(_tot))])
_cn_grid.append(['Total general']+[_fmt(_i(CN_TOT[t])) for t in CN_TECHS]+[_fmt(_i(CN_TOTAL))])
anx_tec   = render_table(_cn_grid, col_colors=TECHCODES, colzebra=True)
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
# ---- Slide 1: nueva generación (KPIs + Tecnologías) ----
body1=(f'<div class="kpi-cards">'
   f'{kpicard("k-cap","bi-lightning-charge-fill","Capacidad nueva total","+32,475 MW","Adiciones 2026–2030 al SEN")}'
   f'{kpicard("k-lim","bi-leaf-fill","Energía limpia",f"{CN_LIMPIA_PCT}% · {CN_LIMPIA:,} MW","Renovables y cogeneración eficiente")}'
   f'{kpicard("k-alm","bi-battery-charging","Almacenamiento",f"+{_i(BAT_TOTAL):,} MW","Baterías asociadas a FV y eólica")}'
 f'</div>'
 f'<div class="content-grid g-1full">'
   f'{panel("Tecnologías — capacidad nueva (MW)","c_tec_nueva")}'
 f'</div>')
SLIDES.append(cslide(1,"Capacidad nueva 2026–2030","Nueva generación",
 'México sumará <span class="hl">32,475 MW</span> de nueva generación; <span class="hlv">7 de cada 10 MW</span> son de energía limpia',
 body1,
 '<b>Tecnologías:</b> CC Ciclo combinado · CC/COG EF Ciclo combinado con cogeneración eficiente · CI Combustión interna · CI/BIO Combustión interna con bioenergía · CI/COG Combustión interna con cogeneración · CSP Termosolar · EO Eólica · FV Fotovoltaica · GEO Geotermia · H₂ Hidrógeno · HID Hidroeléctrica.',
 noteic='bi-leaf-fill'))

# ---- Slide 1b: estatus de los proyectos (burbujas radiales) ----
import math as _m
def _rnd(x): return int(_m.floor(x+0.5))
ESTCOL={'Terminado':'#1E5B4F','En proceso':'#2E6FB0','Asignado':'#9B2247','Por asignar':'#A57F2C'}
# (valor, descriptor, categoría, ángulo°)  valores desde CN_ROWS
_eb=[
 (_rnd(CN_ROWS[4][2]),'Mixtos CFE asignados','Asignado',90),
 (_rnd(CN_ROWS[2][2]),'Terminados inaugurados','Terminado',45),
 (_rnd(CN_ROWS[5][2]),'Mixtos CFE por asignar','Por asignar',0),
 (_rnd(CN_ROWS[6][2]),'Particulares asignados','Asignado',-45),
 (_rnd(CN_ROWS[3][2]),'Terminados por inaugurar','Terminado',-90),
 (_rnd(CN_ROWS[0][2]),'CFE en proceso','En proceso',-135),
 (_rnd(CN_ROWS[7][2]),'Particulares por asignar','Por asignar',180),
 (_rnd(CN_ROWS[1][2]),'CFE por licitar','Por asignar',135),
]
_W,_Hh=1180,560; _cx,_cy=470,285
def _rof(mw): return 0.62*_m.sqrt(mw)
_rc=_rof(CN_TOTAL)
_circ=[];_lab=[]
# central
_circ.append(f'<circle cx="{_cx}" cy="{_cy}" r="{_rc:.0f}" fill="#3f4145"/>')
_lab.append(f'<text x="{_cx}" y="{_cy-12}" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="36" font-weight="800" fill="#fff">{_rnd(CN_TOTAL):,}</text>'
 f'<text x="{_cx}" y="{_cy+10}" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="15" font-weight="700" fill="#D6B46A">MW</text>'
 f'<text x="{_cx}" y="{_cy+30}" text-anchor="middle" font-family="Hind,sans-serif" font-size="13" fill="#e7e7e7">Capacidad nueva</text>'
 f'<text x="{_cx}" y="{_cy+46}" text-anchor="middle" font-family="Hind,sans-serif" font-size="13" font-weight="700" fill="#fff">TOTAL</text>')
for v,desc,cat,ang in _eb:
    r=_rof(v); col=ESTCOL[cat]; a=_m.radians(ang)
    d=_rc+r+30; x=_cx+d*_m.cos(a); y=_cy-d*_m.sin(a)
    _circ.append(f'<circle class="eb" cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{col}"/>')
    fsv=26 if r>=46 else (22 if r>=34 else 17)
    if r>=40:
        _lab.append(f'<text x="{x:.1f}" y="{y-2:.1f}" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="{fsv}" font-weight="800" fill="#fff">{v:,}</text>'
          f'<text x="{x:.1f}" y="{y+16:.1f}" text-anchor="middle" font-family="Hind,sans-serif" font-size="11.5" font-weight="600" fill="#fff">{desc}</text>')
    else:
        _lab.append(f'<text x="{x:.1f}" y="{y+5:.1f}" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="{fsv}" font-weight="800" fill="#fff">{v:,}</text>')
        lx=_cx+(d+r+14)*_m.cos(a); ly=_cy-(d+r+14)*_m.sin(a)
        anc='middle'
        _lab.append(f'<text x="{lx:.1f}" y="{ly+4:.1f}" text-anchor="{anc}" font-family="Hind,sans-serif" font-size="12" font-weight="600" fill="#555">{desc}</text>')
# leyenda derecha
_leg=[];_lx=_W-205;_ly=70
for i,(cat,col) in enumerate(ESTCOL.items()):
    yy=_ly+i*52
    _leg.append(f'<circle cx="{_lx}" cy="{yy}" r="15" fill="{col}"/>'
      f'<text x="{_lx+28}" y="{yy+6}" font-family="Montserrat,sans-serif" font-size="17" font-weight="700" fill="#2b2b2b">{cat}</text>')
ebub_svg=(f'<svg viewBox="0 0 {_W} {_Hh}" class="ebub-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">\n'
  +"\n".join(_circ)+"\n"+"\n".join(_lab)+"\n"+"\n".join(_leg)+"\n</svg>")
ebub_panel=(f'<div class="panel-card"><div class="panel-head"><h3>Estatus de los proyectos de generación (MW)</h3></div>'
  f'<div class="ebub-wrap">{ebub_svg}</div></div>')
body1b=(f'<div class="kpi-cards">'
   f'{kpicard("k-g","bi-bank2","CFE",f"{_cfe:,} MW","Proyectos propios y con prelación")}'
   f'{kpicard("k-d","bi-diagram-3","Sociedades con CFE",f"{_soc:,} MW","Mixtos asignados y por asignar")}'
   f'{kpicard("k-v","bi-people-fill","Particulares",f"{_par:,} MW","Asignados y por asignar")}'
 f'</div>'
 f'<div class="content-grid g-1full">{ebub_panel}</div>')
SLIDES.append(cslide("1b","Capacidad nueva 2026–2030","Estatus de proyectos",
 'Los <span class="hl">32,475 MW</span> por <span class="hlv">actor y estatus</span>: CFE, sociedades con CFE y particulares',
 body1b,
 'MW por tipo de proyecto. Estatus: terminados, en proceso, asignados y por asignar / por licitar. Fuente: SENER · CENACE.'))

# ---- Slide 2: SAEE map + desglose por finalidad ----
REGCOL={'Noroeste':'#1E5B4F','Norte':'#9B2247','Noreste':'#3E8174','Occidental':'#A57F2C',
 'Central':'#B24C6C','Oriental':'#6FA89A','Peninsular':'#A33052','B. Calif.':'#7E3B52',
 'BC Sur':'#A9CDC3','Mulegé':'#E0CA8E'}
# (nombre completo, clave REGCOL, confiabilidad, integración, total)  — Tabla PVIRCE
saee_rows=[('Baja California','B. Calif.',190,440,630),('Baja California Sur','BC Sur',50,202,252),
 ('Mulegé','Mulegé',5,2,7),('Norte','Norte',400,81,481),('Noreste','Noreste',120,2021,2141),
 ('Noroeste','Noroeste',280,298,578),('Oriental','Oriental',200,1088,1288),
 ('Occidental','Occidental',100,620,720),('Peninsular','Peninsular',200,1101,1301),
 ('Central','Central',None,None,1011)]
_saee_sorted=sorted(saee_rows,key=lambda r:-r[4])
_saee_tr=''.join(
 f'<tr><td class="rl"><span class="sw" style="background:{REGCOL[k]}"></span>{nm}</td>'
 f'<td class="num">{t:,}</td><td class="num pctc">{t/8408*100:.0f}%</td></tr>'
 for nm,k,a,b,t in _saee_sorted)
saee_table=(f'<table class="report-table saee-fin"><thead><tr>'
 f'<th>Región</th><th class="num">SAEE Total (MW)</th><th class="num pctc">%</th></tr></thead>'
 f'<tbody>{_saee_tr}</tbody><tfoot><tr><td class="rl">Total</td>'
 f'<td class="num tot">8,408</td><td class="num pctc">100%</td></tr></tfoot></table>')
body2=('<div class="kpi-cards">'
 +kpicard("k-g","bi-battery-charging","Almacenamiento total",'8,408<span class="u">MW</span>',"Requerido en el SEN")
 +kpicard("k-v","bi-wind","Integración eólica y FV",'5,963<span class="u">MW · 71%</span>',"Baterías junto a centrales eólicas y solares")
 +kpicard("k-d","bi-shield-check","Confiabilidad del SEN",'1,545<span class="u">MW</span>',"Respaldo y estabilidad del sistema")
 +'</div>'
 f'<div class="map-grid">'
   f'<div class="panel-card"><div class="panel-head"><h3>Distribución por Gerencia de Control Regional (MW)</h3></div>'
     f'<div class="map-wrap" id="mapWrap">{mapsvg}<div class="map-tip" id="mapTip"></div></div></div>'
   f'<div class="panel-card"><div class="panel-head"><h3>Almacenamiento por región (MW)</h3></div>'
     f'<div class="saee-fin-wrap">{saee_table}</div></div>'
 f'</div>')
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
 'CC Ciclo combinado · CC/COG EF Ciclo combinado con cogeneración eficiente · CI Combustión interna · CI/BIO Combustión interna con bioenergía · CI/COG Combustión interna con cogeneración · CSP Termosolar · EO Eólica · FV Fotovoltaica · GEO Geotermia · H₂ Hidrógeno · HID Hidroeléctrica.'))
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
