# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import re

# Django imports
from django.db.models import Q

# Module imports
from plane.utils.social_case_search import (
    SOCIAL_CASE_SEARCH_DIGITS_ALIAS,
    annotate_social_case_search_digits,
)


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


def search_issues(query, queryset):
    fields = ["name", "sequence_id", "project__identifier"]
    social_fields = ["social_case_cedula", "social_case_nombre"]
    content_fields = ["description_stripped", "description_html"]
    sequence_terms = build_sequence_terms(query)
    social_digit_terms = build_social_digit_terms(query)
    q = Q()

    for field in fields:
        if field == "sequence_id" and len(query) <= 20:
            for sequence_id in sequence_terms:
                q |= Q(**{"sequence_id": sequence_id})
        else:
            q |= Q(**{f"{field}__icontains": query})

    for field in social_fields:
        q |= Q(**{f"{field}__icontains": query})
        for term in social_digit_terms:
            q |= Q(**{f"{field}__icontains": term})
            digit_pattern = build_digit_fuzzy_regex(term)
            if digit_pattern:
                q |= Q(**{f"{field}__iregex": digit_pattern})

    for field in content_fields:
        q |= Q(**{f"{field}__icontains": query})
        for term in social_digit_terms:
            q |= Q(**{f"{field}__icontains": term})
            digit_pattern = build_digit_fuzzy_regex(term)
            if digit_pattern:
                q |= Q(**{f"{field}__iregex": digit_pattern})

    for term in social_digit_terms:
        q |= Q(**{f"{SOCIAL_CASE_SEARCH_DIGITS_ALIAS}__icontains": term})
    if social_digit_terms:
        queryset = annotate_social_case_search_digits(queryset)

    return queryset.filter(q).distinct()
