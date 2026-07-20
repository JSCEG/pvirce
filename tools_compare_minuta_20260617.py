# -*- coding: utf-8 -*-
import csv
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parent
DOCX = Path(r"C:\Users\User\Downloads\2026-06-17_ Minuta_ 2daConv_MesaTrabajo_SPTE_VF2.docx")
CSV_PATH = ROOT / "tmp_sheet_current.csv"
MINUTAS_PATH = ROOT / "tmp_minutas_current.json"
OUT = ROOT / "REVISION_MINUTA_2026-06-17.md"


GCR_NAMES = {
    "BAJA CALIFORNIA",
    "BAJA CALIFORNIA SUR",
    "BCS",
    "CENTRAL",
    "NORESTE",
    "NORTE",
    "OCCIDENTE",
    "OCCIDENTAL",
    "ORIENTAL",
    "TOTAL",
}


def norm(text):
    s = str(text or "").strip()
    s = re.sub(r"\s+", " ", s)
    s = s.replace("\xa0", " ")
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.upper()
    s = s.replace("&", "Y")
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    s = re.sub(r"\bPFV\b", "FV", s)
    return re.sub(r"\s+", " ", s).strip()


def title_clean(text):
    s = str(text or "").strip().replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s*1/\s*$", "", s)
    return s.strip()


def parse_num(text):
    s = str(text or "").replace(",", "").strip()
    m = re.search(r"-?\d+(?:\.\d+)?", s)
    return float(m.group(0)) if m else 0.0


def read_doc_tables():
    doc = Document(DOCX)
    tables = []
    for i, table in enumerate(doc.tables):
        rows = [[cell.text.replace("\n", " / ").strip() for cell in row.cells] for row in table.rows]
        tables.append(rows)
    return tables


def rows_from_two_col_table(rows, gcr=None):
    out = []
    current_gcr = gcr
    for raw in rows[1:]:
        if len(raw) < 2:
            continue
        name = title_clean(raw[0])
        mw = parse_num(raw[1])
        n = norm(name)
        if not name or n in GCR_NAMES:
            current_gcr = name if n in GCR_NAMES and n != "TOTAL" else current_gcr
            continue
        if n.startswith("PROYECTOS ") or n == "TOTAL" or n.startswith("1 PROYECTO "):
            continue
        if "TOTAL" in n:
            continue
        out.append({"name": name, "mw": mw, "gcr": current_gcr})
    return out


def read_minuta_projects():
    tables = read_doc_tables()
    selected_final = rows_from_two_col_table(tables[12])
    selected_no_social = rows_from_two_col_table(tables[8])
    substitutes = rows_from_two_col_table(tables[7], "Oriental")
    social = rows_from_two_col_table(tables[9])
    excluyentes = rows_from_two_col_table(tables[10])
    excluyentes_no_count = rows_from_two_col_table(tables[11])
    return {
        "selected_final": selected_final,
        "selected_no_social": selected_no_social,
        "substitutes": substitutes,
        "social": social,
        "excluyentes": excluyentes,
        "excluyentes_no_count": excluyentes_no_count,
    }


def find_header(rows):
    for i, row in enumerate(rows):
        if any(str(c).strip() == "Folio Proyecto" for c in row):
            return i, [str(c).strip() for c in row]
    raise RuntimeError("No encontre header Folio Proyecto")


def read_sheet():
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))
    header_i, header = find_header(rows)
    col = {name: idx for idx, name in enumerate(header) if name and name not in header[:idx]}
    all_col = defaultdict(list)
    for idx, name in enumerate(header):
        if name:
            all_col[name].append(idx)

    def get(row, name, last=False):
        indexes = all_col.get(name, [])
        if not indexes:
            return ""
        idx = indexes[-1] if last else indexes[0]
        return str(row[idx]).strip() if idx < len(row) else ""

    records = []
    for off, row in enumerate(rows[header_i + 1 :], start=header_i + 2):
        proyecto = get(row, "Proyecto")
        folio = get(row, "Folio Proyecto")
        if not proyecto and not folio:
            continue
        mw = parse_num(get(row, "Capacidad Contratada") or get(row, "Capacidad Instalada") or get(row, "Capacidad Generación"))
        records.append(
            {
                "row": off,
                "folio": folio,
                "name": proyecto,
                "key": norm(proyecto),
                "mw": mw,
                "gcr": get(row, "Gerencia Regional"),
                "ef": get(row, "Entidad Federativa"),
                "gie": get(row, "Grupo de Interés") or get(row, "Nombre"),
                "registro": get(row, "Registro"),
                "fecha_firma": get(row, "Fecha Firma Proyecto"),
                "estatus_validacion_cenace": get(row, "Estatus Validación CENACE"),
                "estatus_pago": get(row, "Estatus de Pago"),
            }
        )
    return records


def read_minutas_history():
    try:
        data = json.loads(MINUTAS_PATH.read_text(encoding="utf-8-sig"))
    except Exception:
        return []
    if not isinstance(data, list):
        return []
    return [r for r in data if isinstance(r, dict) and r.get("folio") and r.get("folio") != "folio"]


def latest_by_folio(rows):
    latest = {}
    for r in rows:
        f = str(r.get("folio", "")).strip()
        if not f:
            continue
        if f not in latest or str(r.get("timestamp", "")) > str(latest[f].get("timestamp", "")):
            latest[f] = r
    return latest


def main():
    minuta = read_minuta_projects()
    sheet = read_sheet()
    history = read_minutas_history()
    latest = latest_by_folio(history)
    by_key = defaultdict(list)
    by_folio = {}
    for r in sheet:
        by_key[r["key"]].append(r)
        if r["folio"]:
            by_folio[r["folio"]] = r

    def match_project(p):
        key = norm(p["name"])
        hits = by_key.get(key, [])
        if not hits:
            return hits
        def score(hit):
            has_folio = 0 if hit.get("folio") and hit.get("folio") != "SIN INFORMACIÓN" else 100000
            mw_delta = abs((p.get("mw") or 0) - (hit.get("mw") or 0))
            gcr_delta = 0 if norm(p.get("gcr")) and norm(p.get("gcr")) in norm(hit.get("gcr")) else 1000
            return has_folio + gcr_delta + mw_delta
        return sorted(hits, key=score)

    sections = []
    for group, rows in minuta.items():
        matched = []
        missing = []
        changed = []
        for p in rows:
            hits = match_project(p)
            if not hits:
                missing.append(p)
                continue
            hit = hits[0]
            matched.append((p, hit))
            if p["mw"] and hit["mw"] and abs(p["mw"] - hit["mw"]) > 0.2:
                changed.append((p, hit))
        sections.append((group, rows, matched, missing, changed))

    final_hits = []
    for p in minuta["selected_final"]:
        hits = match_project(p)
        if hits:
            final_hits.append(hits[0])
    final_folios = {r["folio"] for r in final_hits if r["folio"] and r["folio"] != "SIN INFORMACIÓN"}
    voted_final = [latest[f] for f in final_folios if f in latest]
    not_voted_final = [r for r in final_hits if r.get("folio") not in latest]

    lines = []
    lines.append("# Revision contra minuta del 17 de junio de 2026")
    lines.append("")
    lines.append("Fuente HTML: `MINUTAS-SEGUNDA-CONVOCATORIA-PARTICULARES.html`.")
    lines.append(f"Fuente Sheet: `{CSV_PATH.name}`.")
    lines.append(f"Fuente historial minuta: `{MINUTAS_PATH.name}`.")
    lines.append("")
    lines.append("## Resumen")
    lines.append(f"- Registros en Sheet origen: {len(sheet)}.")
    lines.append(f"- Filas de historial en WebApp Minutas: {len(history)}.")
    lines.append(f"- Estatus vigentes por folio en historial: {len(latest)}.")
    lines.append(f"- Proyectos finales en minuta A7: {len(minuta['selected_final'])}.")
    lines.append(f"- Proyectos finales encontrados en Sheet: {len(final_hits)}.")
    lines.append(f"- Proyectos finales con voto/historial vigente: {len(voted_final)}.")
    lines.append(f"- Proyectos finales sin voto/historial vigente: {len(not_voted_final)}.")
    lines.append("")

    for group, rows, matched, missing, changed in sections:
        lines.append(f"## {group}")
        lines.append(f"- Minuta: {len(rows)} proyectos.")
        lines.append(f"- Encontrados por nombre en Sheet: {len(matched)}.")
        lines.append(f"- No encontrados por nombre exacto normalizado: {len(missing)}.")
        lines.append(f"- Diferencias de MW contra Sheet: {len(changed)}.")
        if missing:
            lines.append("")
            lines.append("| Proyecto minuta | MW minuta | GCR minuta |")
            lines.append("|---|---:|---|")
            for p in missing:
                lines.append(f"| {p['name']} | {p['mw']:g} | {p.get('gcr') or ''} |")
        if changed:
            lines.append("")
            lines.append("| Proyecto | MW minuta | MW Sheet | Folio | Fila Sheet |")
            lines.append("|---|---:|---:|---|---:|")
            for p, s in changed:
                lines.append(f"| {p['name']} | {p['mw']:g} | {s['mw']:g} | {s['folio']} | {s['row']} |")
        lines.append("")

    lines.append("## A7 final: detalle contra historial")
    lines.append("")
    lines.append("| Proyecto | Folio | MW Sheet | GCR Sheet | Decision vigente | Reunion | Timestamp |")
    lines.append("|---|---|---:|---|---|---|---|")
    for s in sorted(final_hits, key=lambda x: (norm(x["gcr"]), norm(x["name"]))):
        h = latest.get(s["folio"], {})
        lines.append(
            f"| {s['name']} | {s['folio']} | {s['mw']:g} | {s['gcr']} | "
            f"{h.get('decision','SIN HISTORIAL')} | {h.get('reunion_nombre','')} | {h.get('timestamp','')} |"
        )

    lines.append("")
    lines.append("## Proyectos finales sin historial vigente")
    lines.append("")
    if not_voted_final:
        lines.append("| Proyecto | Folio | MW | GCR | Fila Sheet |")
        lines.append("|---|---|---:|---|---:|")
        for s in sorted(not_voted_final, key=lambda x: norm(x["name"])):
            lines.append(f"| {s['name']} | {s['folio']} | {s['mw']:g} | {s['gcr']} | {s['row']} |")
    else:
        lines.append("Sin faltantes de historial para los proyectos A7 encontrados.")

    lines.append("")
    lines.append("## Proyectos con historial vigente que no estan en A7 final")
    lines.append("")
    extra = []
    final_folios = {s["folio"] for s in final_hits if s["folio"]}
    for f, h in latest.items():
        if f not in final_folios:
            s = by_folio.get(f, {})
            extra.append((h, s))
    if extra:
        lines.append("| Folio | Proyecto historial | Decision vigente | Proyecto Sheet | GCR Sheet | Timestamp |")
        lines.append("|---|---|---|---|---|---|")
        for h, s in sorted(extra, key=lambda x: norm(x[0].get("proyecto") or x[1].get("name"))):
            lines.append(
                f"| {h.get('folio','')} | {h.get('proyecto','')} | {h.get('decision','')} | "
                f"{s.get('name','NO EN SHEET')} | {s.get('gcr','')} | {h.get('timestamp','')} |"
            )
    else:
        lines.append("No hay votos vigentes fuera de A7 final.")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(OUT)


if __name__ == "__main__":
    main()
