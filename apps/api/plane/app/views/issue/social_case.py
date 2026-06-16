# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# rebuild

# Django imports
from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import F, Func, OuterRef, Q, Subquery
from django.db.models.functions import Coalesce

# Third Party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import (
    CycleIssue,
    FileAsset,
    Issue,
    IssueAssignee,
    IssueLabel,
    IssueLink,
)
from plane.utils.timezone_converter import user_timezone_converter

from .. import BaseAPIView


class SocialCaseReportEndpoint(BaseAPIView):
    """
    Devuelve todos los issues de un proyecto que contienen una ficha
    de caso social (data-social-case="1" en description_html), incluyendo
    el campo description_html completo para que el frontend pueda parsearlos.
    """

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def get(self, request, slug, project_id):
        # Soporta múltiples estados: ?estados=Carabobo,Miranda,Lara
        estados_raw = request.query_params.get("estados", "").strip()
        estados = [e.strip() for e in estados_raw.split(",") if e.strip()] if estados_raw else []
        condiciones_raw = request.query_params.get("condiciones", "").strip()
        condiciones = (
            [c.strip().lower() for c in condiciones_raw.split(",") if c.strip()]
            if condiciones_raw
            else []
        )

        componentes_raw = request.query_params.get("componentes", "").strip()
        componentes = [c.strip() for c in componentes_raw.split(",") if c.strip()] if componentes_raw else []
        grados_raw = request.query_params.get("grados", "").strip()
        grados = [g.strip() for g in grados_raw.split(",") if g.strip()] if grados_raw else []

        base_filters = {
            "workspace__slug": slug,
            "project_id": project_id,
            "description_html__contains": 'data-social-case="1"',
        }

        queryset = Issue.issue_objects.filter(**base_filters)

        if estados:
            # OR entre todos los estados seleccionados
            estado_q = Q()
            for e in estados:
                estado_q |= Q(description_html__icontains=f'>{e}<')
            queryset = queryset.filter(estado_q)

        if componentes:
            # OR entre componentes — nombres únicos, búsqueda por texto plano
            comp_q = Q()
            for c in componentes:
                comp_q |= (
                    Q(description_html__icontains=f'"jornada":"{c}"')
                    | Q(description_html__icontains=f'"jornada": "{c}"')
                    | Q(description_html__icontains=f'>{c}<')
                )
            queryset = queryset.filter(comp_q)

        if grados:
            # OR entre grados — búsqueda por JSON caption para evitar coincidencias parciales
            grado_q = Q()
            for g in grados:
                grado_q |= (
                    Q(description_html__icontains=f'"gradoMilitar":"{g}"')
                    | Q(description_html__icontains=f'"gradoMilitar": "{g}"')
                )
            queryset = queryset.filter(grado_q)

        if len(condiciones) == 1:
            military_q = (
                Q(description_html__icontains='"esMilitar":"true"')
                | Q(
                    description_html__iregex=(
                        r'data-key="esMilitar"[^<]*</td>\s*'
                        r'<td[^>]*>\s*true\s*</td>'
                    )
                )
                | Q(
                    description_html__iregex=(
                        r'data-key="(condicionMilitar|gradoMilitar)"[^<]*</td>\s*'
                        r'<td[^>]*>\s*[^<\s-][^<]*</td>'
                    )
                )
                | Q(description_html__icontains="Ejército Nacional Bolivariano")
                | Q(description_html__icontains="Armada Bolivariana de Venezuela")
                | Q(description_html__icontains="Aviación Militar Bolivariana")
                | Q(description_html__icontains="Guardia Nacional Bolivariana")
                | Q(description_html__icontains="Milicia Nacional Bolivariana")
            )
            if condiciones[0] == "militar":
                queryset = queryset.filter(military_q)
            elif condiciones[0] == "civil":
                queryset = queryset.exclude(military_q)

        queryset = (
            queryset
            .annotate(
                assignee_ids=Coalesce(
                    ArrayAgg(
                        "issue_assignee__assignee_id",
                        filter=Q(issue_assignee__assignee_id__isnull=False),
                        distinct=True,
                    ),
                    [],
                ),
                label_ids=Coalesce(
                    ArrayAgg(
                        "label_issue__label_id",
                        filter=Q(label_issue__label_id__isnull=False),
                        distinct=True,
                    ),
                    [],
                ),
                label_names=Coalesce(
                    ArrayAgg(
                        "label_issue__label__name",
                        filter=Q(label_issue__label__name__isnull=False),
                        distinct=True,
                    ),
                    [],
                ),
            )
            .order_by("-created_at")
            .values(
                "id",
                "sequence_id",
                "name",
                "description_html",
                "state_id",
                "priority",
                "assignee_ids",
                "label_ids",
                "label_names",
                "project_id",
                "created_by_id",
                "created_at",
                "updated_at",
                "start_date",
                "is_draft",
                "archived_at",
            )
        )

        datetime_fields = ["created_at", "updated_at"]
        issues = user_timezone_converter(
            queryset, datetime_fields, request.user.user_timezone
        )

        return Response(list(issues), status=status.HTTP_200_OK)
