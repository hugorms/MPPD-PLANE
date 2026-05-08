# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import re

from django.db.models import CharField, Func, Value
from django.db.models.functions import Cast, Coalesce, Concat


SOCIAL_CASE_SEARCH_DIGITS_ALIAS = "_social_case_search_digits"


def build_digit_fuzzy_regex(value):
    digits = "".join(re.findall(r"\d", value))
    if len(digits) < 3:
        return None
    return "[^0-9]*".join(re.escape(digit) for digit in digits)


def build_social_digit_terms(query):
    digits = "".join(re.findall(r"\d", query or ""))
    return [digits] if len(digits) >= 6 else []


def build_sequence_terms(query):
    sequences = re.findall(r"\b\d+\b", query or "")
    digits = "".join(re.findall(r"\d", query or ""))
    cedula_hint = re.search(r"\b(c\.?i\.?|cedula|cédula|[ve]\s*[-.]?\s*\d)", query or "", re.IGNORECASE)
    if len(digits) >= 6 and (cedula_hint or sequences != [digits]):
        return []
    return sequences


def annotate_social_case_search_digits(queryset):
    searchable_text = Concat(
        Coalesce("social_case_cedula", Value(""), output_field=CharField()),
        Value(" "),
        Coalesce("social_case_nombre", Value(""), output_field=CharField()),
        Value(" "),
        Coalesce("description_stripped", Value(""), output_field=CharField()),
        Value(" "),
        Coalesce("description_html", Value(""), output_field=CharField()),
        Value(" "),
        Coalesce(Cast("description_json", output_field=CharField()), Value(""), output_field=CharField()),
        output_field=CharField(),
    )
    return queryset.annotate(
        **{
            SOCIAL_CASE_SEARCH_DIGITS_ALIAS: Func(
                searchable_text,
                Value("[^0-9]"),
                Value(""),
                Value("g"),
                function="REGEXP_REPLACE",
                output_field=CharField(),
            )
        }
    )
