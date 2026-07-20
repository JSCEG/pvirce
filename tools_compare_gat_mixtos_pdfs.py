# -*- coding: utf-8 -*-
import csv
import difflib
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PDF_RESUMEN_TXT = ROOT / "tmp_mixtos_resumen_20260624.txt"
PDF_AVANCES_TXT = ROOT / "tmp_mixtos_avances_20260625.txt"
GAT_CSV = ROOT / "tmp_gat_mixto_sheet.csv"
OUT = ROOT / "REVISION_GAT_MIXTO_PDFS_2026-06-24.md"


ALIASES = {
    "PROYECTO SAN SIMON SOLAR": "SAN SIMON SOLAR",
    "PROYECTO DELARO": "DELARO",
    "PROYECTO LOS MOLINOS": "ENERGEO LOS MOLINOS",
    "PROYECTO MONTECRISTO": "MONTECRISTO",
    "PROYECTO SOL DE SONORA": "SOL DE SONORA",
    "PROYECTO CONCEPCION MENDIZABAL LAS CONCHITAS": "CONCEPCION MENDIZABAL MENDOZA",
    "PROYECTO SELKA POWER": "SELKA POWER PLANT I",
    "PROYECTO CIMARRON SOLAR": "CIMARRON SOLAR",
    "PROYECTO EL MEZQUITE": "ENERGIA LIMPIA EL MEZQUITE",
    "PROYECTO ENERGIAS RENOVABLES DE TAMAULIPAS ALTAMIRA": "PARQUE FV ENERGIAS RENOVABLES DE TAMAULIPAS ALTAMIRA",
    "PROYECTO ENERGIAS RENOVABLES SAAS PETO": "PARQUE FV ENERGIAS RENOVABLES SAAS PETO",
    "PROYECTO ENERGIAS RENOVABLES KIIN TEKAX": "ENERGIAS RENOVABLES KIIN TEKAX",
    "PROYECTO ENERGIAS RENOVABLES DE MEXICO TRES HECELCHAKAN": "PARQUE FV ENERGIAS RENOVABLES DE MEXICO TRES HECELCHAKAN",
}


def norm(text):
    s = str(text or "")
    s = s.replace("\xa0", " ")
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.upper()
    s = s.replace("&", " Y ")
    s = re.sub(r"\bPFV\b", "FV", s)
    s = re.sub(r"\bPARQUE\s+FV\b", "FV", s)
    s = re.sub(r"\bPROYECTO\b", "", s)
    s = re.sub(r"\bFASE\s+[I1]{1,3}\b", "", s)
    s = re.sub(r"\b70\b", "", s)
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return ALIASES.get(s, s)


def parse_num(text):
    m = re.search(r"\d+(?:[.,]\d+)?", str(text or ""))
    return float(m.group(0).replace(",", ".")) if m else 0.0


def clean_name(text):
    s = re.sub(r"\s+", " ", str(text or "").replace("\xa0", " ")).strip()
    s = re.sub(r"\s*\((e[oó]lico|fotovoltaico)\)\s*$", "", s, flags=re.I)
    return s.strip(" .")


def extract_resumen_projects():
    text = PDF_RESUMEN_TXT.read_text(encoding="utf-8", errors="replace")
    blocks = re.split(r"\n(?=PROYECTO\s+[A-ZÁÉÍÓÚÑ])", text)
    rows = []
    for block in blocks:
        m = re.match(r"(PROYECTO[^\n]+)", block.strip())
        if not m:
            continue
        name = clean_name(m.group(1))
        empresa = re.search(r"Empresa:\s*([^\n]+)", block)
        tipo = re.search(r"Tipo:\s*([^\n]+)", block)
        ubicacion = re.search(r"Ubicaci[oó]n:\s*([^\n]+)", block)
        capacidad = re.search(r"Capacidad:\s*([^\n]+)", block)
        ruta = re.search(r"Ruta Cr[ií]tica:\s*([^\n]+)", block, flags=re.I)
        rows.append({
            "source": "resumen",
            "name": name,
            "key": norm(name),
            "empresa": clean_name(empresa.group(1)) if empresa else "",
            "tipo": clean_name(tipo.group(1)) if tipo else "",
            "ubicacion": clean_name(ubicacion.group(1)) if ubicacion else "",
            "mw": parse_num(capacidad.group(1)) if capacidad else 0,
            "ruta": clean_name(ruta.group(1)) if ruta else "",
        })
    return rows


def extract_avances_table_projects():
    text = PDF_AVANCES_TXT.read_text(encoding="utf-8", errors="replace")
    names = [
        ("Energeo Los Molinos", 171.1, "Thermion", "EO"),
        ("Delaro", 175.0, "Thermion", "EO"),
        ("Montecristo", 510.0, "Thermion", "EO"),
        ("Sol de Sonora", 70.0, "Thermion", "FV"),
        ("Concepción Mendizábal Mendoza Fase I", 339.0, "Atlas Renewable Energy", "FV"),
        ("Concepción Mendizábal Mendoza Fase II", 180.0, "Atlas Renewable Energy", "FV"),
        ("Concepción Mendizábal Mendoza Fase III", 339.0, "Atlas Renewable Energy", "FV"),
        ("San Simón Solar", 80.0, "Fisterra Energy", "FV"),
        ("Selka Power Plant I", 131.0, "Selka", "FV"),
        ("Cimarrón Solar", 300.0, "CSQB Energy", "FV"),
        ("Parque FV Energías Renovables de Tamaulipas (Altamira)", 78.0, "Cubico", "FV"),
        ("Sunora", 300.0, "CSQB Energy", "FV"),
        ("Dalia 3 (PV Castamay)", 100.0, "Atlantica Renewable Power México", "FV"),
        ("Energía Limpia El Mezquite", 300.0, "Cúbico", "EO"),
        ("Parque FV Energías Renovables SAAS (Peto)", 72.0, "Cúbico", "FV"),
        ("Energías Renovables KIIN (Tekax)", 56.0, "Cúbico", "FV"),
        ("Parque FV Energías Renovables de México tres (Hecelchakan)", 72.0, "Cúbico", "FV"),
        ("El Palmar", 120.0, "Cúbico", "FV"),
        ("La Pasión", 66.0, "Eléctrica Aselco", "FV"),
        ("Tikinimul", 170.0, "Eléctrica Aselco", "FV"),
        ("El Guajillo", 468.0, "Thermion", "EO"),
        ("Santa Gertrudis", 503.0, "Thermion", "EO"),
        ("Planta Solar Cerro Colorado", 455.7, "Fisterra Energy", "FV"),
        ("Planta Solar Haab Kiin", 123.2, "Fisterra Energy", "FV"),
        ("CFV Quasara", 150.0, "Sukarne", "FV"),
        ("La Poza Solar", 300.0, "CSQB Energy", "FV"),
        ("Fresnillo (PV Atocha)", 100.0, "Atlantica Renewable Power", "FV"),
        ("Vientos de la Bella Unión", 120.0, "ACTIS", "FV"),
        ("PV Moquel Solar", 75.0, "ACTIS", "FV"),
        ("PV Sandom Solar", 54.0, "ACTIS", "FV"),
        ("Azura Solar - Solar Energía Tres Hermanos", 75.0, "Libienergy", "FV"),
        ("Los Girasoles", 110.0, "Libienergy", "FV"),
        ("Álvaro Obregón", 90.0, "ZML Desarrolladora", "FV"),
        ("Solitario", 200.0, "Grupo Pantera", "FV"),
        ("Ranchos La Crisis y La Noria", 301.5, "Grupo Pantera", "EO"),
        ("El Chorro", 700.0, "Terralia", "EO"),
        ("Don Humberto", 19.2, "Polaris", "FV"),
        ("CFV Las Grazas", 270.0, "MIP Freeman Energy", "FV"),
        ("San Pedro Solar", 98.2, "Elawan Wind México III", "FV"),
        ("Global Solar 3 Campeche", 133.0, "Global Solar America", "FV"),
    ]
    rows = []
    for name, mw, empresa, tipo in names:
        if norm(name) in norm(text):
            rows.append({"source": "avances", "name": name, "key": norm(name), "empresa": empresa, "tipo": tipo, "mw": mw})
    return rows


def read_gat_sheet():
    with GAT_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        lines = f.read().splitlines()
    # El HTML descarta la primera fila de titulo y usa la segunda como encabezado.
    rows = list(csv.DictReader(lines[1:]))
    out = []
    for r in rows:
        name = clean_name(r.get("Nombre del proyecto") or r.get("Nombre") or "")
        if not name:
            continue
        out.append({
            "name": name,
            "key": norm(name),
            "folio": (r.get("Folio Proyecto") or r.get("Pre Folio") or "").strip(),
            "empresa": clean_name(r.get("GIE general") or r.get("GIE limpio") or ""),
            "tipo": clean_name(r.get("Tipo Tecnología") or ""),
            "mw": parse_num(r.get("Capacidad neta MW") or r.get("Capacidad original MW") or ""),
            "estado": clean_name(r.get("Estado") or ""),
            "estatus": clean_name(r.get("Estatus") or ""),
        })
    return out


def match(pdf_row, gat_rows):
    key = pdf_row["key"]
    exact = [g for g in gat_rows if g["key"] == key or key in g["key"] or g["key"] in key]
    if exact:
        return sorted(exact, key=lambda g: abs((pdf_row.get("mw") or 0) - (g.get("mw") or 0)))[0], 1.0
    keys = [g["key"] for g in gat_rows]
    close = difflib.get_close_matches(key, keys, n=1, cutoff=0.72)
    if close:
        g = next(x for x in gat_rows if x["key"] == close[0])
        return g, difflib.SequenceMatcher(None, key, close[0]).ratio()
    return None, 0


def write_report():
    resumen = extract_resumen_projects()
    avances = extract_avances_table_projects()
    gat = read_gat_sheet()

    all_pdf = []
    seen = set()
    for row in avances + resumen:
        k = row["key"]
        # El resumen agrega Concepcion como 858 MW; avances la separa por fases.
        if k in seen:
            continue
        seen.add(k)
        all_pdf.append(row)

    matched = []
    missing = []
    mw_diff = []
    for row in all_pdf:
        g, score = match(row, gat)
        if not g:
            missing.append(row)
            continue
        matched.append((row, g, score))
        if row.get("mw") and g.get("mw") and abs(row["mw"] - g["mw"]) > 1.0:
            mw_diff.append((row, g, score))

    lines = []
    lines.append("# Revision GAT-Mixto contra PDFs 24-25 de junio de 2026")
    lines.append("")
    lines.append("Fuentes comparadas:")
    lines.append("- `GAT-MIXTO-DGMESNIE.html` -> Google Sheets publicado `gid=1612312561`.")
    lines.append("- `2606-24 Proyectos Mixtos Resumen V01.pdf`.")
    lines.append("- `26 06 24 DPI - Proyectos Mixtos - Avances en proyectos 2.pdf`.")
    lines.append("")
    lines.append("## Resumen")
    lines.append(f"- Proyectos en PDF resumen narrativo: {len(resumen)}.")
    lines.append(f"- Proyectos/programa identificados en PDF avances: {len(avances)}.")
    lines.append(f"- Universo PDF consolidado para comparacion: {len(all_pdf)}.")
    lines.append(f"- Proyectos en Sheet GAT actual: {len(gat)}.")
    lines.append(f"- Coincidencias PDF -> Sheet GAT: {len(matched)}.")
    lines.append(f"- No encontrados en Sheet GAT: {len(missing)}.")
    lines.append(f"- Diferencias de capacidad > 1 MW: {len(mw_diff)}.")
    lines.append("")

    lines.append("## No encontrados en el Sheet GAT actual")
    if missing:
        lines.append("| Proyecto PDF | Empresa | Tipo | MW | Fuente |")
        lines.append("|---|---|---|---:|---|")
        for r in missing:
            lines.append(f"| {r['name']} | {r.get('empresa','')} | {r.get('tipo','')} | {r.get('mw',0):g} | {r.get('source','')} |")
    else:
        lines.append("Todos los proyectos del universo PDF consolidado aparecen en el Sheet GAT actual.")
    lines.append("")

    lines.append("## Diferencias de capacidad")
    if mw_diff:
        lines.append("| Proyecto PDF | MW PDF | Proyecto Sheet | MW Sheet | Folio | Score |")
        lines.append("|---|---:|---|---:|---|---:|")
        for r, g, score in mw_diff:
            lines.append(f"| {r['name']} | {r.get('mw',0):g} | {g['name']} | {g.get('mw',0):g} | {g.get('folio','')} | {score:.2f} |")
    else:
        lines.append("No hay diferencias de capacidad mayores a 1 MW en las coincidencias detectadas.")
    lines.append("")

    lines.append("## Coincidencias detectadas")
    lines.append("| Proyecto PDF | MW PDF | Proyecto Sheet | MW Sheet | Folio | Estado | Estatus |")
    lines.append("|---|---:|---|---:|---|---|---|")
    for r, g, score in sorted(matched, key=lambda x: x[0]["key"]):
        lines.append(f"| {r['name']} | {r.get('mw',0):g} | {g['name']} | {g.get('mw',0):g} | {g.get('folio','')} | {g.get('estado','')} | {g.get('estatus','')} |")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(OUT)


if __name__ == "__main__":
    write_report()
