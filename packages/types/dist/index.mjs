//#region src/analytics.ts
let ChartXAxisProperty = /* @__PURE__ */ function(ChartXAxisProperty$1) {
	ChartXAxisProperty$1["STATES"] = "STATES";
	ChartXAxisProperty$1["STATE_GROUPS"] = "STATE_GROUPS";
	ChartXAxisProperty$1["LABELS"] = "LABELS";
	ChartXAxisProperty$1["ASSIGNEES"] = "ASSIGNEES";
	ChartXAxisProperty$1["ESTIMATE_POINTS"] = "ESTIMATE_POINTS";
	ChartXAxisProperty$1["CYCLES"] = "CYCLES";
	ChartXAxisProperty$1["MODULES"] = "MODULES";
	ChartXAxisProperty$1["PRIORITY"] = "PRIORITY";
	ChartXAxisProperty$1["START_DATE"] = "START_DATE";
	ChartXAxisProperty$1["TARGET_DATE"] = "TARGET_DATE";
	ChartXAxisProperty$1["CREATED_AT"] = "CREATED_AT";
	ChartXAxisProperty$1["COMPLETED_AT"] = "COMPLETED_AT";
	ChartXAxisProperty$1["CREATED_BY"] = "CREATED_BY";
	ChartXAxisProperty$1["WORK_ITEM_TYPES"] = "WORK_ITEM_TYPES";
	ChartXAxisProperty$1["PROJECTS"] = "PROJECTS";
	ChartXAxisProperty$1["EPICS"] = "EPICS";
	return ChartXAxisProperty$1;
}({});
let ChartYAxisMetric = /* @__PURE__ */ function(ChartYAxisMetric$1) {
	ChartYAxisMetric$1["WORK_ITEM_COUNT"] = "WORK_ITEM_COUNT";
	ChartYAxisMetric$1["ESTIMATE_POINT_COUNT"] = "ESTIMATE_POINT_COUNT";
	ChartYAxisMetric$1["PENDING_WORK_ITEM_COUNT"] = "PENDING_WORK_ITEM_COUNT";
	ChartYAxisMetric$1["COMPLETED_WORK_ITEM_COUNT"] = "COMPLETED_WORK_ITEM_COUNT";
	ChartYAxisMetric$1["IN_PROGRESS_WORK_ITEM_COUNT"] = "IN_PROGRESS_WORK_ITEM_COUNT";
	ChartYAxisMetric$1["WORK_ITEM_DUE_THIS_WEEK_COUNT"] = "WORK_ITEM_DUE_THIS_WEEK_COUNT";
	ChartYAxisMetric$1["WORK_ITEM_DUE_TODAY_COUNT"] = "WORK_ITEM_DUE_TODAY_COUNT";
	ChartYAxisMetric$1["BLOCKED_WORK_ITEM_COUNT"] = "BLOCKED_WORK_ITEM_COUNT";
	ChartYAxisMetric$1["EPIC_WORK_ITEM_COUNT"] = "EPIC_WORK_ITEM_COUNT";
	return ChartYAxisMetric$1;
}({});

//#endregion
//#region src/enums.ts
/**
* Copyright (c) 2023-present Plane Software, Inc. and contributors
* SPDX-License-Identifier: AGPL-3.0-only
* See the LICENSE file for details.
*/
let EUserPermissions = /* @__PURE__ */ function(EUserPermissions$1) {
	EUserPermissions$1[EUserPermissions$1["ADMIN"] = 20] = "ADMIN";
	EUserPermissions$1[EUserPermissions$1["MEMBER"] = 15] = "MEMBER";
	EUserPermissions$1[EUserPermissions$1["GUEST"] = 5] = "GUEST";
	return EUserPermissions$1;
}({});
let EProjectNetwork = /* @__PURE__ */ function(EProjectNetwork$1) {
	EProjectNetwork$1[EProjectNetwork$1["PRIVATE"] = 0] = "PRIVATE";
	EProjectNetwork$1[EProjectNetwork$1["PUBLIC"] = 2] = "PUBLIC";
	return EProjectNetwork$1;
}({});
let EPageAccess = /* @__PURE__ */ function(EPageAccess$1) {
	EPageAccess$1[EPageAccess$1["PUBLIC"] = 0] = "PUBLIC";
	EPageAccess$1[EPageAccess$1["PRIVATE"] = 1] = "PRIVATE";
	return EPageAccess$1;
}({});
let EDurationFilters = /* @__PURE__ */ function(EDurationFilters$1) {
	EDurationFilters$1["NONE"] = "none";
	EDurationFilters$1["TODAY"] = "today";
	EDurationFilters$1["THIS_WEEK"] = "this_week";
	EDurationFilters$1["THIS_MONTH"] = "this_month";
	EDurationFilters$1["THIS_YEAR"] = "this_year";
	EDurationFilters$1["CUSTOM"] = "custom";
	return EDurationFilters$1;
}({});
let EIssueCommentAccessSpecifier = /* @__PURE__ */ function(EIssueCommentAccessSpecifier$1) {
	EIssueCommentAccessSpecifier$1["EXTERNAL"] = "EXTERNAL";
	EIssueCommentAccessSpecifier$1["INTERNAL"] = "INTERNAL";
	return EIssueCommentAccessSpecifier$1;
}({});
let EEstimateSystem = /* @__PURE__ */ function(EEstimateSystem$1) {
	EEstimateSystem$1["POINTS"] = "points";
	EEstimateSystem$1["CATEGORIES"] = "categories";
	EEstimateSystem$1["TIME"] = "time";
	return EEstimateSystem$1;
}({});
let EEstimateUpdateStages = /* @__PURE__ */ function(EEstimateUpdateStages$1) {
	EEstimateUpdateStages$1["CREATE"] = "create";
	EEstimateUpdateStages$1["EDIT"] = "edit";
	EEstimateUpdateStages$1["SWITCH"] = "switch";
	return EEstimateUpdateStages$1;
}({});
let ENotificationFilterType = /* @__PURE__ */ function(ENotificationFilterType$1) {
	ENotificationFilterType$1["CREATED"] = "created";
	ENotificationFilterType$1["ASSIGNED"] = "assigned";
	ENotificationFilterType$1["SUBSCRIBED"] = "subscribed";
	return ENotificationFilterType$1;
}({});
let EFileAssetType = /* @__PURE__ */ function(EFileAssetType$1) {
	EFileAssetType$1["COMMENT_DESCRIPTION"] = "COMMENT_DESCRIPTION";
	EFileAssetType$1["ISSUE_ATTACHMENT"] = "ISSUE_ATTACHMENT";
	EFileAssetType$1["ISSUE_DESCRIPTION"] = "ISSUE_DESCRIPTION";
	EFileAssetType$1["DRAFT_ISSUE_DESCRIPTION"] = "DRAFT_ISSUE_DESCRIPTION";
	EFileAssetType$1["PAGE_DESCRIPTION"] = "PAGE_DESCRIPTION";
	EFileAssetType$1["PROJECT_COVER"] = "PROJECT_COVER";
	EFileAssetType$1["USER_AVATAR"] = "USER_AVATAR";
	EFileAssetType$1["USER_COVER"] = "USER_COVER";
	EFileAssetType$1["WORKSPACE_LOGO"] = "WORKSPACE_LOGO";
	EFileAssetType$1["TEAM_SPACE_DESCRIPTION"] = "TEAM_SPACE_DESCRIPTION";
	EFileAssetType$1["INITIATIVE_DESCRIPTION"] = "INITIATIVE_DESCRIPTION";
	EFileAssetType$1["PROJECT_DESCRIPTION"] = "PROJECT_DESCRIPTION";
	EFileAssetType$1["TEAM_SPACE_COMMENT_DESCRIPTION"] = "TEAM_SPACE_COMMENT_DESCRIPTION";
	return EFileAssetType$1;
}({});
let EUpdateStatus = /* @__PURE__ */ function(EUpdateStatus$1) {
	EUpdateStatus$1["OFF_TRACK"] = "OFF-TRACK";
	EUpdateStatus$1["ON_TRACK"] = "ON-TRACK";
	EUpdateStatus$1["AT_RISK"] = "AT-RISK";
	return EUpdateStatus$1;
}({});

//#endregion
//#region src/inbox.ts
let EInboxIssueCurrentTab = /* @__PURE__ */ function(EInboxIssueCurrentTab$1) {
	EInboxIssueCurrentTab$1["OPEN"] = "open";
	EInboxIssueCurrentTab$1["CLOSED"] = "closed";
	return EInboxIssueCurrentTab$1;
}({});
let EInboxIssueStatus = /* @__PURE__ */ function(EInboxIssueStatus$1) {
	EInboxIssueStatus$1[EInboxIssueStatus$1["PENDING"] = -2] = "PENDING";
	EInboxIssueStatus$1[EInboxIssueStatus$1["DECLINED"] = -1] = "DECLINED";
	EInboxIssueStatus$1[EInboxIssueStatus$1["SNOOZED"] = 0] = "SNOOZED";
	EInboxIssueStatus$1[EInboxIssueStatus$1["ACCEPTED"] = 1] = "ACCEPTED";
	EInboxIssueStatus$1[EInboxIssueStatus$1["DUPLICATE"] = 2] = "DUPLICATE";
	return EInboxIssueStatus$1;
}({});
let EInboxIssueSource = /* @__PURE__ */ function(EInboxIssueSource$1) {
	EInboxIssueSource$1["IN_APP"] = "IN_APP";
	EInboxIssueSource$1["FORMS"] = "FORMS";
	EInboxIssueSource$1["EMAIL"] = "EMAIL";
	return EInboxIssueSource$1;
}({});

//#endregion
//#region src/issues/issue.ts
let EIssueLayoutTypes = /* @__PURE__ */ function(EIssueLayoutTypes$1) {
	EIssueLayoutTypes$1["LIST"] = "list";
	EIssueLayoutTypes$1["KANBAN"] = "kanban";
	EIssueLayoutTypes$1["CALENDAR"] = "calendar";
	EIssueLayoutTypes$1["GANTT"] = "gantt_chart";
	EIssueLayoutTypes$1["SPREADSHEET"] = "spreadsheet";
	return EIssueLayoutTypes$1;
}({});
let EIssueServiceType = /* @__PURE__ */ function(EIssueServiceType$1) {
	EIssueServiceType$1["ISSUES"] = "issues";
	EIssueServiceType$1["EPICS"] = "epics";
	EIssueServiceType$1["WORK_ITEMS"] = "work-items";
	return EIssueServiceType$1;
}({});
let EIssuesStoreType = /* @__PURE__ */ function(EIssuesStoreType$1) {
	EIssuesStoreType$1["GLOBAL"] = "GLOBAL";
	EIssuesStoreType$1["PROFILE"] = "PROFILE";
	EIssuesStoreType$1["TEAM"] = "TEAM";
	EIssuesStoreType$1["PROJECT"] = "PROJECT";
	EIssuesStoreType$1["CYCLE"] = "CYCLE";
	EIssuesStoreType$1["MODULE"] = "MODULE";
	EIssuesStoreType$1["TEAM_VIEW"] = "TEAM_VIEW";
	EIssuesStoreType$1["PROJECT_VIEW"] = "PROJECT_VIEW";
	EIssuesStoreType$1["ARCHIVED"] = "ARCHIVED";
	EIssuesStoreType$1["DEFAULT"] = "DEFAULT";
	EIssuesStoreType$1["WORKSPACE_DRAFT"] = "WORKSPACE_DRAFT";
	EIssuesStoreType$1["EPIC"] = "EPIC";
	EIssuesStoreType$1["TEAM_PROJECT_WORK_ITEMS"] = "TEAM_PROJECT_WORK_ITEMS";
	return EIssuesStoreType$1;
}({});

//#endregion
//#region src/layout/gantt.ts
/**
* Copyright (c) 2023-present Plane Software, Inc. and contributors
* SPDX-License-Identifier: AGPL-3.0-only
* See the LICENSE file for details.
*/
let EGanttBlockType = /* @__PURE__ */ function(EGanttBlockType$1) {
	EGanttBlockType$1["EPIC"] = "epic";
	EGanttBlockType$1["PROJECT"] = "project";
	EGanttBlockType$1["ISSUE"] = "issue";
	return EGanttBlockType$1;
}({});

//#endregion
//#region src/payment.ts
/**
* Copyright (c) 2023-present Plane Software, Inc. and contributors
* SPDX-License-Identifier: AGPL-3.0-only
* See the LICENSE file for details.
*/
let EProductSubscriptionEnum = /* @__PURE__ */ function(EProductSubscriptionEnum$1) {
	EProductSubscriptionEnum$1["FREE"] = "FREE";
	EProductSubscriptionEnum$1["ONE"] = "ONE";
	EProductSubscriptionEnum$1["PRO"] = "PRO";
	EProductSubscriptionEnum$1["BUSINESS"] = "BUSINESS";
	EProductSubscriptionEnum$1["ENTERPRISE"] = "ENTERPRISE";
	return EProductSubscriptionEnum$1;
}({});

//#endregion
//#region src/project/projects.ts
let EUserProjectRoles = /* @__PURE__ */ function(EUserProjectRoles$1) {
	EUserProjectRoles$1[EUserProjectRoles$1["ADMIN"] = 20] = "ADMIN";
	EUserProjectRoles$1[EUserProjectRoles$1["MEMBER"] = 15] = "MEMBER";
	EUserProjectRoles$1[EUserProjectRoles$1["GUEST"] = 5] = "GUEST";
	return EUserProjectRoles$1;
}({});

//#endregion
//#region src/rich-filters/expression.ts
/**
* Filter node types for building hierarchical filter trees.
* - CONDITION: Single filter for one field (e.g., "state is backlog")
* - GROUP: Logical container combining multiple filters with AND/OR or single filter/group with NOT
*/
const FILTER_NODE_TYPE = {
	CONDITION: "condition",
	GROUP: "group"
};

//#endregion
//#region src/rich-filters/operators/core.ts
/**
* Copyright (c) 2023-present Plane Software, Inc. and contributors
* SPDX-License-Identifier: AGPL-3.0-only
* See the LICENSE file for details.
*/
/**
* Core logical operators
*/
const CORE_LOGICAL_OPERATOR = { AND: "and" };
/**
* Core equality operators
*/
const CORE_EQUALITY_OPERATOR = { EXACT: "exact" };
/**
* Core collection operators
*/
const CORE_COLLECTION_OPERATOR = { IN: "in" };
/**
* Core comparison operators
*/
const CORE_COMPARISON_OPERATOR = { RANGE: "range" };
/**
* Core operators that support multiple values
*/
const CORE_MULTI_VALUE_OPERATORS = [CORE_COLLECTION_OPERATOR.IN, CORE_COMPARISON_OPERATOR.RANGE];
/**
* All core operators
*/
const CORE_OPERATORS = {
	...CORE_EQUALITY_OPERATOR,
	...CORE_COLLECTION_OPERATOR,
	...CORE_COMPARISON_OPERATOR
};

//#endregion
//#region src/rich-filters/operators/extended.ts
/**
* Copyright (c) 2023-present Plane Software, Inc. and contributors
* SPDX-License-Identifier: AGPL-3.0-only
* See the LICENSE file for details.
*/
/**
* Extended logical operators
*/
const EXTENDED_LOGICAL_OPERATOR = {};
/**
* Extended equality operators
*/
const EXTENDED_EQUALITY_OPERATOR = {};
/**
* Extended collection operators
*/
const EXTENDED_COLLECTION_OPERATOR = {};
/**
* Extended comparison operators
*/
const EXTENDED_COMPARISON_OPERATOR = {};
/**
* Extended operators that support multiple values
*/
const EXTENDED_MULTI_VALUE_OPERATORS = [];
/**
* All extended operators
*/
const EXTENDED_OPERATORS = {
	...EXTENDED_EQUALITY_OPERATOR,
	...EXTENDED_COLLECTION_OPERATOR,
	...EXTENDED_COMPARISON_OPERATOR
};

//#endregion
//#region src/rich-filters/operators/index.ts
const LOGICAL_OPERATOR = {
	...CORE_LOGICAL_OPERATOR,
	...EXTENDED_LOGICAL_OPERATOR
};
const EQUALITY_OPERATOR = {
	...CORE_EQUALITY_OPERATOR,
	...EXTENDED_EQUALITY_OPERATOR
};
const COLLECTION_OPERATOR = {
	...CORE_COLLECTION_OPERATOR,
	...EXTENDED_COLLECTION_OPERATOR
};
const COMPARISON_OPERATOR = {
	...CORE_COMPARISON_OPERATOR,
	...EXTENDED_COMPARISON_OPERATOR
};
const MULTI_VALUE_OPERATORS = [...CORE_MULTI_VALUE_OPERATORS, ...EXTENDED_MULTI_VALUE_OPERATORS];

//#endregion
//#region src/rich-filters/field-types/core.ts
/**
* Core filter types
*/
const CORE_FILTER_FIELD_TYPE = {
	DATE: "date",
	DATE_RANGE: "date_range",
	SINGLE_SELECT: "single_select",
	MULTI_SELECT: "multi_select"
};

//#endregion
//#region src/rich-filters/field-types/extended.ts
/**
* Extended filter types
*/
const EXTENDED_FILTER_FIELD_TYPE = {};

//#endregion
//#region src/rich-filters/field-types/index.ts
const FILTER_FIELD_TYPE = {
	...CORE_FILTER_FIELD_TYPE,
	...EXTENDED_FILTER_FIELD_TYPE
};

//#endregion
//#region src/users.ts
/**
* @description The start of the week for the user
* @enum {number}
*/
let EStartOfTheWeek = /* @__PURE__ */ function(EStartOfTheWeek$1) {
	EStartOfTheWeek$1[EStartOfTheWeek$1["SUNDAY"] = 0] = "SUNDAY";
	EStartOfTheWeek$1[EStartOfTheWeek$1["MONDAY"] = 1] = "MONDAY";
	EStartOfTheWeek$1[EStartOfTheWeek$1["TUESDAY"] = 2] = "TUESDAY";
	EStartOfTheWeek$1[EStartOfTheWeek$1["WEDNESDAY"] = 3] = "WEDNESDAY";
	EStartOfTheWeek$1[EStartOfTheWeek$1["THURSDAY"] = 4] = "THURSDAY";
	EStartOfTheWeek$1[EStartOfTheWeek$1["FRIDAY"] = 5] = "FRIDAY";
	EStartOfTheWeek$1[EStartOfTheWeek$1["SATURDAY"] = 6] = "SATURDAY";
	return EStartOfTheWeek$1;
}({});

//#endregion
//#region src/view-props.ts
/**
* Keys for the work item filter properties
*/
const WORK_ITEM_FILTER_PROPERTY_KEYS = [
	"state_group",
	"priority",
	"start_date",
	"target_date",
	"assignee_id",
	"mention_id",
	"created_by_id",
	"subscriber_id",
	"label_id",
	"state_id",
	"cycle_id",
	"module_id",
	"project_id",
	"created_at",
	"updated_at"
];

//#endregion
//#region src/views.ts
let EViewAccess = /* @__PURE__ */ function(EViewAccess$1) {
	EViewAccess$1[EViewAccess$1["PRIVATE"] = 0] = "PRIVATE";
	EViewAccess$1[EViewAccess$1["PUBLIC"] = 1] = "PUBLIC";
	return EViewAccess$1;
}({});

//#endregion
//#region src/workspace.ts
let EUserWorkspaceRoles = /* @__PURE__ */ function(EUserWorkspaceRoles$1) {
	EUserWorkspaceRoles$1[EUserWorkspaceRoles$1["ADMIN"] = 20] = "ADMIN";
	EUserWorkspaceRoles$1[EUserWorkspaceRoles$1["MEMBER"] = 15] = "MEMBER";
	EUserWorkspaceRoles$1[EUserWorkspaceRoles$1["GUEST"] = 5] = "GUEST";
	return EUserWorkspaceRoles$1;
}({});
let EOnboardingSteps = /* @__PURE__ */ function(EOnboardingSteps$1) {
	EOnboardingSteps$1["PROFILE_SETUP"] = "PROFILE_SETUP";
	EOnboardingSteps$1["ROLE_SETUP"] = "ROLE_SETUP";
	EOnboardingSteps$1["USE_CASE_SETUP"] = "USE_CASE_SETUP";
	EOnboardingSteps$1["WORKSPACE_CREATE_OR_JOIN"] = "WORKSPACE_CREATE_OR_JOIN";
	EOnboardingSteps$1["INVITE_MEMBERS"] = "INVITE_MEMBERS";
	return EOnboardingSteps$1;
}({});
let ECreateOrJoinWorkspaceViews = /* @__PURE__ */ function(ECreateOrJoinWorkspaceViews$1) {
	ECreateOrJoinWorkspaceViews$1["WORKSPACE_CREATE"] = "WORKSPACE_CREATE";
	ECreateOrJoinWorkspaceViews$1["WORKSPACE_JOIN"] = "WORKSPACE_JOIN";
	return ECreateOrJoinWorkspaceViews$1;
}({});

//#endregion
//#region src/workspace-views.ts
const STATIC_VIEW_TYPES = [
	"all-issues",
	"assigned",
	"created",
	"subscribed"
];

//#endregion
//#region src/base-layouts/gantt/core.ts
/**
* Copyright (c) 2023-present Plane Software, Inc. and contributors
* SPDX-License-Identifier: AGPL-3.0-only
* See the LICENSE file for details.
*/
const CORE_GANTT_TIMELINE_TYPE = {
	ISSUE: "ISSUE",
	MODULE: "MODULE",
	PROJECT: "PROJECT",
	GROUPED: "GROUPED"
};

//#endregion
//#region src/base-layouts/gantt/extended.ts
/**
* Copyright (c) 2023-present Plane Software, Inc. and contributors
* SPDX-License-Identifier: AGPL-3.0-only
* See the LICENSE file for details.
*/
const EXTENDED_GANTT_TIMELINE_TYPE = {};

//#endregion
//#region src/base-layouts/gantt/index.ts
const GANTT_TIMELINE_TYPE = {
	...CORE_GANTT_TIMELINE_TYPE,
	...EXTENDED_GANTT_TIMELINE_TYPE
};

//#endregion
export { COLLECTION_OPERATOR, COMPARISON_OPERATOR, CORE_COLLECTION_OPERATOR, CORE_COMPARISON_OPERATOR, CORE_EQUALITY_OPERATOR, CORE_FILTER_FIELD_TYPE, CORE_LOGICAL_OPERATOR, CORE_MULTI_VALUE_OPERATORS, CORE_OPERATORS, ChartXAxisProperty, ChartYAxisMetric, ECreateOrJoinWorkspaceViews, EDurationFilters, EEstimateSystem, EEstimateUpdateStages, EFileAssetType, EGanttBlockType, EInboxIssueCurrentTab, EInboxIssueSource, EInboxIssueStatus, EIssueCommentAccessSpecifier, EIssueLayoutTypes, EIssueServiceType, EIssuesStoreType, ENotificationFilterType, EOnboardingSteps, EPageAccess, EProductSubscriptionEnum, EProjectNetwork, EQUALITY_OPERATOR, EStartOfTheWeek, EUpdateStatus, EUserPermissions, EUserProjectRoles, EUserWorkspaceRoles, EViewAccess, EXTENDED_COLLECTION_OPERATOR, EXTENDED_COMPARISON_OPERATOR, EXTENDED_EQUALITY_OPERATOR, EXTENDED_FILTER_FIELD_TYPE, EXTENDED_LOGICAL_OPERATOR, EXTENDED_MULTI_VALUE_OPERATORS, EXTENDED_OPERATORS, FILTER_FIELD_TYPE, FILTER_NODE_TYPE, GANTT_TIMELINE_TYPE, LOGICAL_OPERATOR, MULTI_VALUE_OPERATORS, STATIC_VIEW_TYPES, WORK_ITEM_FILTER_PROPERTY_KEYS };
//# sourceMappingURL=index.mjs.map