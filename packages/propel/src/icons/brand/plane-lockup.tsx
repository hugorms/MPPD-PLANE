/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

export function PlaneLockup({ width = "253", height = "53", className }: ISvgIcons) {
  return (
    <img
      src="/logo-mppd.png"
      width={width}
      height={height}
      className={className}
      alt="MPPD Logo"
      style={{ objectFit: "contain" }}
    />
  );
}
