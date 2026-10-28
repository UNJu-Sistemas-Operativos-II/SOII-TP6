#!/usr/bin/env python3
"""
=============================================================================
EVALUADOR AUTOMÁTICO DE TRABAJOS PRÁCTICOS - SISTEMAS OPERATIVOS II
Universidad Nacional de Jujuy (UNJu - Facultad de Ingeniería)
Ciclo Lectivo 2026 | Titular: Ing. María Fernanda Vázquez | JTP: Ing. Fabio D. Argañaraz
=============================================================================
Módulo de Evaluación del Trabajo Práctico N° 6 (Sistema de Archivos Distribuido - DFS)
"""

import sys
import os
import json
import hashlib
import argparse
from datetime import datetime

# Asegurar compatibilidad UTF-8 en consolas Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RUBRIC_FILE = os.path.join(SCRIPT_DIR, "rubric_tp06.json")
CATEDRA_SALT = "SOII_UNJu_FI_2026_CatedraVazquez_SecretSalt"

def compute_hash(ex_id, item_key, val):
    clean_val = str(val).strip().lower() if val is not None else ""
    raw = f"{ex_id}:{item_key}:{clean_val}:{CATEDRA_SALT}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"[ERROR] No se encontró el archivo: {filepath}", file=sys.stderr)
        sys.exit(1)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] Error al leer JSON '{filepath}': {e}", file=sys.stderr)
        sys.exit(1)

def grade_submission(submission, rubric):
    student = submission.get("estudiante", {})
    exercises_rubric = rubric.get("exercises", {})
    
    total_score = 0
    max_total_score = rubric.get("max_score", 100)
    exercise_results = {}

    for ex_id, ex_spec in exercises_rubric.items():
        weight = ex_spec.get("weight", 20)
        feedback = ex_spec.get("feedback", "")
        ex_score = 0
        details = []

        student_data = submission.get(ex_id, {})

        if "hashes" in ex_spec:
            expected_hashes = ex_spec["hashes"]

            if ex_spec.get("type") == "ordered_list":
                items_list = expected_hashes.get("items", [])
                total_items = len(items_list)
                correct_items_count = 0
                list_key = ex_spec.get("list_key", "orden_ciclo_rpc")
                actual_list = student_data.get(list_key, [])
                for idx, exp_hash in enumerate(items_list):
                    actual_val = actual_list[idx] if idx < len(actual_list) else None
                    actual_hash = compute_hash(ex_id, f"pos_{idx}", actual_val)
                    is_correct = (actual_hash == exp_hash)
                    if is_correct:
                        correct_items_count += 1
                    details.append({
                        "item": f"Etapa {idx + 1}",
                        "submitted": actual_val,
                        "is_correct": is_correct
                    })
                if total_items > 0:
                    ex_score = round((correct_items_count / total_items) * weight, 2)
            else:
                total_items = len(expected_hashes)
                correct_items_count = 0
                for item_key, exp_hash in expected_hashes.items():
                    actual_val = student_data.get(item_key)
                    actual_hash = compute_hash(ex_id, item_key, actual_val)
                    is_correct = (actual_hash == exp_hash)
                    if is_correct:
                        correct_items_count += 1
                    details.append({
                        "item": item_key,
                        "submitted": actual_val,
                        "is_correct": is_correct
                    })
                if total_items > 0:
                    ex_score = round((correct_items_count / total_items) * weight, 2)

        total_score += ex_score
        exercise_results[ex_id] = {
            "title": ex_spec.get("title", ex_id),
            "score": ex_score,
            "weight": weight,
            "passed": (ex_score == weight),
            "feedback": feedback,
            "details": details
        }

    return {
        "student": student,
        "total_score": round(total_score, 2),
        "max_score": max_total_score,
        "percentage": round((total_score / max_total_score) * 100, 2),
        "exercise_results": exercise_results
    }

def print_text_report(results):
    student = results["student"]
    print("=" * 72)
    print("  UNJu — FACULTAD DE INGENIERÍA — SISTEMAS OPERATIVOS II (2026)")
    print("      EVALUACIÓN AUTOMÁTICA DEL MÓDULO WEB — TRABAJO PRÁCTICO 6")
    print("=" * 72)
    print(f" Estudiante : {student.get('nombre', 'Desconocido')}")
    print(f" Legajo     : {student.get('legajo', 'S/D')}")
    print(f" GitHub     : {student.get('github', 'S/D')}")
    print(f" Fecha      : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 72)

    for ex_id, data in results["exercise_results"].items():
        status = "✓ [APROBADO]" if data["passed"] else "✗ [REVISAR]"
        print(f"\n{status} {data['title']}: {data['score']} / {data['weight']} Pts")
        for d in data["details"]:
            mark = "  ✓" if d["is_correct"] else "  ✗"
            print(f"    {mark} {d['item']}: {d['submitted'] if d['submitted'] is not None else '<VACÍO>'}")
        if not data["passed"] and data["feedback"]:
            print(f"    💡 Bibliografía recomendada: {data['feedback']}")

    print("\n" + "=" * 72)
    p = results["percentage"]
    print(f" CALIFICACIÓN FINAL DEL MÓDULO WEB: {results['total_score']} / {results['max_score']} Pts ({p}%)")
    if results['total_score'] == results['max_score']:
        print(" ESTADO: ¡FELICITACIONES! Módulo interactivo validado al 100% ✅")
    else:
        print(" ESTADO: Entrega incompleta o con respuestas erróneas ⚠️")
    print("=" * 72)

def append_to_github_summary(results):
    summary_path = os.environ.get('GITHUB_STEP_SUMMARY')
    if not summary_path:
        return
    student = results["student"]
    try:
        with open(summary_path, 'a', encoding='utf-8') as f:
            f.write("# 📊 Reporte de Autograding — Módulo Web TP 6\n\n")
            f.write(f"- **Estudiante:** {student.get('nombre', 'N/D')}\n")
            f.write(f"- **Legajo:** {student.get('legajo', 'N/D')}\n")
            f.write(f"- **Calificación:** `{results['total_score']} / {results['max_score']}` ({results['percentage']}%)\n\n")
            f.write("| Sección Evaluada | Puntaje | Estado |\n")
            f.write("| :--- | :---: | :---: |\n")
            for ex_id, d in results["exercise_results"].items():
                st = "✅ Aprobado" if d["passed"] else "❌ Incompleto"
                f.write(f"| {d['title']} | {d['score']}/{d['weight']} | {st} |\n")
            f.write("\n")
    except Exception as e:
        print(f"[WARN] No se pudo escribir en GITHUB_STEP_SUMMARY: {e}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description="Evaluador Automático Criptográfico de TP 6")
    parser.add_argument("submission", help="Ruta al archivo respuestas_tp06.json")
    parser.add_argument("--rubric", default=RUBRIC_FILE, help="Ruta a rubric_tp06.json")
    parser.add_argument("--json", action="store_true", help="Salida en formato JSON crudo")
    args = parser.parse_args()

    submission = load_json(args.submission)
    rubric = load_json(args.rubric)

    student = submission.get("estudiante")
    required_student_fields = ("nombre", "legajo", "github")
    if not isinstance(student, dict) or any(
        not str(student.get(field, "")).strip() for field in required_student_fields
    ):
        print(
            "[ERROR] El archivo debe incluir nombre, legajo y usuario de GitHub del estudiante.",
            file=sys.stderr,
        )
        sys.exit(1)

    results = grade_submission(submission, rubric)

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print_text_report(results)

    append_to_github_summary(results)

    if results["total_score"] == results["max_score"]:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
