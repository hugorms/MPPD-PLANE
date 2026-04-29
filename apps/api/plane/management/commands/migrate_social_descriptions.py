"""
Migra el contenido de la descripción nativa de Plane al campo 'referencia'
de los casos sociales, para todos los issues que lo tengan pendiente.

- Lee el JSON del <caption> de la tabla social
- Extrae el texto de la descripción nativa (fuera de la tabla)
- Si 'referencia' está vacío y hay texto → lo inyecta y guarda
- Idempotente: no toca casos donde 'referencia' ya tiene contenido

Usage:
    python manage.py migrate_social_descriptions
    python manage.py migrate_social_descriptions --dry-run
"""

import json
import re
from html.parser import HTMLParser

from django.core.management.base import BaseCommand

from plane.db.models.issue import Issue

# Regex para extraer y eliminar la tabla del caso social
_TABLE_RE = re.compile(r'<table[^>]*data-social-case="1"[^>]*>[\s\S]*?</table>', re.IGNORECASE)
# Regex para eliminar la foto de perfil
_PHOTO_RE = re.compile(r'<img[^>]*data-profile-photo="1"[^>]*/?>',  re.IGNORECASE)
# Regex para detectar JSON de Prosemirror en texto plano
_JSON_RE = re.compile(r'^\s*\{.*"type"\s*:', re.DOTALL)


class _TextExtractor(HTMLParser):
    """Extrae texto plano del HTML, ignorando bloques de JSON de Prosemirror."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._current: list[str] = []
        self._depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("p", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6"):
            self._depth += 1
            self._current = []

    def handle_endtag(self, tag):
        if tag in ("p", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6"):
            self._depth -= 1
            text = "".join(self._current).strip()
            self._current = []
            if text and not _JSON_RE.match(text):
                self.parts.append(text)

    def handle_data(self, data):
        self._current.append(data)

    @property
    def text(self):
        return " ".join(p for p in self.parts if p)


def _extract_native_text(description_html: str) -> str:
    """Elimina la tabla social y la foto, devuelve el texto plano restante."""
    stripped = _TABLE_RE.sub("", description_html or "")
    stripped = _PHOTO_RE.sub("", stripped)
    parser = _TextExtractor()
    parser.feed(stripped)
    return parser.text.strip()


def _get_caption_json(description_html: str) -> dict | None:
    """Extrae el JSON del <caption> de la tabla social."""
    caption_match = re.search(
        r'<caption[^>]*>([\s\S]*?)</caption>', description_html or "", re.IGNORECASE
    )
    if not caption_match:
        return None
    try:
        return json.loads(caption_match.group(1))
    except Exception:
        return None


def _update_caption_json(description_html: str, new_data: dict) -> str:
    """Reemplaza el JSON del <caption> con los datos actualizados."""
    new_json = json.dumps(new_data, ensure_ascii=False)
    return re.sub(
        r'(<caption[^>]*>)([\s\S]*?)(</caption>)',
        lambda m: f"{m.group(1)}{new_json}{m.group(3)}",
        description_html,
        count=1,
        flags=re.IGNORECASE,
    )


class Command(BaseCommand):
    help = "Migra descripción nativa de Plane → campo referencia del formulario social."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Muestra qué se actualizaría sin hacer cambios.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        qs = Issue.all_objects.filter(
            description_html__contains='data-social-case="1"'
        ).exclude(description_html="")

        total = qs.count()
        self.stdout.write(f"Analizando {total} casos sociales...")

        migrated = 0
        skipped = 0

        for issue in qs.iterator(chunk_size=200):
            data = _get_caption_json(issue.description_html)
            if not data:
                skipped += 1
                continue

            # Solo migrar si referencia está vacío
            if data.get("referencia", "").strip():
                skipped += 1
                continue

            native_text = _extract_native_text(issue.description_html)
            if not native_text:
                skipped += 1
                continue

            # Inyectar el texto en referencia
            data["referencia"] = native_text
            new_html = _update_caption_json(issue.description_html, data)

            if dry_run:
                self.stdout.write(
                    f"  [dry-run] Issue {issue.sequence_id}: referencia ← '{native_text[:80]}...'"
                    if len(native_text) > 80
                    else f"  [dry-run] Issue {issue.sequence_id}: referencia ← '{native_text}'"
                )
            else:
                Issue.all_objects.filter(pk=issue.pk).update(description_html=new_html)

            migrated += 1

        verb = "Migraría" if dry_run else "Migrados"
        self.stdout.write(
            self.style.SUCCESS(
                f"{verb} {migrated} casos · {skipped} omitidos (ya tienen referencia o sin texto)."
            )
        )
