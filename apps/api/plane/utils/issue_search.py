# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import re

# Django imports
from django.db.models import Q

# Module imports


def build_digit_fuzzy_regex(value):
    digits = "".join(re.findall(r"\d", value))
    if len(digits) < 3:
        return None
    return r"\D*".join(re.escape(digit) for digit in digits)


def search_issues(query, queryset):
    fields = ["name", "sequence_id", "project__identifier"]
    social_fields = ["social_case_cedula", "social_case_nombre"]
    sequences = re.findall(r"\b\d+\b", query)
    q = Q()

    for field in fields:
        if field == "sequence_id" and len(query) <= 20:
            for sequence_id in sequences:
                q |= Q(**{"sequence_id": sequence_id})
        else:
            q |= Q(**{f"{field}__icontains": query})

    for field in social_fields:
        q |= Q(**{f"{field}__icontains": query})
        for sequence_id in sequences:
            q |= Q(**{f"{field}__icontains": sequence_id})
            digit_pattern = build_digit_fuzzy_regex(sequence_id)
            if digit_pattern:
                q |= Q(**{f"{field}__iregex": digit_pattern})

    return queryset.filter(q).distinct()
