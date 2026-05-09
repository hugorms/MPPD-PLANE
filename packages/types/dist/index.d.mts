import { ReactNode } from "react";

//#region src/activity.d.ts

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TBaseActivity<TFieldKey extends string = string, TVerbKey extends string = string> = {
  id: string;
  field: TFieldKey | undefined;
  epoch: number;
  verb: TVerbKey;
  comment: string | undefined;
  old_value: string | undefined;
  new_value: string | undefined;
  old_identifier: string | undefined;
  new_identifier: string | undefined;
  actor: string;
  created_at: string;
  updated_at: string;
};
type TWorkspaceBaseActivity<K$1 extends string = string, V extends string = string> = TBaseActivity<K$1, V> & {
  workspace: string;
};
type TProjectBaseActivity<K$1 extends string = string, V extends string = string> = TWorkspaceBaseActivity<K$1, V> & {
  project: string;
};
type TBaseActivityVerbs = "created" | "updated" | "deleted";
//#endregion
//#region src/project/project_filters.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TProjectOrderByOptions = "sort_order" | "name" | "-name" | "created_at" | "-created_at" | "members_length" | "-members_length";
type TProjectDisplayFilters = {
  my_projects?: boolean;
  archived_projects?: boolean;
  order_by?: TProjectOrderByOptions;
};
type TProjectAppliedDisplayFilterKeys = "my_projects" | "archived_projects";
type TProjectFilters = {
  access?: string[] | null;
  lead?: string[] | null;
  members?: string[] | null;
  created_at?: string[] | null;
};
type TProjectStoredFilters = {
  display_filters?: TProjectDisplayFilters;
  filters?: TProjectFilters;
};
//#endregion
//#region src/common.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TPaginationInfo = {
  count: number;
  extra_stats: string | null;
  next_cursor: string;
  next_page_results: boolean;
  prev_cursor: string;
  prev_page_results: boolean;
  total_pages: number;
  per_page?: number;
  total_results: number;
};
type TLogoProps = {
  in_use: "emoji" | "icon";
  emoji?: {
    value?: string;
    url?: string;
  };
  icon?: {
    name?: string;
    color?: string;
    background_color?: string;
  };
};
type TNameDescriptionLoader = "submitting" | "submitted" | "saved";
type TFetchStatus = "partial" | "complete" | undefined;
type ICustomSearchSelectOption = {
  value: any;
  query: string;
  content: React.ReactNode;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
};
//#endregion
//#region src/enums.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
declare enum EUserPermissions {
  ADMIN = 20,
  MEMBER = 15,
  GUEST = 5,
}
type TUserPermissions = EUserPermissions.ADMIN | EUserPermissions.MEMBER | EUserPermissions.GUEST;
declare enum EProjectNetwork {
  PRIVATE = 0,
  PUBLIC = 2,
}
declare enum EPageAccess {
  PUBLIC = 0,
  PRIVATE = 1,
}
declare enum EDurationFilters {
  NONE = "none",
  TODAY = "today",
  THIS_WEEK = "this_week",
  THIS_MONTH = "this_month",
  THIS_YEAR = "this_year",
  CUSTOM = "custom",
}
declare enum EIssueCommentAccessSpecifier {
  EXTERNAL = "EXTERNAL",
  INTERNAL = "INTERNAL",
}
declare enum EEstimateSystem {
  POINTS = "points",
  CATEGORIES = "categories",
  TIME = "time",
}
declare enum EEstimateUpdateStages {
  CREATE = "create",
  EDIT = "edit",
  SWITCH = "switch",
}
declare enum ENotificationFilterType {
  CREATED = "created",
  ASSIGNED = "assigned",
  SUBSCRIBED = "subscribed",
}
declare enum EFileAssetType {
  COMMENT_DESCRIPTION = "COMMENT_DESCRIPTION",
  ISSUE_ATTACHMENT = "ISSUE_ATTACHMENT",
  ISSUE_DESCRIPTION = "ISSUE_DESCRIPTION",
  DRAFT_ISSUE_DESCRIPTION = "DRAFT_ISSUE_DESCRIPTION",
  PAGE_DESCRIPTION = "PAGE_DESCRIPTION",
  PROJECT_COVER = "PROJECT_COVER",
  USER_AVATAR = "USER_AVATAR",
  USER_COVER = "USER_COVER",
  WORKSPACE_LOGO = "WORKSPACE_LOGO",
  TEAM_SPACE_DESCRIPTION = "TEAM_SPACE_DESCRIPTION",
  INITIATIVE_DESCRIPTION = "INITIATIVE_DESCRIPTION",
  PROJECT_DESCRIPTION = "PROJECT_DESCRIPTION",
  TEAM_SPACE_COMMENT_DESCRIPTION = "TEAM_SPACE_COMMENT_DESCRIPTION",
}
type TEditorAssetType = EFileAssetType.COMMENT_DESCRIPTION | EFileAssetType.ISSUE_DESCRIPTION | EFileAssetType.DRAFT_ISSUE_DESCRIPTION | EFileAssetType.PAGE_DESCRIPTION | EFileAssetType.TEAM_SPACE_DESCRIPTION | EFileAssetType.INITIATIVE_DESCRIPTION | EFileAssetType.PROJECT_DESCRIPTION | EFileAssetType.TEAM_SPACE_COMMENT_DESCRIPTION;
declare enum EUpdateStatus {
  OFF_TRACK = "OFF-TRACK",
  ON_TRACK = "ON-TRACK",
  AT_RISK = "AT-RISK",
}
//#endregion
//#region src/state.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TStateGroups = "backlog" | "unstarted" | "started" | "completed" | "cancelled";
interface IState {
  readonly id: string;
  color: string;
  default: boolean;
  description: string;
  group: TStateGroups;
  name: string;
  project_id: string;
  sequence: number;
  workspace_id: string;
  order: number;
}
interface IStateLite {
  color: string;
  group: TStateGroups;
  id: string;
  name: string;
}
interface IStateResponse {
  [key: string]: IState[];
}
type TStateOperationsCallbacks = {
  createState: (data: Partial<IState>) => Promise<IState>;
  updateState: (stateId: string, data: Partial<IState>) => Promise<IState | undefined>;
  deleteState: (stateId: string) => Promise<void>;
  moveStatePosition: (stateId: string, data: Partial<IState>) => Promise<void>;
  markStateAsDefault: (stateId: string) => Promise<void>;
};
//#endregion
//#region src/instance/ai.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TInstanceAIConfigurationKeys = "LLM_API_KEY" | "LLM_MODEL";
//#endregion
//#region src/instance/auth.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TCoreInstanceAuthenticationModeKeys = "unique-codes" | "passwords-login" | "google" | "github" | "gitlab" | "gitea";
type TInstanceAuthenticationModeKeys = TCoreInstanceAuthenticationModeKeys;
type TInstanceAuthenticationModes = {
  key: TInstanceAuthenticationModeKeys;
  name: string;
  description: string;
  icon: React.ReactNode;
  config: React.ReactNode;
  enabledConfigKey: TInstanceAuthenticationMethodKeys;
  unavailable?: boolean;
};
type TInstanceAuthenticationMethodKeys = "ENABLE_SIGNUP" | "ENABLE_MAGIC_LINK_LOGIN" | "ENABLE_EMAIL_PASSWORD" | "IS_GOOGLE_ENABLED" | "IS_GITHUB_ENABLED" | "IS_GITLAB_ENABLED" | "IS_GITEA_ENABLED";
type TInstanceGoogleAuthenticationConfigurationKeys = "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "ENABLE_GOOGLE_SYNC";
type TInstanceGithubAuthenticationConfigurationKeys = "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET" | "GITHUB_ORGANIZATION_ID" | "ENABLE_GITHUB_SYNC";
type TInstanceGitlabAuthenticationConfigurationKeys = "GITLAB_HOST" | "GITLAB_CLIENT_ID" | "GITLAB_CLIENT_SECRET" | "ENABLE_GITLAB_SYNC";
type TInstanceGiteaAuthenticationConfigurationKeys = "GITEA_HOST" | "GITEA_CLIENT_ID" | "GITEA_CLIENT_SECRET" | "ENABLE_GITEA_SYNC";
type TInstanceAuthenticationConfigurationKeys = TInstanceGoogleAuthenticationConfigurationKeys | TInstanceGithubAuthenticationConfigurationKeys | TInstanceGitlabAuthenticationConfigurationKeys | TInstanceGiteaAuthenticationConfigurationKeys;
type TInstanceAuthenticationKeys = TInstanceAuthenticationMethodKeys | TInstanceAuthenticationConfigurationKeys;
type TGetBaseAuthenticationModeProps = {
  disabled: boolean;
  updateConfig: (key: TInstanceAuthenticationMethodKeys, value: string) => void;
  resolvedTheme: string | undefined;
};
type TOAuthOption = {
  id: string;
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
  enabled?: boolean;
};
type TOAuthConfigs = {
  isOAuthEnabled: boolean;
  oAuthOptions: TOAuthOption[];
};
type TCoreLoginMediums = "email" | "magic-code" | "github" | "gitlab" | "google" | "gitea";
//#endregion
//#region src/instance/auth-ee.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TExtendedLoginMediums = never;
type TExtendedInstanceAuthenticationModeKeys = never;
//#endregion
//#region src/instance/base.d.ts
interface IInstanceInfo {
  instance: IInstance;
  config: IInstanceConfig;
}
interface IInstance {
  id: string;
  created_at: string;
  updated_at: string;
  instance_name: string | undefined;
  whitelist_emails: string | undefined;
  instance_id: string | undefined;
  license_key: string | undefined;
  current_version: string | undefined;
  latest_version: string | undefined;
  last_checked_at: string | undefined;
  namespace: string | undefined;
  is_telemetry_enabled: boolean;
  is_support_required: boolean;
  is_activated: boolean;
  is_setup_done: boolean;
  is_signup_screen_visited: boolean;
  user_count: number | undefined;
  is_verified: boolean;
  created_by: string | undefined;
  updated_by: string | undefined;
  workspaces_exist: boolean;
}
interface IInstanceConfig {
  enable_signup: boolean;
  is_workspace_creation_disabled: boolean;
  is_google_enabled: boolean;
  is_github_enabled: boolean;
  is_gitlab_enabled: boolean;
  is_gitea_enabled: boolean;
  is_magic_login_enabled: boolean;
  is_email_password_enabled: boolean;
  github_app_name: string | undefined;
  slack_client_id: string | undefined;
  posthog_api_key: string | undefined;
  posthog_host: string | undefined;
  has_unsplash_configured: boolean;
  has_llm_configured: boolean;
  file_size_limit: number | undefined;
  is_smtp_configured: boolean;
  app_base_url: string | undefined;
  space_base_url: string | undefined;
  admin_base_url: string | undefined;
  is_self_managed: boolean;
  is_intercom_enabled: boolean;
  intercom_app_id: string | undefined;
  instance_changelog_url?: string;
}
interface IInstanceAdmin {
  created_at: string;
  created_by: string;
  id: string;
  instance: string;
  role: string;
  updated_at: string;
  updated_by: string;
  user: string;
  user_detail: IUserLite;
}
type TInstanceIntercomConfigurationKeys = "IS_INTERCOM_ENABLED" | "INTERCOM_APP_ID";
type TInstanceConfigurationKeys = TInstanceAIConfigurationKeys | TInstanceEmailConfigurationKeys | TInstanceImageConfigurationKeys | TInstanceAuthenticationKeys | TInstanceIntercomConfigurationKeys | TInstanceWorkspaceConfigurationKeys;
interface IInstanceConfiguration {
  id: string;
  created_at: string;
  updated_at: string;
  key: TInstanceConfigurationKeys;
  value: string;
  created_by: string | null;
  updated_by: string | null;
}
type IFormattedInstanceConfiguration = { [key in TInstanceConfigurationKeys]: string };
type TLoginMediums = TCoreLoginMediums | TExtendedLoginMediums;
//#endregion
//#region src/instance/email.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TInstanceEmailConfigurationKeys = "EMAIL_HOST" | "EMAIL_PORT" | "EMAIL_HOST_USER" | "EMAIL_HOST_PASSWORD" | "EMAIL_USE_TLS" | "EMAIL_USE_SSL" | "EMAIL_FROM" | "ENABLE_SMTP";
//#endregion
//#region src/instance/image.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TInstanceImageConfigurationKeys = "UNSPLASH_ACCESS_KEY";
//#endregion
//#region src/instance/workspace.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TInstanceWorkspaceConfigurationKeys = "DISABLE_WORKSPACE_CREATION";
//#endregion
//#region src/users.d.ts
/**
 * @description The start of the week for the user
 * @enum {number}
 */
declare enum EStartOfTheWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}
interface IUserLite {
  avatar_url: string;
  display_name: string;
  email?: string;
  first_name: string;
  id: string;
  is_bot: boolean;
  last_name: string;
  joining_date?: string;
}
interface IUser extends IUserLite {
  cover_image_asset?: string | null;
  cover_image?: string | null;
  cover_image_url: string | null;
  date_joined: string;
  email: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_password_autoset: boolean;
  is_tour_completed: boolean;
  mobile_number: string | null;
  last_workspace_id: string;
  user_timezone: string;
  username: string;
  last_login_medium: TLoginMediums;
  theme: IUserTheme;
}
interface IUserAccount {
  provider_account_id: string;
  provider: string;
  created_at: Date;
  updated_at: Date;
}
type TUserProfile = {
  id: string | undefined;
  user: string | undefined;
  role: string | undefined;
  last_workspace_id: string | undefined;
  theme: {
    theme: string | undefined;
    primary: string | undefined;
    background: string | undefined;
    darkPalette: boolean | undefined;
  };
  onboarding_step: TOnboardingSteps;
  is_onboarded: boolean;
  is_tour_completed: boolean;
  use_case: string | undefined;
  billing_address_country: string | undefined;
  billing_address: string | undefined;
  has_billing_address: boolean;
  has_marketing_email_consent: boolean;
  language: string;
  created_at: Date | string;
  updated_at: Date | string;
  start_of_the_week: EStartOfTheWeek;
};
interface IInstanceAdminStatus {
  is_instance_admin: boolean;
}
interface IUserSettings {
  id: string | undefined;
  email: string | undefined;
  workspace: {
    last_workspace_id: string | undefined;
    last_workspace_slug: string | undefined;
    last_workspace_name: string | undefined;
    last_workspace_logo: string | undefined;
    fallback_workspace_id: string | undefined;
    fallback_workspace_slug: string | undefined;
    invites: number | undefined;
  };
}
interface IUserTheme {
  theme: string | undefined;
  primary?: string | undefined;
  background?: string | undefined;
  darkPalette?: boolean | undefined;
}
interface IUserMemberLite extends IUserLite {
  email?: string;
}
interface IUserActivity {
  created_date: string;
  activity_count: number;
}
interface IUserPriorityDistribution {
  priority: TIssuePriorities;
  priority_count: number;
}
interface IUserStateDistribution {
  state_group: TStateGroups;
  state_count: number;
}
interface IUserActivityResponse {
  count: number;
  extra_stats: null;
  next_cursor: string;
  next_page_results: boolean;
  prev_cursor: string;
  prev_page_results: boolean;
  results: IIssueActivity[];
  total_pages: number;
  total_results: number;
}
type UserAuth = {
  isMember: boolean;
  isOwner: boolean;
  isGuest: boolean;
};
type TOnboardingSteps = {
  profile_complete: boolean;
  workspace_create: boolean;
  workspace_invite: boolean;
  workspace_join: boolean;
};
interface IUserProfileData {
  assigned_issues: number;
  completed_issues: number;
  created_issues: number;
  pending_issues: number;
  priority_distribution: IUserPriorityDistribution[];
  state_distribution: IUserStateDistribution[];
  subscribed_issues: number;
}
interface IUserProfileProjectSegregation {
  project_data: {
    assigned_issues: number;
    completed_issues: number;
    created_issues: number;
    id: string;
    pending_issues: number;
  }[];
  user_data: Pick<IUser, "avatar_url" | "cover_image_url" | "display_name" | "first_name" | "last_name"> & {
    date_joined: Date;
    user_timezone: string;
  };
}
interface IUserProjectsRole {
  [projectId: string]: TUserPermissions;
}
interface IUserEmailNotificationSettings {
  property_change: boolean;
  state_change: boolean;
  comment: boolean;
  mention: boolean;
  issue_completed: boolean;
}
type TProfileViews = "assigned" | "created" | "subscribed";
type TPublicMember = {
  id: string;
  member: string;
  member__display_name: string;
  member__avatar: string;
};
//#endregion
//#region src/cycle/cycle_filters.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TCycleTabOptions = "active" | "all";
type TCycleLayoutOptions = "list" | "board" | "gantt";
type TCycleDisplayFilters = {
  active_tab?: TCycleTabOptions;
  layout?: TCycleLayoutOptions;
};
type TCycleFilters = {
  end_date?: string[] | null;
  start_date?: string[] | null;
  status?: string[] | null;
};
type TCycleFiltersByState = {
  default: TCycleFilters;
  archived: TCycleFilters;
};
type TCycleStoredFilters = {
  display_filters?: TCycleDisplayFilters;
  filters?: TCycleFilters;
};
//#endregion
//#region src/module/module_filters.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TModuleOrderByOptions = "name" | "-name" | "progress" | "-progress" | "issues_length" | "-issues_length" | "target_date" | "-target_date" | "created_at" | "-created_at" | "sort_order";
type TModuleLayoutOptions = "list" | "board" | "gantt";
type TModuleDisplayFilters = {
  favorites?: boolean;
  layout?: TModuleLayoutOptions;
  order_by?: TModuleOrderByOptions;
};
type TModuleFilters = {
  lead?: string[] | null;
  members?: string[] | null;
  start_date?: string[] | null;
  status?: string[] | null;
  target_date?: string[] | null;
};
type TModuleFiltersByState = {
  default: TModuleFilters;
  archived: TModuleFilters;
};
type TModuleStoredFilters = {
  display_filters?: TModuleDisplayFilters;
  filters?: TModuleFilters;
};
//#endregion
//#region src/utils.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type PartialDeep<K$1> = { [attr in keyof K$1]?: K$1[attr] extends object ? PartialDeep<K$1[attr]> : K$1[attr] };
type CompleteOrEmpty<T> = T | Record<string, never>;
type MakeOptional<T, K$1 extends keyof T> = Omit<T, K$1> & Partial<Pick<T, K$1>>;
type SingleOrArray<T> = T extends null | undefined ? T : T | T[];
//#endregion
//#region src/rich-filters/operators/core.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
/**
 * Core logical operators
 */
declare const CORE_LOGICAL_OPERATOR: {
  readonly AND: "and";
};
/**
 * Core equality operators
 */
declare const CORE_EQUALITY_OPERATOR: {
  readonly EXACT: "exact";
};
/**
 * Core collection operators
 */
declare const CORE_COLLECTION_OPERATOR: {
  readonly IN: "in";
};
/**
 * Core comparison operators
 */
declare const CORE_COMPARISON_OPERATOR: {
  readonly RANGE: "range";
};
/**
 * Core operators that support multiple values
 */
declare const CORE_MULTI_VALUE_OPERATORS: readonly ["in", "range"];
/**
 * All core operators
 */
declare const CORE_OPERATORS: {
  readonly RANGE: "range";
  readonly IN: "in";
  readonly EXACT: "exact";
};
/**
 * All core operators that can be used in filter conditions
 */
type TCoreSupportedOperators = (typeof CORE_OPERATORS)[keyof typeof CORE_OPERATORS];
//#endregion
//#region src/rich-filters/operators/extended.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
/**
 * Extended logical operators
 */
declare const EXTENDED_LOGICAL_OPERATOR: {};
/**
 * Extended equality operators
 */
declare const EXTENDED_EQUALITY_OPERATOR: {};
/**
 * Extended collection operators
 */
declare const EXTENDED_COLLECTION_OPERATOR: {};
/**
 * Extended comparison operators
 */
declare const EXTENDED_COMPARISON_OPERATOR: {};
/**
 * Extended operators that support multiple values
 */
declare const EXTENDED_MULTI_VALUE_OPERATORS: readonly [];
/**
 * All extended operators
 */
declare const EXTENDED_OPERATORS: {};
/**
 * All extended operators that can be used in filter conditions
 */
type TExtendedSupportedOperators = (typeof EXTENDED_OPERATORS)[keyof typeof EXTENDED_OPERATORS];
//#endregion
//#region src/rich-filters/operators/index.d.ts
declare const LOGICAL_OPERATOR: {
  readonly AND: "and";
};
declare const EQUALITY_OPERATOR: {
  readonly EXACT: "exact";
};
declare const COLLECTION_OPERATOR: {
  readonly IN: "in";
};
declare const COMPARISON_OPERATOR: {
  readonly RANGE: "range";
};
declare const MULTI_VALUE_OPERATORS: ReadonlyArray<TSupportedOperators>;
type TLogicalOperator = (typeof LOGICAL_OPERATOR)[keyof typeof LOGICAL_OPERATOR];
type TEqualityOperator = (typeof EQUALITY_OPERATOR)[keyof typeof EQUALITY_OPERATOR];
type TCollectionOperator = (typeof COLLECTION_OPERATOR)[keyof typeof COLLECTION_OPERATOR];
type TComparisonOperator = (typeof COMPARISON_OPERATOR)[keyof typeof COMPARISON_OPERATOR];
/**
 * Union type representing all operators that can be used in a filter condition.
 * Combines core and extended operators.
 */
type TSupportedOperators = TCoreSupportedOperators | TExtendedSupportedOperators;
/**
 * All operators available for use in rich filters UI, including negated versions.
 */
type TAllAvailableOperatorsForDisplay = TSupportedOperators;
//#endregion
//#region src/rich-filters/expression.d.ts
/**
 * Filter node types for building hierarchical filter trees.
 * - CONDITION: Single filter for one field (e.g., "state is backlog")
 * - GROUP: Logical container combining multiple filters with AND/OR or single filter/group with NOT
 */
declare const FILTER_NODE_TYPE: {
  readonly CONDITION: "condition";
  readonly GROUP: "group";
};
type TFilterNodeType = (typeof FILTER_NODE_TYPE)[keyof typeof FILTER_NODE_TYPE];
/**
 * Field property key that can be filtered (e.g., "state", "assignee", "created_at").
 */
type TFilterProperty = string;
/**
 * Allowed filter values - primitives plus null/undefined for empty states.
 */
type TFilterValue = string | number | Date | boolean | null | undefined;
/**
 * Base properties shared by all filter nodes.
 * - id: Unique identifier for the node
 * - type: Node type (condition or group)
 */
type TBaseFilterNode = {
  id: string;
  type: TFilterNodeType;
};
/**
 * Leaf node representing a single filter condition (e.g., "state is backlog").
 * - type: Node type (condition)
 * - property: Field being filtered
 * - operator: Comparison operator (is, is not, between, not between, etc.)
 * - value: Filter value(s) - array for operators that support multiple values
 * @template P - Property key type
 * @template V - Value type
 */
type TFilterConditionNode<P extends TFilterProperty, V extends TFilterValue> = TBaseFilterNode & {
  type: typeof FILTER_NODE_TYPE.CONDITION;
  property: P;
  operator: TSupportedOperators;
  value: SingleOrArray<V>;
};
/**
 * Filter condition node for display purposes.
 */
type TFilterConditionNodeForDisplay<P extends TFilterProperty, V extends TFilterValue> = Omit<TFilterConditionNode<P, V>, "operator"> & {
  operator: TAllAvailableOperatorsForDisplay;
};
/**
 * Container node that combines multiple conditions with AND logical operator.
 * - type: Node type (group)
 * - logicalOperator: AND operator for combining child filters
 * - children: Child conditions and/or nested groups (minimum 2 for meaningful operations)
 * @template P - Property key type
 */
type TFilterAndGroupNode<P extends TFilterProperty> = TBaseFilterNode & {
  type: typeof FILTER_NODE_TYPE.GROUP;
  logicalOperator: typeof LOGICAL_OPERATOR.AND;
  children: TFilterExpression<P>[];
};
/**
 * Union type for all group node types - AND, OR, and NOT groups.
 * @template P - Property key type
 */
type TFilterGroupNode<P extends TFilterProperty> = TFilterAndGroupNode<P>;
/**
 * Union type for any filter node - either a single condition or a group container.
 * @template P - Property key type
 * @template V - Value type
 */
type TFilterExpression<P extends TFilterProperty, V extends TFilterValue = TFilterValue> = TFilterConditionNode<P, V> | TFilterGroupNode<P>;
/**
 * Payload for creating/updating condition nodes - excludes base node properties.
 * @template P - Property key type
 * @template V - Value type
 */
type TFilterConditionPayload<P extends TFilterProperty, V extends TFilterValue> = Omit<TFilterConditionNode<P, V>, keyof TBaseFilterNode>;
/**
 * Payload for creating/updating AND group nodes - excludes base node properties.
 * @template P - Property key type
 */
type TFilterAndGroupPayload<P extends TFilterProperty> = Omit<TFilterAndGroupNode<P>, keyof TBaseFilterNode>;
/**
 * Union payload type for creating/updating any group node - excludes base node properties.
 * @template P - Property key type
 */
type TFilterGroupPayload<P extends TFilterProperty> = TFilterAndGroupPayload<P>;
//#endregion
//#region src/rich-filters/adapter.d.ts
/**
 * External filter format
 */
type TExternalFilter = Record<string, unknown> | undefined | null;
/**
 * Adapter for converting between internal filter trees and external formats.
 * @template P - Filter property type (e.g., 'state_id', 'priority', 'assignee')
 * @template E - External filter format type (e.g., work item filters, automation filters)
 */
interface IFilterAdapter<P extends TFilterProperty, E extends TExternalFilter> {
  /**
   * Converts external format to internal filter tree.
   */
  toInternal(externalFilter: E): TFilterExpression<P> | null;
  /**
   * Converts internal filter tree to external format.
   */
  toExternal(internalFilter: TFilterExpression<P> | null): E;
}
//#endregion
//#region src/rich-filters/builder.d.ts
/**
 * Condition payload for building filter expressions.
 * @template P - Property key type
 * @template V - Value type
 */
type TFilterConditionForBuild<P extends TFilterProperty, V extends TFilterValue> = {
  property: P;
  operator: TAllAvailableOperatorsForDisplay;
  value: SingleOrArray<V>;
};
/**
 * Parameters for building filter expressions from multiple conditions.
 * @template P - Property key type
 * @template V - Value type
 */
type TBuildFilterExpressionParams<P extends TFilterProperty, V extends TFilterValue, E extends TExternalFilter> = {
  conditions: TFilterConditionForBuild<P, V>[];
  adapter: IFilterAdapter<P, E>;
};
//#endregion
//#region src/rich-filters/field-types/shared.d.ts
/**
 * Negative operator configuration for operators.
 * - allowNegative: Whether the operator supports negation
 * - negOperatorLabel: Label to use when the operator is negated
 */
type TNegativeOperatorConfig = {
  allowNegative: true;
  negOperatorLabel?: string;
} | {
  allowNegative?: false;
};
/**
 * Base filter configuration shared by all filter types.
 * - operatorLabel: Label to use for the operator
 * - negativeOperatorConfig: Configuration for negative operators
 */
type TBaseFilterFieldConfig = {
  isOperatorEnabled?: boolean;
  operatorLabel?: string;
} & TNegativeOperatorConfig;
/**
 * Individual option for select/multi-select filters.
 * - id: Unique identifier for the option
 * - label: Display text shown to users
 * - value: Actual value used in filtering
 * - icon: Optional icon component
 * - iconClassName: CSS class for icon styling
 * - disabled: Whether option can be selected
 * - description: Additional context to be displayed in the filter dropdown
 */
interface IFilterOption<V extends TFilterValue> {
  id: string;
  label: string;
  value: V;
  icon?: React.ReactNode;
  iconClassName?: string;
  disabled?: boolean;
  description?: string;
}
//#endregion
//#region src/rich-filters/field-types/core.d.ts
/**
 * Core filter types
 */
declare const CORE_FILTER_FIELD_TYPE: {
  readonly DATE: "date";
  readonly DATE_RANGE: "date_range";
  readonly SINGLE_SELECT: "single_select";
  readonly MULTI_SELECT: "multi_select";
};
type TBaseDateFilterFieldConfig = TBaseFilterFieldConfig & {
  min?: Date;
  max?: Date;
};
/**
 * Date filter configuration - for temporal filtering.
 * - defaultValue: Initial date/time value
 * - min: Minimum allowed date
 * - max: Maximum allowed date
 */
type TDateFilterFieldConfig<V extends TFilterValue> = TBaseDateFilterFieldConfig & {
  type: typeof CORE_FILTER_FIELD_TYPE.DATE;
  defaultValue?: V;
};
/**
 * Date range filter configuration - for temporal filtering.
 * - defaultValue: Initial date/time range values
 * - min: Minimum allowed date
 * - max: Maximum allowed date
 */
type TDateRangeFilterFieldConfig<V extends TFilterValue> = TBaseDateFilterFieldConfig & {
  type: typeof CORE_FILTER_FIELD_TYPE.DATE_RANGE;
  defaultValue?: V[];
};
/**
 * Single-select filter configuration - dropdown with one selectable option.
 * - defaultValue: Initial selected value
 * - getOptions: Options as static array or async function
 */
type TSingleSelectFilterFieldConfig<V extends TFilterValue> = TBaseFilterFieldConfig & {
  type: typeof CORE_FILTER_FIELD_TYPE.SINGLE_SELECT;
  defaultValue?: V;
  getOptions: IFilterOption<V>[] | (() => IFilterOption<V>[] | Promise<IFilterOption<V>[]>);
};
/**
 * Multi-select filter configuration - allows selecting multiple options.
 * - defaultValue: Initial selected values array
 * - getOptions: Options as static array or async function
 * - singleValueOperator: Operator to show when single value is selected
 */
type TMultiSelectFilterFieldConfig<V extends TFilterValue> = TBaseFilterFieldConfig & {
  type: typeof CORE_FILTER_FIELD_TYPE.MULTI_SELECT;
  defaultValue?: V[];
  getOptions: IFilterOption<V>[] | (() => IFilterOption<V>[] | Promise<IFilterOption<V>[]>);
  singleValueOperator: TSupportedOperators;
};
/**
 * All core filter configurations
 */
type TCoreFilterFieldConfigs<V extends TFilterValue = TFilterValue> = TDateFilterFieldConfig<V> | TDateRangeFilterFieldConfig<V> | TSingleSelectFilterFieldConfig<V> | TMultiSelectFilterFieldConfig<V>;
//#endregion
//#region src/rich-filters/field-types/extended.d.ts
/**
 * Extended filter types
 */
declare const EXTENDED_FILTER_FIELD_TYPE: {};
/**
 * All extended filter configurations
 */
type TExtendedFilterFieldConfigs<_V extends TFilterValue = TFilterValue> = never;
//#endregion
//#region src/rich-filters/field-types/index.d.ts
declare const FILTER_FIELD_TYPE: {
  readonly DATE: "date";
  readonly DATE_RANGE: "date_range";
  readonly SINGLE_SELECT: "single_select";
  readonly MULTI_SELECT: "multi_select";
};
type TFilterFieldType = (typeof FILTER_FIELD_TYPE)[keyof typeof FILTER_FIELD_TYPE];
/**
 * All supported filter configurations.
 */
type TSupportedFilterFieldConfigs<V extends TFilterValue = TFilterValue> = TCoreFilterFieldConfigs<V> | TExtendedFilterFieldConfigs<V>;
//#endregion
//#region src/rich-filters/operator-configs/core.d.ts
type TCoreExactOperatorConfigs = TSingleSelectFilterFieldConfig<TFilterValue> | TDateFilterFieldConfig<TFilterValue>;
type TCoreInOperatorConfigs = TMultiSelectFilterFieldConfig<TFilterValue>;
type TCoreRangeOperatorConfigs = TDateRangeFilterFieldConfig<TFilterValue>;
type TCoreOperatorSpecificConfigs = {
  [CORE_EQUALITY_OPERATOR.EXACT]: TCoreExactOperatorConfigs;
  [CORE_COLLECTION_OPERATOR.IN]: TCoreInOperatorConfigs;
  [CORE_COMPARISON_OPERATOR.RANGE]: TCoreRangeOperatorConfigs;
};
//#endregion
//#region src/rich-filters/operator-configs/extended.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TExtendedExactOperatorConfigs = never;
type TExtendedInOperatorConfigs = never;
type TExtendedRangeOperatorConfigs = never;
type TExtendedOperatorSpecificConfigs = unknown;
//#endregion
//#region src/rich-filters/operator-configs/index.d.ts
/**
 * EXACT operator - combines core and extended configurations
 */
type TExactOperatorConfigs = TCoreExactOperatorConfigs | TExtendedExactOperatorConfigs;
/**
 * IN operator - combines core and extended configurations
 */
type TInOperatorConfigs = TCoreInOperatorConfigs | TExtendedInOperatorConfigs;
/**
 * RANGE operator - combines core and extended configurations
 */
type TRangeOperatorConfigs = TCoreRangeOperatorConfigs | TExtendedRangeOperatorConfigs;
/**
 * Type-safe mapping of specific operators to their supported filter type configurations.
 * Each operator maps to its composed (core + extended) configurations.
 */
type TOperatorSpecificConfigs = {
  [EQUALITY_OPERATOR.EXACT]: TExactOperatorConfigs;
  [COLLECTION_OPERATOR.IN]: TInOperatorConfigs;
  [COMPARISON_OPERATOR.RANGE]: TRangeOperatorConfigs;
} & TExtendedOperatorSpecificConfigs;
/**
 * Operator filter configuration mapping - for different operators.
 * Provides type-safe mapping of operators to their specific supported configurations.
 */
type TOperatorConfigMap = Map<keyof TOperatorSpecificConfigs, TOperatorSpecificConfigs[keyof TOperatorSpecificConfigs]>;
//#endregion
//#region src/rich-filters/config/filter-config.d.ts
/**
 * Main filter configuration type for different properties.
 * This is the primary configuration type used throughout the application.
 *
 * @template P - Property key type (e.g., 'state_id', 'priority', 'assignee')
 * @template V - Value type for the filter
 */
type TFilterConfig<P extends TFilterProperty> = {
  id: P;
  label: string;
  icon?: React.FC<React.SVGAttributes<SVGElement>>;
  isEnabled: boolean;
  allowMultipleFilters?: boolean;
  supportedOperatorConfigsMap: TOperatorConfigMap;
  rightContent?: React.ReactNode;
  tooltipContent?: React.ReactNode;
};
//#endregion
//#region src/rich-filters/derived/shared.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
/**
 * Generic utility type to check if a configuration type supports specific filter types.
 * Returns the operator key if any member of the union includes the target filter types, never otherwise.
 */
type TFilterOperatorHelper<TOperatorConfigs, K$1 extends keyof TOperatorConfigs, TTargetFilter> = TTargetFilter extends TOperatorConfigs[K$1] ? K$1 : TOperatorConfigs[K$1] extends TTargetFilter ? K$1 : never;
//#endregion
//#region src/rich-filters/derived/core.d.ts
/**
 * Union type representing all core operators that support single date filter types.
 */
type TCoreSupportedSingleDateFilterOperators<V extends TFilterValue = TFilterValue> = { [K in keyof TCoreOperatorSpecificConfigs]: TFilterOperatorHelper<TCoreOperatorSpecificConfigs, K, TDateFilterFieldConfig<V>> }[keyof TCoreOperatorSpecificConfigs];
/**
 * Union type representing all core operators that support range date filter types.
 */
type TCoreSupportedRangeDateFilterOperators<V extends TFilterValue = TFilterValue> = { [K in keyof TCoreOperatorSpecificConfigs]: TFilterOperatorHelper<TCoreOperatorSpecificConfigs, K, TDateRangeFilterFieldConfig<V>> }[keyof TCoreOperatorSpecificConfigs];
/**
 * Union type representing all core operators that support date filter types.
 */
type TCoreSupportedDateFilterOperators<V extends TFilterValue = TFilterValue> = TCoreSupportedSingleDateFilterOperators<V> | TCoreSupportedRangeDateFilterOperators<V>;
type TCoreAllAvailableDateFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> = TCoreSupportedDateFilterOperators<V>;
/**
 * Union type representing all core operators that support single select filter types.
 */
type TCoreSupportedSingleSelectFilterOperators<V extends TFilterValue = TFilterValue> = { [K in keyof TCoreOperatorSpecificConfigs]: TFilterOperatorHelper<TCoreOperatorSpecificConfigs, K, TSingleSelectFilterFieldConfig<V>> }[keyof TCoreOperatorSpecificConfigs];
/**
 * Union type representing all core operators that support multi select filter types.
 */
type TCoreSupportedMultiSelectFilterOperators<V extends TFilterValue = TFilterValue> = { [K in keyof TCoreOperatorSpecificConfigs]: TFilterOperatorHelper<TCoreOperatorSpecificConfigs, K, TMultiSelectFilterFieldConfig<V>> }[keyof TCoreOperatorSpecificConfigs];
/**
 * Union type representing all core operators that support any select filter types.
 */
type TCoreSupportedSelectFilterOperators<V extends TFilterValue = TFilterValue> = TCoreSupportedSingleSelectFilterOperators<V> | TCoreSupportedMultiSelectFilterOperators<V>;
type TCoreAllAvailableSelectFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> = TCoreSupportedSelectFilterOperators<V>;
//#endregion
//#region src/rich-filters/derived/extended.d.ts
/**
 * Union type representing all extended operators that support date filter types.
 */
type TExtendedSupportedDateFilterOperators<_V extends TFilterValue = TFilterValue> = never;
type TExtendedAllAvailableDateFilterOperatorsForDisplay<_V extends TFilterValue = TFilterValue> = never;
/**
 * Union type representing all extended operators that support select filter types.
 */
type TExtendedSupportedSelectFilterOperators<_V extends TFilterValue = TFilterValue> = never;
type TExtendedAllAvailableSelectFilterOperatorsForDisplay<_V extends TFilterValue = TFilterValue> = never;
//#endregion
//#region src/rich-filters/derived/index.d.ts
/**
 * All supported date filter operators.
 */
type TSupportedDateFilterOperators<V extends TFilterValue = TFilterValue> = TCoreSupportedDateFilterOperators<V> | TExtendedSupportedDateFilterOperators<V>;
type TAllAvailableDateFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> = TCoreAllAvailableDateFilterOperatorsForDisplay<V> | TExtendedAllAvailableDateFilterOperatorsForDisplay<V>;
/**
 * All supported select filter operators.
 */
type TSupportedSelectFilterOperators<V extends TFilterValue = TFilterValue> = TCoreSupportedSelectFilterOperators<V> | TExtendedSupportedSelectFilterOperators<V>;
type TAllAvailableSelectFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> = TCoreAllAvailableSelectFilterOperatorsForDisplay<V> | TExtendedAllAvailableSelectFilterOperatorsForDisplay<V>;
//#endregion
//#region src/view-props.d.ts
type TIssueLayouts = "list" | "kanban" | "calendar" | "spreadsheet" | "gantt_chart";
type TIssueGroupByOptions = "state" | "priority" | "labels" | "created_by" | "state_detail.group" | "project" | "assignees" | "cycle" | "module" | "target_date" | "team_project" | null;
type TIssueOrderByOptions = "-created_at" | "created_at" | "updated_at" | "-updated_at" | "priority" | "-priority" | "sort_order" | "state__name" | "-state__name" | "assignees__first_name" | "-assignees__first_name" | "labels__name" | "-labels__name" | "issue_module__module__name" | "-issue_module__module__name" | "issue_cycle__cycle__name" | "-issue_cycle__cycle__name" | "target_date" | "-target_date" | "estimate_point__key" | "-estimate_point__key" | "start_date" | "-start_date" | "link_count" | "-link_count" | "attachment_count" | "-attachment_count" | "sub_issues_count" | "-sub_issues_count";
type TIssueGroupingFilters = "active" | "backlog";
type TIssueExtraOptions = "show_empty_groups" | "sub_issue";
type TIssueParams = "priority" | "state_group" | "state" | "assignees" | "mentions" | "created_by" | "subscriber" | "labels" | "cycle" | "module" | "start_date" | "target_date" | "project" | "team_project" | "group_by" | "sub_group_by" | "order_by" | "type" | "sub_issue" | "show_empty_groups" | "cursor" | "per_page" | "issue_type" | "layout" | "expand" | "filters";
type TCalendarLayouts = "month" | "week";
/**
 * Keys for the work item filter properties
 */
declare const WORK_ITEM_FILTER_PROPERTY_KEYS: readonly ["state_group", "priority", "start_date", "target_date", "assignee_id", "mention_id", "created_by_id", "subscriber_id", "label_id", "state_id", "cycle_id", "module_id", "project_id", "created_at", "updated_at"];
type TWorkItemFilterProperty = (typeof WORK_ITEM_FILTER_PROPERTY_KEYS)[number];
type TWorkItemFilterConditionKey = `${TWorkItemFilterProperty}__${TSupportedOperators}`;
type TWorkItemFilterConditionData = Partial<{ [K in TWorkItemFilterConditionKey]: string | boolean | number }>;
type TWorkItemFilterAndGroup = {
  [LOGICAL_OPERATOR.AND]: TWorkItemFilterConditionData[];
};
type TWorkItemFilterGroup = TWorkItemFilterAndGroup;
type TWorkItemFilterExpressionData = TWorkItemFilterConditionData | TWorkItemFilterGroup;
type TWorkItemFilterExpression = CompleteOrEmpty<TWorkItemFilterExpressionData>;
interface IIssueFilterOptions {
  assignees?: string[] | null;
  mentions?: string[] | null;
  created_by?: string[] | null;
  labels?: string[] | null;
  priority?: string[] | null;
  cycle?: string[] | null;
  module?: string[] | null;
  project?: string[] | null;
  team_project?: string[] | null;
  start_date?: string[] | null;
  state?: string[] | null;
  state_group?: string[] | null;
  subscriber?: string[] | null;
  target_date?: string[] | null;
  issue_type?: string[] | null;
}
interface IIssueDisplayFilterOptions {
  calendar?: {
    show_weekends?: boolean;
    layout?: TCalendarLayouts;
  };
  group_by?: TIssueGroupByOptions;
  sub_group_by?: TIssueGroupByOptions;
  layout?: any;
  order_by?: TIssueOrderByOptions;
  show_empty_groups?: boolean;
  sub_issue?: boolean;
}
interface IIssueDisplayProperties {
  assignee?: boolean;
  start_date?: boolean;
  due_date?: boolean;
  labels?: boolean;
  key?: boolean;
  priority?: boolean;
  state?: boolean;
  sub_issue_count?: boolean;
  link?: boolean;
  attachment_count?: boolean;
  estimate?: boolean;
  created_on?: boolean;
  updated_on?: boolean;
  modules?: boolean;
  cycle?: boolean;
  issue_type?: boolean;
}
type TIssueKanbanFilters = {
  group_by: string[];
  sub_group_by: string[];
};
interface IIssueFilters {
  richFilters: TWorkItemFilterExpression;
  displayFilters: IIssueDisplayFilterOptions | undefined;
  displayProperties: IIssueDisplayProperties | undefined;
  kanbanFilters: TIssueKanbanFilters | undefined;
}
type TSupportedFilterForUpdate = IIssueDisplayFilterOptions | IIssueDisplayProperties | TIssueKanbanFilters;
interface ISubWorkItemFilters extends Omit<IIssueFilters, "richFilters"> {
  filters: IIssueFilterOptions;
}
interface IIssueFiltersResponse {
  rich_filters: TWorkItemFilterExpression;
  display_filters: IIssueDisplayFilterOptions;
  display_properties: IIssueDisplayProperties;
}
interface IProjectUserPropertiesResponse extends IIssueFiltersResponse {
  sort_order: number;
  preferences: {
    pages: {
      block_display: boolean;
    };
    navigation: IProjectMemberNavigationPreferences;
  };
}
interface IWorkspaceUserPropertiesResponse extends IIssueFiltersResponse {
  navigation_project_limit?: number;
  navigation_control_preference?: "ACCORDION" | "TABBED";
}
interface IWorkspaceIssueFilterOptions {
  assignees?: string[] | null;
  created_by?: string[] | null;
  labels?: string[] | null;
  priority?: string[] | null;
  state_group?: string[] | null;
  subscriber?: string[] | null;
  start_date?: string[] | null;
  target_date?: string[] | null;
  project?: string[] | null;
}
interface IWorkspaceViewIssuesParams {
  assignees?: string | undefined;
  created_by?: string | undefined;
  labels?: string | undefined;
  priority?: string | undefined;
  start_date?: string | undefined;
  state?: string | undefined;
  state_group?: string | undefined;
  subscriber?: string | undefined;
  target_date?: string | undefined;
  project?: string | undefined;
  order_by?: string | undefined;
  sub_issue?: boolean;
}
interface IProjectViewProps {
  rich_filters: TWorkItemFilterExpression;
  display_filters: IIssueDisplayFilterOptions | undefined;
}
interface IWorkspaceViewProps {
  rich_filters: TWorkItemFilterExpression;
  display_filters: IIssueDisplayFilterOptions | undefined;
  display_properties: IIssueDisplayProperties;
}
interface IssuePaginationOptions {
  canGroup: boolean;
  perPageCount: number;
  before?: string;
  after?: string;
  groupedBy?: TIssueGroupByOptions;
  subGroupedBy?: TIssueGroupByOptions;
  orderBy?: TIssueOrderByOptions;
}
type TSpreadsheetColumn = React.FC<{
  issue: TIssue;
  onClose: () => void;
  onChange: (issue: TIssue, data: Partial<TIssue>, updates: any) => void;
  disabled: boolean;
}>;
//#endregion
//#region src/module/modules.d.ts
type TModuleStatus = "backlog" | "planned" | "in-progress" | "paused" | "completed" | "cancelled";
type TModuleCompletionChartDistribution = {
  [key: string]: number | null;
};
type TModuleDistributionBase = {
  total_issues: number;
  pending_issues: number;
  completed_issues: number;
};
type TModuleEstimateDistributionBase = {
  total_estimates: number;
  pending_estimates: number;
  completed_estimates: number;
};
type TModuleAssigneesDistribution = {
  assignee_id: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
};
type TModuleLabelsDistribution = {
  color: string | null;
  label_id: string | null;
  label_name: string | null;
};
type TModuleDistribution = {
  assignees: (TModuleAssigneesDistribution & TModuleDistributionBase)[];
  completion_chart: TModuleCompletionChartDistribution;
  labels: (TModuleLabelsDistribution & TModuleDistributionBase)[];
};
type TModuleEstimateDistribution = {
  assignees: (TModuleAssigneesDistribution & TModuleEstimateDistributionBase)[];
  completion_chart: TModuleCompletionChartDistribution;
  labels: (TModuleLabelsDistribution & TModuleEstimateDistributionBase)[];
};
interface IModule {
  total_issues: number;
  completed_issues: number;
  backlog_issues: number;
  started_issues: number;
  unstarted_issues: number;
  cancelled_issues: number;
  total_estimate_points?: number;
  completed_estimate_points?: number;
  backlog_estimate_points: number;
  started_estimate_points: number;
  unstarted_estimate_points: number;
  cancelled_estimate_points: number;
  distribution?: TModuleDistribution;
  estimate_distribution?: TModuleEstimateDistribution;
  id: string;
  name: string;
  description: string;
  description_text: any;
  description_html: any;
  workspace_id: string;
  project_id: string;
  lead_id: string | null;
  member_ids: string[];
  link_module?: ILinkDetails[];
  sub_issues?: number;
  is_favorite: boolean;
  sort_order: number;
  view_props: {
    filters: IIssueFilterOptions;
  };
  status?: TModuleStatus;
  archived_at: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}
interface ModuleIssueResponse {
  created_at: Date;
  created_by: string;
  id: string;
  issue: string;
  issue_detail: TIssue;
  module: string;
  module_detail: IModule;
  project: string;
  updated_at: Date;
  updated_by: string;
  workspace: string;
  sub_issues_count: number;
}
type ModuleLink = {
  title: string;
  url: string;
};
type SelectModuleType = (IModule & {
  actionType: "edit" | "delete" | "create-issue";
}) | undefined;
type TModulePlotType = "burndown" | "points";
type TPublicModule = {
  id: string;
  name: string;
};
//#endregion
//#region src/issues.d.ts
interface IIssueCycle {
  id: string;
  cycle_detail: ICycle;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  issue: string;
  cycle: string;
}
interface IIssueModule {
  created_at: Date;
  created_by: string;
  id: string;
  issue: string;
  module: string;
  module_detail: IModule;
  project: string;
  updated_at: Date;
  updated_by: string;
  workspace: string;
}
interface ILinkDetails {
  created_at: Date;
  created_by: string;
  id: string;
  metadata: any;
  title: string;
  url: string;
}
interface ISubIssueResponse {
  state_distribution: Record<TStateGroups, number>;
  sub_issues: TIssue[];
}
interface IIssueLabel {
  id: string;
  name: string;
  color: string;
  project_id: string;
  workspace_id: string;
  parent: string | null;
  sort_order: number;
}
interface IIssueLabelTree extends IIssueLabel {
  children: IIssueLabel[] | undefined;
}
interface IIssueActivity {
  access?: "EXTERNAL" | "INTERNAL";
  actor: string;
  actor_detail: IUserLite;
  attachments: any[];
  comment?: string;
  comment_html?: string;
  comment_stripped?: string;
  created_at: Date;
  created_by: string;
  field: string | null;
  id: string;
  issue: string | null;
  issue_comment?: string | null;
  issue_detail: {
    description_html: string;
    id: string;
    name: string;
    priority: string | null;
    sequence_id: string;
    type_id: string;
  } | null;
  new_identifier: string | null;
  new_value: string | null;
  old_identifier: string | null;
  old_value: string | null;
  project: string;
  project_detail: IProjectLite;
  updated_at: Date;
  updated_by: string;
  verb: string;
  workspace: string;
  workspace_detail?: IWorkspaceLite;
}
type TIssuePriorities = "urgent" | "high" | "medium" | "low" | "none";
interface ViewFlags {
  enableQuickAdd: boolean;
  enableIssueCreation: boolean;
  enableInlineEditing: boolean;
}
type GroupByColumnTypes = "project" | "cycle" | "module" | "state" | "state_detail.group" | "priority" | "labels" | "assignees" | "created_by" | "team_project";
type TGetColumns = {
  isWorkspaceLevel?: boolean;
  projectId?: string;
};
interface IGroupByColumn {
  id: string;
  name: string;
  icon?: React.ReactElement | undefined;
  payload: Partial<TIssue>;
  isDropDisabled?: boolean;
  dropErrorMessage?: string;
}
interface IIssueMap {
  [key: string]: TIssue;
}
interface ILayoutDisplayFiltersOptions {
  display_properties: (keyof IIssueDisplayProperties)[];
  display_filters: {
    group_by?: TIssueGroupByOptions[];
    sub_group_by?: TIssueGroupByOptions[];
    order_by?: TIssueOrderByOptions[];
    type?: TIssueGroupingFilters[];
  };
  extra_options: {
    access: boolean;
    values: TIssueExtraOptions[];
  };
}
//#endregion
//#region src/editor/editor-content.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
/**
 * Editor content types - locally defined to avoid external dependencies
 */
type JSONContent = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: {
    type: string;
    attrs?: Record<string, unknown>;
    [key: string]: unknown;
  }[];
  text?: string;
  [key: string]: unknown;
};
type HTMLContent = string;
type Content = HTMLContent | JSONContent | JSONContent[] | null;
//#endregion
//#region src/file.d.ts
type TFileMetaDataLite = {
  name: string;
  size: number;
  type: string;
};
type TFileEntityInfo = {
  entity_identifier: string;
  entity_type: EFileAssetType;
};
type TFileMetaData = TFileMetaDataLite & TFileEntityInfo;
type TFileSignedURLResponse = {
  asset_id: string;
  asset_url: string;
  upload_data: {
    url: string;
    fields: {
      "Content-Type": string;
      key: string;
      "x-amz-algorithm": string;
      "x-amz-credential": string;
      "x-amz-date": string;
      policy: string;
      "x-amz-signature": string;
    };
  };
};
type TDuplicateAssetData = {
  entity_id: string;
  entity_type: EFileAssetType;
  project_id?: string;
  asset_ids: string[];
};
type TDuplicateAssetResponse = Record<string, string>;
//#endregion
//#region src/inbox.d.ts
declare enum EInboxIssueCurrentTab {
  OPEN = "open",
  CLOSED = "closed",
}
type TInboxIssueCurrentTab = EInboxIssueCurrentTab;
declare enum EInboxIssueStatus {
  PENDING = -2,
  DECLINED = -1,
  SNOOZED = 0,
  ACCEPTED = 1,
  DUPLICATE = 2,
}
declare enum EInboxIssueSource {
  IN_APP = "IN_APP",
  FORMS = "FORMS",
  EMAIL = "EMAIL",
}
type TInboxIssueStatus = EInboxIssueStatus;
type TInboxIssue = {
  id: string;
  status: TInboxIssueStatus;
  snoozed_till: Date | null;
  duplicate_to: string | undefined;
  source: EInboxIssueSource | undefined;
  issue: TIssue;
  created_by: string;
  duplicate_issue_detail: TInboxDuplicateIssueDetails | undefined;
};
type TInboxIssueFilterMemberKeys = "assignees" | "created_by";
type TInboxIssueFilterDateKeys = "created_at" | "updated_at";
type TInboxIssueFilter = { [key in TInboxIssueFilterMemberKeys]: string[] | undefined } & { [key in TInboxIssueFilterDateKeys]: string[] | undefined } & {
  state: string[] | undefined;
  status: TInboxIssueStatus[] | undefined;
  priority: TIssuePriorities[] | undefined;
  labels: string[] | undefined;
};
type TInboxIssueSortingKeys = "order_by" | "sort_by";
type TInboxIssueSortingOrderByKeys = "issue__created_at" | "issue__updated_at" | "issue__sequence_id";
type TInboxIssueSortingSortByKeys = "asc" | "desc";
type TInboxIssueSorting = {
  order_by: TInboxIssueSortingOrderByKeys | undefined;
  sort_by: TInboxIssueSortingSortByKeys | undefined;
};
type TInboxIssueSortingOrderByQueryParamKeys = "issue__created_at" | "-issue__created_at" | "issue__updated_at" | "-issue__updated_at" | "issue__sequence_id" | "-issue__sequence_id";
type TInboxIssueSortingOrderByQueryParam = {
  order_by: TInboxIssueSortingOrderByQueryParamKeys;
};
type TInboxIssuesQueryParams = { [key in keyof TInboxIssueFilter]: string } & TInboxIssueSortingOrderByQueryParam & {
  per_page: number;
  cursor: string;
};
type TInboxDuplicateIssueDetails = {
  id: string;
  sequence_id: string;
  name: string;
};
type TInboxIssuePaginationInfo = TPaginationInfo & {
  total_results: number;
};
type TInboxIssueWithPagination = TInboxIssuePaginationInfo & {
  results: TInboxIssue[];
};
type TAnchors = {
  [key: string]: string;
};
type TInboxForm = {
  anchors: TAnchors;
  id: string;
  is_in_app_enabled: boolean;
  is_form_enabled: boolean;
};
type TInboxIssueForm = {
  name: string;
  description: string;
  username: string;
  email: string;
};
//#endregion
//#region src/issues/activity/issue_activity.d.ts
type TIssueActivity = {
  id: string;
  workspace: string;
  workspace_detail: TIssueActivityWorkspaceDetail;
  project: string;
  project_detail: TIssueActivityProjectDetail;
  issue: string;
  issue_detail: TIssueActivityIssueDetail;
  actor: string;
  actor_detail: TIssueActivityUserDetail;
  created_at: string;
  updated_at: string;
  created_by: string | undefined;
  updated_by: string | undefined;
  attachments: any[];
  verb: string;
  field: string | undefined;
  old_value: string | undefined;
  new_value: string | undefined;
  comment: string | undefined;
  old_identifier: string | undefined;
  new_identifier: string | undefined;
  epoch: number;
  issue_comment: string | null;
  source_data: {
    source: EInboxIssueSource;
    source_email?: string;
    extra: {
      username?: string;
    };
  };
};
type TIssueActivityMap = {
  [issue_id: string]: TIssueActivity;
};
type TIssueActivityIdMap = {
  [issue_id: string]: string[];
};
//#endregion
//#region src/issues/activity/issue_comment_reaction.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TIssueCommentReaction = {
  id: string;
  comment: string;
  actor: string;
  reaction: string;
  workspace: string;
  project: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  display_name: string;
};
type TIssueCommentReactionMap = {
  [reaction_id: string]: TIssueCommentReaction;
};
type TIssueCommentReactionIdMap = {
  [comment_id: string]: {
    [reaction: string]: string[];
  };
};
//#endregion
//#region src/issues/activity/base.d.ts
type TIssueActivityWorkspaceDetail = {
  name: string;
  slug: string;
  id: string;
};
type TIssueActivityProjectDetail = {
  id: string;
  identifier: string;
  name: string;
  cover_image: string;
  description: string | null;
  emoji: string | null;
  icon_prop: {
    name: string;
    color: string;
  } | null;
};
type TIssueActivityIssueDetail = {
  id: string;
  sequence_id: number;
  sort_order: boolean;
  name: string;
  description_html: string;
  priority: TIssuePriorities;
  start_date: string;
  target_date: string;
  is_draft: boolean;
};
type TIssueActivityUserDetail = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  is_bot: boolean;
  display_name: string;
};
type TIssueActivityComment = {
  id: string;
  activity_type: "COMMENT";
  created_at?: string;
} | {
  id: string;
  activity_type: "ACTIVITY";
  created_at?: string;
} | {
  id: string;
  activity_type: "STATE";
  created_at?: string;
} | {
  id: string;
  activity_type: "ASSIGNEE";
  created_at?: string;
} | {
  id: string;
  activity_type: "DEFAULT";
  created_at?: string;
} | {
  id: string;
  activity_type: "WORKLOG";
  created_at?: string;
} | {
  id: string;
  activity_type: "ISSUE_ADDITIONAL_PROPERTIES_ACTIVITY";
  created_at?: string;
};
//#endregion
//#region src/issues/activity/issue_comment.d.ts
type TCommentReaction = {
  id: string;
  reaction: string;
  actor: string;
  actor_detail: IUserLite;
};
type TIssueComment = {
  id: string;
  workspace: string;
  workspace_detail: TIssueActivityWorkspaceDetail;
  project: string;
  project_detail: TIssueActivityProjectDetail;
  issue: string;
  issue_detail: TIssueActivityIssueDetail;
  actor: string;
  actor_detail: TIssueActivityUserDetail;
  created_at: string;
  edited_at?: string | undefined;
  updated_at: string;
  created_by: string | undefined;
  updated_by: string | undefined;
  attachments: any[];
  comment_reactions: any[];
  comment_stripped: string;
  comment_html: string;
  comment_json: JSONContent;
  external_id: string | undefined;
  external_source: string | undefined;
  access: EIssueCommentAccessSpecifier;
};
type TCommentsOperations = {
  copyCommentLink: (commentId: string) => void;
  createComment: (data: Partial<TIssueComment>) => Promise<Partial<TIssueComment> | undefined>;
  updateComment: (commentId: string, data: Partial<TIssueComment>) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  uploadCommentAsset: (blockId: string, file: File, commentId?: string) => Promise<TFileSignedURLResponse>;
  duplicateCommentAsset: (assetId: string, commentId?: string) => Promise<{
    asset_id: string;
  }>;
  addCommentReaction: (commentId: string, reactionEmoji: string) => Promise<void>;
  deleteCommentReaction: (commentId: string, reactionEmoji: string) => Promise<void>;
  react: (commentId: string, reactionEmoji: string, userReactions: string[]) => Promise<void>;
  reactionIds: (commentId: string) => {
    [reaction: string]: string[];
  } | undefined;
  userReactions: (commentId: string) => string[] | undefined;
  getReactionUsers: (reaction: string, reactionIds: Record<string, string[]>) => string;
};
type TIssueCommentMap = {
  [issue_id: string]: TIssueComment;
};
type TIssueCommentIdMap = {
  [issue_id: string]: string[];
};
interface ActorDetail {
  avatar_url?: string;
  display_name?: string;
  first_name?: string;
  is_bot?: boolean;
  id?: string;
  last_name?: string;
}
interface IssueDetail {
  id: string;
  name: string;
  description: Description;
  description_html: string;
  priority: string;
  start_date: null;
  target_date: null;
  sequence_id: number;
  sort_order: number;
}
interface Description {
  type: string;
  content: DescriptionContent[];
}
interface DescriptionContent {
  type: string;
  attrs?: Attrs;
  content: ContentContent[];
}
interface Attrs {
  level: number;
}
interface ContentContent {
  text: string;
  type: string;
}
interface ProjectDetail {
  id: string;
  identifier: string;
  name: string;
  cover_image: string;
  icon_prop: null;
  emoji: string;
  description: string;
}
type TIssuePublicComment = {
  actor_detail: ActorDetail;
  access: string;
  actor: string;
  attachments: any[];
  comment_html: string;
  comment_reactions: {
    actor_detail: ActorDetail;
    comment: string;
    id: string;
    reaction: string;
  }[];
  comment_stripped: string;
  created_at: Date;
  created_by: string;
  id: string;
  is_member: boolean;
  issue: string;
  issue_detail: IssueDetail;
  project: string;
  project_detail: ProjectDetail;
  updated_at: Date;
  updated_by: string;
  workspace: string;
  workspace_detail: IWorkspaceLite;
};
//#endregion
//#region src/issues/issue_attachment.d.ts
type TIssueAttachment = {
  id: string;
  attributes: {
    name: string;
    size: number;
  };
  asset_url: string;
  issue_id: string;
  updated_at: string;
  updated_by: string;
  created_by: string;
};
type TIssueAttachmentUploadResponse = TFileSignedURLResponse & {
  attachment: TIssueAttachment;
};
type TIssueAttachmentMap = {
  [issue_id: string]: TIssueAttachment;
};
type TIssueAttachmentIdMap = {
  [issue_id: string]: string[];
};
//#endregion
//#region src/issues/issue_link.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TIssueLinkEditableFields = {
  title: string;
  url: string;
};
type TIssueLink = TIssueLinkEditableFields & {
  created_by_id: string;
  id: string;
  metadata: any;
  issue_id: string;
  created_at: Date;
};
type TIssueLinkMap = {
  [issue_id: string]: TIssueLink;
};
type TIssueLinkIdMap = {
  [issue_id: string]: string[];
};
//#endregion
//#region src/issues/issue_reaction.d.ts
type TIssueReaction = {
  actor: string;
  id: string;
  issue: string;
  reaction: string;
  display_name: string;
};
interface IIssuePublicReaction {
  actor_details: IUserLite;
  reaction: string;
}
type TIssueReactionMap = {
  [reaction_id: string]: TIssueReaction;
};
type TIssueReactionIdMap = {
  [issue_id: string]: {
    [reaction: string]: string[];
  };
};
interface IPublicVote {
  vote: -1 | 1;
  actor_details: IUserLite;
}
//#endregion
//#region src/issues/issue_relation.d.ts
type TIssueRelation = Record<TIssueRelationTypes, TIssue[]>;
type TIssueRelationMap = {
  [issue_id: string]: Record<TIssueRelationTypes, string[]>;
};
type TIssueRelationIdMap = Record<TIssueRelationTypes, string[]>;
type TIssueRelationTypes = "blocking" | "blocked_by" | "duplicate" | "relates_to";
//#endregion
//#region src/issues/issue.d.ts
declare enum EIssueLayoutTypes {
  LIST = "list",
  KANBAN = "kanban",
  CALENDAR = "calendar",
  GANTT = "gantt_chart",
  SPREADSHEET = "spreadsheet",
}
declare enum EIssueServiceType {
  ISSUES = "issues",
  EPICS = "epics",
  WORK_ITEMS = "work-items",
}
declare enum EIssuesStoreType {
  GLOBAL = "GLOBAL",
  PROFILE = "PROFILE",
  TEAM = "TEAM",
  PROJECT = "PROJECT",
  CYCLE = "CYCLE",
  MODULE = "MODULE",
  TEAM_VIEW = "TEAM_VIEW",
  PROJECT_VIEW = "PROJECT_VIEW",
  ARCHIVED = "ARCHIVED",
  DEFAULT = "DEFAULT",
  WORKSPACE_DRAFT = "WORKSPACE_DRAFT",
  EPIC = "EPIC",
  TEAM_PROJECT_WORK_ITEMS = "TEAM_PROJECT_WORK_ITEMS",
}
type TBaseIssue = {
  id: string;
  sequence_id: number;
  name: string;
  sort_order: number;
  state_id: string | null;
  priority: TIssuePriorities | null;
  label_ids: string[];
  assignee_ids: string[];
  estimate_point: string | null;
  sub_issues_count: number;
  attachment_count: number;
  link_count: number;
  project_id: string | null;
  parent_id: string | null;
  cycle_id: string | null;
  module_ids: string[] | null;
  type_id: string | null;
  created_at: string;
  updated_at: string;
  start_date: string | null;
  target_date: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_by: string;
  updated_by: string;
  is_draft: boolean;
  is_epic?: boolean;
  is_intake?: boolean;
  social_case_nombre?: string | null;
  social_case_cedula?: string | null;
  social_case_foto_url?: string | null;
};
type IssueRelation = {
  id: string;
  name: string;
  project_id: string;
  relation_type: TIssueRelationTypes;
  sequence_id: number;
};
type TIssue = TBaseIssue & {
  description_html?: string;
  is_subscribed?: boolean;
  parent?: Partial<TBaseIssue>;
  issue_reactions?: TIssueReaction[];
  issue_attachments?: TIssueAttachment[];
  issue_link?: TIssueLink[];
  issue_relation?: IssueRelation[];
  issue_related?: IssueRelation[];
  tempId?: string;
  sourceIssueId?: string;
  state__group?: TStateGroups | null;
};
type TIssueMap = {
  [issue_id: string]: TIssue;
};
type TIssueResponseResults = TBaseIssue[] | {
  [key: string]: {
    results: TBaseIssue[] | {
      [key: string]: {
        results: TBaseIssue[];
        total_results: number;
      };
    };
    total_results: number;
  };
};
type TIssuesResponse = {
  grouped_by: string;
  next_cursor: string;
  prev_cursor: string;
  next_page_results: boolean;
  prev_page_results: boolean;
  total_count: number;
  count: number;
  total_pages: number;
  extra_stats: null;
  results: TIssueResponseResults;
  total_results: number;
};
type TBulkIssueProperties = Pick<TIssue, "state_id" | "priority" | "label_ids" | "assignee_ids" | "start_date" | "target_date" | "module_ids" | "cycle_id" | "estimate_point">;
type TBulkOperationsPayload = {
  issue_ids: string[];
  properties: Partial<TBulkIssueProperties>;
};
type TWorkItemWidgets = "sub-work-items" | "relations" | "links" | "attachments";
type TIssueServiceType = EIssueServiceType.ISSUES | EIssueServiceType.EPICS | EIssueServiceType.WORK_ITEMS;
interface IPublicIssue extends Pick<TIssue, "description_html" | "created_at" | "updated_at" | "created_by" | "id" | "name" | "priority" | "state_id" | "project_id" | "sequence_id" | "sort_order" | "start_date" | "target_date" | "cycle_id" | "module_ids" | "label_ids" | "assignee_ids" | "attachment_count" | "sub_issues_count" | "link_count" | "estimate_point"> {
  comments: TIssuePublicComment[];
  reaction_items: IIssuePublicReaction[];
  vote_items: IPublicVote[];
}
type TPublicIssueResponseResults = IPublicIssue[] | {
  [key: string]: {
    results: IPublicIssue[] | {
      [key: string]: {
        results: IPublicIssue[];
        total_results: number;
      };
    };
    total_results: number;
  };
};
type TPublicIssuesResponse = {
  grouped_by: string;
  next_cursor: string;
  prev_cursor: string;
  next_page_results: boolean;
  prev_page_results: boolean;
  total_count: number;
  count: number;
  total_pages: number;
  extra_stats: null;
  results: TPublicIssueResponseResults;
};
interface IWorkItemPeekOverview {
  embedIssue?: boolean;
  embedRemoveCurrentNotification?: () => void;
  is_draft?: boolean;
  storeType?: EIssuesStoreType;
}
//#endregion
//#region src/cycle/cycle.d.ts
type TCycleGroups = "current" | "upcoming" | "completed" | "draft";
type TCycleCompletionChartDistribution = {
  [key: string]: number | null;
};
type TCycleDistributionBase = {
  total_issues: number;
  pending_issues: number;
  completed_issues: number;
};
type TCycleEstimateDistributionBase = {
  total_estimates: number;
  pending_estimates: number;
  completed_estimates: number;
};
type TCycleAssigneesDistribution = {
  assignee_id: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
};
type TCycleLabelsDistribution = {
  color: string | null;
  label_id: string | null;
  label_name: string | null;
};
type TCycleDistribution = {
  assignees: (TCycleAssigneesDistribution & TCycleDistributionBase)[];
  completion_chart: TCycleCompletionChartDistribution;
  labels: (TCycleLabelsDistribution & TCycleDistributionBase)[];
};
type TCycleEstimateDistribution = {
  assignees: (TCycleAssigneesDistribution & TCycleEstimateDistributionBase)[];
  completion_chart: TCycleCompletionChartDistribution;
  labels: (TCycleLabelsDistribution & TCycleEstimateDistributionBase)[];
};
type TCycleProgress = {
  date: string;
  started: number;
  actual: number;
  pending: number;
  ideal: number | null;
  scope: number;
  completed: number;
  unstarted: number;
  backlog: number;
  cancelled: number;
};
type TProgressSnapshot = {
  total_issues: number;
  completed_issues: number;
  backlog_issues: number;
  started_issues: number;
  unstarted_issues: number;
  cancelled_issues: number;
  total_estimate_points?: number;
  completed_estimate_points?: number;
  backlog_estimate_points: number;
  started_estimate_points: number;
  unstarted_estimate_points: number;
  cancelled_estimate_points: number;
  distribution?: TCycleDistribution;
  estimate_distribution?: TCycleEstimateDistribution;
};
interface IProjectDetails {
  id: string;
}
interface ICycle extends TProgressSnapshot {
  progress_snapshot: TProgressSnapshot | undefined;
  created_at?: string;
  created_by?: string;
  description: string;
  end_date: string | null;
  id: string;
  is_favorite?: boolean;
  name: string;
  owned_by_id: string;
  project_id: string;
  status?: TCycleGroups;
  sort_order: number;
  start_date: string | null;
  sub_issues?: number;
  updated_at?: string;
  updated_by?: string;
  archived_at: string | null;
  assignee_ids?: string[];
  view_props: {
    filters: IIssueFilterOptions;
  };
  workspace_id: string;
  project_detail: IProjectDetails;
  progress: any[];
  version: number;
}
interface CycleIssueResponse {
  id: string;
  issue_detail: TIssue;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  issue: string;
  cycle: string;
  sub_issues_count: number;
}
type SelectCycleType = (ICycle & {
  actionType: "edit" | "delete" | "create-issue";
}) | undefined;
type CycleDateCheckData = {
  start_date: string;
  end_date: string;
  cycle_id?: string;
};
type TCycleEstimateType = "issues" | "points";
type TCyclePlotType = "burndown" | "burnup";
type TPublicCycle = {
  id: string;
  name: string;
  status: string;
};
type TProgressChartData = {
  date: string;
  scope: number;
  completed: number;
  backlog: number;
  started: number;
  unstarted: number;
  cancelled: number;
  pending: number;
  ideal: number;
  actual: number;
}[];
//#endregion
//#region src/workspace.d.ts
declare enum EUserWorkspaceRoles {
  ADMIN = 20,
  MEMBER = 15,
  GUEST = 5,
}
interface IWorkspace {
  readonly id: string;
  readonly owner: IUser;
  readonly created_at: Date;
  readonly updated_at: Date;
  name: string;
  url: string;
  logo_url: string | null;
  readonly total_members: number;
  readonly slug: string;
  readonly created_by: string;
  readonly updated_by: string;
  organization_size: string;
  total_projects?: number;
  role: number;
  timezone: string;
}
interface IWorkspaceLite {
  readonly id: string;
  name: string;
  slug: string;
}
interface IWorkspaceMemberInvitation {
  accepted: boolean;
  email: string;
  id: string;
  message: string;
  responded_at: Date;
  role: TUserPermissions;
  token: string;
  invite_link: string;
  workspace: {
    id: string;
    logo_url: string;
    name: string;
    slug: string;
  };
}
interface IWorkspaceBulkInviteFormData {
  emails: {
    email: string;
    role: TUserPermissions;
  }[];
}
type Properties = {
  assignee: boolean;
  start_date: boolean;
  due_date: boolean;
  labels: boolean;
  key: boolean;
  priority: boolean;
  state: boolean;
  sub_issue_count: boolean;
  link: boolean;
  attachment_count: boolean;
  estimate: boolean;
  created_on: boolean;
  updated_on: boolean;
};
interface IWorkspaceMember {
  id: string;
  member: IUserLite;
  role: TUserPermissions | EUserWorkspaceRoles;
  created_at?: string;
  avatar_url?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  joining_date?: string;
  display_name?: string;
  last_login_medium?: TLoginMediums;
  is_active?: boolean;
}
interface IWorkspaceMemberMe {
  company_role: string | null;
  created_at: Date;
  created_by: string;
  default_props: IWorkspaceViewProps;
  id: string;
  member: string;
  role: TUserPermissions | EUserWorkspaceRoles;
  updated_at: Date;
  updated_by: string;
  view_props: IWorkspaceViewProps;
  workspace: string;
  draft_issue_count: number;
}
interface ILastActiveWorkspaceDetails {
  workspace_details: IWorkspace;
  project_details?: TProjectMembership[];
}
interface IWorkspaceDefaultSearchResult {
  id: string;
  name: string;
  project_id: string;
  project__identifier: string;
  workspace__slug: string;
}
interface IWorkspaceSearchResult {
  id: string;
  name: string;
  slug: string;
}
interface IWorkspaceIssueSearchResult {
  id: string;
  name: string;
  project__identifier: string;
  project_id: string;
  sequence_id: number;
  social_case_cedula?: string | null;
  social_case_nombre?: string | null;
  workspace__slug: string;
  type_id: string;
}
interface IWorkspacePageSearchResult {
  id: string;
  name: string;
  project_ids: string[];
  project__identifiers: string[];
  workspace__slug: string;
}
interface IWorkspaceProjectSearchResult {
  id: string;
  identifier: string;
  name: string;
  workspace__slug: string;
}
interface IWorkspaceSearchResults {
  results: {
    workspace: IWorkspaceSearchResult[];
    project: IWorkspaceProjectSearchResult[];
    issue: IWorkspaceIssueSearchResult[];
    cycle: IWorkspaceDefaultSearchResult[];
    module: IWorkspaceDefaultSearchResult[];
    issue_view: IWorkspaceDefaultSearchResult[];
    page: IWorkspacePageSearchResult[];
  };
}
interface IProductUpdateResponse {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: {
    login: string;
    id: string;
    node_id: string;
    avatar_url: string;
    gravatar_id: "";
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: false;
  };
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: true;
  created_at: string;
  published_at: string;
  assets: [];
  tarball_url: string;
  zipball_url: string;
  body: string;
  reactions: {
    url: string;
    total_count: number;
    "+1": number;
    "-1": number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
}
interface IWorkspaceActiveCyclesResponse {
  count: number;
  extra_stats: null;
  next_cursor: string;
  next_page_results: boolean;
  prev_cursor: string;
  prev_page_results: boolean;
  results: ICycle[];
  total_pages: number;
}
interface IWorkspaceProgressResponse {
  completed_issues: number;
  total_issues: number;
  started_issues: number;
  cancelled_issues: number;
  unstarted_issues: number;
}
interface IWorkspaceAnalyticsResponse {
  completion_chart: Record<string, unknown>;
}
type TWorkspacePaginationInfo = TPaginationInfo & {
  results: IWorkspace[];
};
interface IWorkspaceSidebarNavigationItem {
  key?: string;
  is_pinned: boolean;
  sort_order: number;
}
interface IWorkspaceSidebarNavigation {
  [key: string]: IWorkspaceSidebarNavigationItem;
}
declare enum EOnboardingSteps {
  PROFILE_SETUP = "PROFILE_SETUP",
  ROLE_SETUP = "ROLE_SETUP",
  USE_CASE_SETUP = "USE_CASE_SETUP",
  WORKSPACE_CREATE_OR_JOIN = "WORKSPACE_CREATE_OR_JOIN",
  INVITE_MEMBERS = "INVITE_MEMBERS",
}
type TOnboardingStep = EOnboardingSteps;
declare enum ECreateOrJoinWorkspaceViews {
  WORKSPACE_CREATE = "WORKSPACE_CREATE",
  WORKSPACE_JOIN = "WORKSPACE_JOIN",
}
//#endregion
//#region src/project/projects.d.ts
declare enum EUserProjectRoles {
  ADMIN = 20,
  MEMBER = 15,
  GUEST = 5,
}
interface IPartialProject {
  id: string;
  name: string;
  identifier: string;
  sort_order: number | null;
  logo_props: TLogoProps;
  member_role?: TUserPermissions | EUserProjectRoles | null;
  archived_at: string | null;
  workspace: IWorkspace | string;
  cycle_view: boolean;
  issue_views_view: boolean;
  module_view: boolean;
  page_view: boolean;
  inbox_view: boolean;
  guest_view_all_features?: boolean;
  project_lead?: IUserLite | string | null;
  network?: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
  intake_count?: number;
}
interface IProject extends IPartialProject {
  archive_in?: number;
  close_in?: number;
  cover_image_asset?: null;
  cover_image?: string;
  readonly cover_image_url?: string;
  default_assignee?: IUser | string | null;
  default_state?: string | null;
  description?: string;
  estimate?: string | null;
  anchor?: string | null;
  is_favorite?: boolean;
  members?: string[];
  timezone?: string;
  next_work_item_sequence?: number;
}
type TProjectAnalyticsCountParams = {
  project_ids?: string;
  fields?: string;
};
type TProjectAnalyticsCount = Pick<IProject, "id"> & {
  total_issues?: number;
  completed_issues?: number;
  total_cycles?: number;
  total_members?: number;
  total_modules?: number;
};
interface IProjectLite {
  id: string;
  name: string;
  identifier: string;
  logo_props: TLogoProps;
}
interface IProjectMap {
  [id: string]: IProject;
}
interface IProjectMemberLite {
  id: string;
  member__avatar_url: string;
  member__display_name: string;
  member_id: string;
}
type TProjectMembership = {
  member: string;
  role: TUserPermissions | EUserProjectRoles;
} & ({
  id: string;
  original_role: EUserProjectRoles;
  created_at: string;
} | {
  id: null;
  original_role: null;
  created_at: null;
});
interface IProjectBulkAddFormData {
  members: {
    role: TUserPermissions | EUserProjectRoles;
    member_id: string;
  }[];
}
type IProjectMemberNavigationPreferences = {
  default_tab: string;
  hide_in_more_menu: string[];
};
type IProjectMemberPreferencesUpdate = {
  navigation: IProjectMemberNavigationPreferences;
};
type IProjectMemberPreferencesResponse = {
  preferences: {
    navigation: IProjectMemberNavigationPreferences;
  };
};
type IProjectMemberPreferencesFullResponse = IProjectMemberPreferencesResponse & {
  project_id: string;
  member_id: string;
  workspace_id: string;
};
interface IGithubRepository {
  id: string;
  full_name: string;
  html_url: string;
  url: string;
}
interface GithubRepositoriesResponse {
  repositories: IGithubRepository[];
  total_count: number;
}
type TProjectIssuesSearchParams = {
  search: string;
  parent?: boolean;
  issue_relation?: boolean;
  cycle?: boolean;
  module?: string;
  sub_issue?: boolean;
  issue_id?: string;
  workspace_search: boolean;
  target_date?: string;
  epic?: boolean;
};
interface ISearchIssueResponse {
  id: string;
  name: string;
  project_id: string;
  project__identifier: string;
  project__name: string;
  sequence_id: number;
  start_date: string | null;
  state__color: string;
  state__group: TStateGroups;
  state__name: string;
  workspace__slug: string;
  type_id: string;
}
type TPartialProject = IPartialProject;
type TProject = TPartialProject & IProject;
//#endregion
//#region src/project/project_link.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TProjectLinkEditableFields = {
  title: string;
  url: string;
};
type TProjectLink = TProjectLinkEditableFields & {
  created_by_id: string;
  id: string;
  metadata: any;
  project_id: string;
  created_at: Date;
};
type TProjectLinkMap = {
  [project_id: string]: TProjectLink;
};
type TProjectLinkIdMap = {
  [project_id: string]: string[];
};
//#endregion
//#region src/ai.d.ts
interface IGptResponse {
  response: string;
  response_html: string;
  count: number;
  project_detail: IProjectLite;
  workspace_detail: IWorkspaceLite;
}
//#endregion
//#region src/charts/common.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TChartColorScheme = "modern" | "horizon" | "earthen";
type TChartDatum = {
  key: string;
  name: string;
  count: number;
} & Record<string, number>;
type TChart = {
  data: TChartDatum[];
  schema: Record<string, string>;
};
//#endregion
//#region src/charts/index.d.ts
type TChartLegend = {
  align: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  layout: "horizontal" | "vertical";
  wrapperStyles?: React.CSSProperties;
};
type TChartMargin = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};
type TChartData<K$1 extends string, T extends string> = { [key in K$1]: string | number } & Record<T, any>;
type TBaseChartProps<K$1 extends string, T extends string> = {
  data: TChartData<K$1, T>[];
  className?: string;
  legend?: TChartLegend;
  margin?: TChartMargin;
  showTooltip?: boolean;
  customTooltipContent?: (props: {
    active?: boolean;
    label: string;
    payload: any;
  }) => React.ReactNode;
};
type TAxisChartProps<K$1 extends string, T extends string> = TBaseChartProps<K$1, T> & {
  xAxis: {
    key: keyof TChartData<K$1, T>;
    label?: string;
    strokeColor?: string;
    dy?: number;
  };
  yAxis: {
    allowDecimals?: boolean;
    domain?: [number, number];
    key: keyof TChartData<K$1, T>;
    label?: string;
    strokeColor?: string;
    offset?: number;
    dx?: number;
  };
  tickCount?: {
    x?: number;
    y?: number;
  };
  customTicks?: {
    x?: React.ComponentType<unknown>;
    y?: React.ComponentType<unknown>;
  };
};
type TBarChartShapeVariant = "bar" | "lollipop" | "lollipop-dotted";
type TBarItem<T extends string> = {
  key: T;
  label: string;
  fill: string | ((payload: any) => string);
  textClassName: string;
  showPercentage?: boolean;
  stackId: string;
  showTopBorderRadius?: (barKey: string, payload: any) => boolean;
  showBottomBorderRadius?: (barKey: string, payload: any) => boolean;
  shapeVariant?: TBarChartShapeVariant;
};
type TBarChartProps<K$1 extends string, T extends string> = TAxisChartProps<K$1, T> & {
  bars: TBarItem<T>[];
  barSize?: number;
};
type TLineItem<T extends string> = {
  key: T;
  label: string;
  dashedLine: boolean;
  fill: string;
  showDot: boolean;
  smoothCurves: boolean;
  stroke: string;
  style?: Record<string, string | number>;
};
type TLineChartProps<K$1 extends string, T extends string> = TAxisChartProps<K$1, T> & {
  lines: TLineItem<T>[];
};
type TScatterPointItem<T extends string> = {
  key: T;
  label: string;
  fill: string;
  stroke: string;
};
type TScatterChartProps<K$1 extends string, T extends string> = TAxisChartProps<K$1, T> & {
  scatterPoints: TScatterPointItem<T>[];
};
type TAreaItem<T extends string> = {
  key: T;
  label: string;
  stackId: string;
  fill: string;
  fillOpacity: number;
  showDot: boolean;
  smoothCurves: boolean;
  strokeColor: string;
  strokeOpacity: number;
  style?: Record<string, string | number>;
};
type TAreaChartProps<K$1 extends string, T extends string> = TAxisChartProps<K$1, T> & {
  areas: TAreaItem<T>[];
  comparisonLine?: {
    dashedLine: boolean;
    strokeColor: string;
  };
};
type TCellItem<T extends string> = {
  key: T;
  fill: string;
};
type TPieChartProps<K$1 extends string, T extends string> = Pick<TBaseChartProps<K$1, T>, "className" | "data" | "showTooltip" | "legend" | "margin"> & {
  dataKey: T;
  cells: TCellItem<T>[];
  innerRadius?: number | string;
  outerRadius?: number | string;
  cornerRadius?: number;
  paddingAngle?: number;
  showLabel: boolean;
  customLabel?: (value: any) => string;
  centerLabel?: {
    className?: string;
    fill: string;
    style?: React.CSSProperties;
    text?: string | number;
  };
  tooltipLabel?: string | ((payload: any) => string);
  customLegend?: (props: any) => React.ReactNode;
};
type TreeMapItem = {
  name: string;
  value: number;
  label?: string;
  textClassName?: string;
  icon?: React.ReactElement;
} & ({
  fillColor: string;
} | {
  fillClassName: string;
});
type TreeMapChartProps = {
  data: TreeMapItem[];
  className?: string;
  isAnimationActive?: boolean;
  showTooltip?: boolean;
};
type TTopSectionConfig = {
  showIcon: boolean;
  showName: boolean;
  nameTruncated: boolean;
};
type TBottomSectionConfig = {
  show: boolean;
  showValue: boolean;
  showLabel: boolean;
  labelTruncated: boolean;
};
type TContentVisibility = {
  top: TTopSectionConfig;
  bottom: TBottomSectionConfig;
};
type TRadarItem<T extends string> = {
  key: T;
  name: string;
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
  dot?: {
    r: number;
    fillOpacity: number;
  };
};
type TRadarChartProps<K$1 extends string, T extends string> = Pick<TBaseChartProps<K$1, T>, "className" | "showTooltip" | "margin" | "data" | "legend"> & {
  dataKey: T;
  radars: TRadarItem<T>[];
  angleAxis: {
    key: keyof TChartData<K$1, T>;
    label?: string;
    strokeColor?: string;
  };
};
//#endregion
//#region src/analytics.d.ts
declare enum ChartXAxisProperty {
  STATES = "STATES",
  STATE_GROUPS = "STATE_GROUPS",
  LABELS = "LABELS",
  ASSIGNEES = "ASSIGNEES",
  ESTIMATE_POINTS = "ESTIMATE_POINTS",
  CYCLES = "CYCLES",
  MODULES = "MODULES",
  PRIORITY = "PRIORITY",
  START_DATE = "START_DATE",
  TARGET_DATE = "TARGET_DATE",
  CREATED_AT = "CREATED_AT",
  COMPLETED_AT = "COMPLETED_AT",
  CREATED_BY = "CREATED_BY",
  WORK_ITEM_TYPES = "WORK_ITEM_TYPES",
  PROJECTS = "PROJECTS",
  EPICS = "EPICS",
}
declare enum ChartYAxisMetric {
  WORK_ITEM_COUNT = "WORK_ITEM_COUNT",
  ESTIMATE_POINT_COUNT = "ESTIMATE_POINT_COUNT",
  PENDING_WORK_ITEM_COUNT = "PENDING_WORK_ITEM_COUNT",
  COMPLETED_WORK_ITEM_COUNT = "COMPLETED_WORK_ITEM_COUNT",
  IN_PROGRESS_WORK_ITEM_COUNT = "IN_PROGRESS_WORK_ITEM_COUNT",
  WORK_ITEM_DUE_THIS_WEEK_COUNT = "WORK_ITEM_DUE_THIS_WEEK_COUNT",
  WORK_ITEM_DUE_TODAY_COUNT = "WORK_ITEM_DUE_TODAY_COUNT",
  BLOCKED_WORK_ITEM_COUNT = "BLOCKED_WORK_ITEM_COUNT",
  EPIC_WORK_ITEM_COUNT = "EPIC_WORK_ITEM_COUNT",
}
type TAnalyticsTabsBase = "overview" | "work-items";
type TAnalyticsGraphsBase = "projects" | "work-items" | "custom-work-items";
interface AnalyticsTab {
  key: TAnalyticsTabsBase;
  label: string;
  content: React.FC;
  isDisabled: boolean;
}
type TAnalyticsFilterParams = {
  project_ids?: string;
  cycle_id?: string;
  module_id?: string;
};
interface IAnalyticsResponse {
  [key: string]: any;
}
interface IAnalyticsResponseFields {
  count: number;
  filter_count: number;
}
interface IChartResponse {
  schema: Record<string, string>;
  data: TChartData<string, string>[];
}
interface WorkItemInsightColumns {
  project_id?: string;
  project__name?: string;
  cancelled_work_items: number;
  completed_work_items: number;
  backlog_work_items: number;
  un_started_work_items: number;
  started_work_items: number;
  display_name?: string;
  avatar_url?: string;
  assignee_id?: string;
}
type AnalyticsTableDataMap = {
  "work-items": WorkItemInsightColumns;
};
interface IAnalyticsParams {
  x_axis: ChartXAxisProperty;
  y_axis: ChartYAxisMetric;
  group_by?: ChartXAxisProperty;
}
//#endregion
//#region src/api_token.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
interface IApiToken {
  created_at: string;
  created_by: string;
  description: string;
  expired_at: string | null;
  id: string;
  is_active: boolean;
  label: string;
  last_used: string | null;
  updated_at: string;
  updated_by: string;
  user: string;
  user_type: number;
  token?: string;
  workspace: string;
}
//#endregion
//#region src/auth.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TEmailCheckTypes = "magic_code" | "password";
interface IEmailCheckData {
  email: string;
}
interface IEmailCheckResponse {
  status: "MAGIC_CODE" | "CREDENTIAL";
  existing: boolean;
  is_password_autoset: boolean;
}
interface ILoginTokenResponse {
  access_token: string;
  refresh_token: string;
}
interface IMagicSignInData {
  email: string;
  key: string;
  token: string;
}
interface IPasswordSignInData {
  email: string;
  password: string;
}
interface ICsrfTokenData {
  csrf_token: string;
}
//#endregion
//#region src/calendar.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
interface ICalendarRange {
  startDate: Date;
  endDate: Date;
}
interface ICalendarDate {
  date: Date;
  year: number;
  month: number;
  day: number;
  week: number;
  is_current_month: boolean;
  is_current_week: boolean;
  is_today: boolean;
}
interface ICalendarWeek {
  [date: string]: ICalendarDate;
}
interface ICalendarMonth {
  [monthIndex: string]: {
    [weekNumber: string]: ICalendarWeek;
  };
}
interface ICalendarPayload {
  [year: string]: ICalendarMonth;
}
//#endregion
//#region src/command-palette.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TCommandPaletteActionList = Record<string, {
  title: string;
  description: string;
  action: () => void;
}>;
type TCommandPaletteShortcutList = {
  key: string;
  title: string;
  shortcuts: TCommandPaletteShortcut[];
};
type TCommandPaletteShortcut = {
  keys: string;
  description: string;
};
//#endregion
//#region src/dashboard.d.ts
type TWidgetKeys = "overview_stats" | "assigned_issues" | "created_issues" | "issues_by_state_groups" | "issues_by_priority" | "recent_activity" | "recent_projects" | "recent_collaborators";
type TIssuesListTypes = "pending" | "upcoming" | "overdue" | "completed";
type TAssignedIssuesWidgetFilters = {
  custom_dates?: string[];
  duration?: EDurationFilters;
  tab?: TIssuesListTypes;
};
type TCreatedIssuesWidgetFilters = {
  custom_dates?: string[];
  duration?: EDurationFilters;
  tab?: TIssuesListTypes;
};
type TIssuesByStateGroupsWidgetFilters = {
  duration?: EDurationFilters;
  custom_dates?: string[];
};
type TIssuesByPriorityWidgetFilters = {
  custom_dates?: string[];
  duration?: EDurationFilters;
};
type TWidgetFiltersFormData = {
  widgetKey: "assigned_issues";
  filters: Partial<TAssignedIssuesWidgetFilters>;
} | {
  widgetKey: "created_issues";
  filters: Partial<TCreatedIssuesWidgetFilters>;
} | {
  widgetKey: "issues_by_state_groups";
  filters: Partial<TIssuesByStateGroupsWidgetFilters>;
} | {
  widgetKey: "issues_by_priority";
  filters: Partial<TIssuesByPriorityWidgetFilters>;
};
type TWidget = {
  id: string;
  is_visible: boolean;
  key: TWidgetKeys;
  readonly widget_filters:
  // only for read
  TAssignedIssuesWidgetFilters & TCreatedIssuesWidgetFilters & TIssuesByStateGroupsWidgetFilters & TIssuesByPriorityWidgetFilters;
  filters:
  // only for write
  TAssignedIssuesWidgetFilters & TCreatedIssuesWidgetFilters & TIssuesByStateGroupsWidgetFilters & TIssuesByPriorityWidgetFilters;
};
type TWidgetStatsRequestParams = {
  widget_key: TWidgetKeys;
} | {
  target_date: string;
  issue_type: TIssuesListTypes;
  widget_key: "assigned_issues";
  expand?: "issue_relation";
} | {
  target_date: string;
  issue_type: TIssuesListTypes;
  widget_key: "created_issues";
} | {
  target_date: string;
  widget_key: "issues_by_state_groups";
} | {
  target_date: string;
  widget_key: "issues_by_priority";
} | {
  cursor: string;
  per_page: number;
  search?: string;
  widget_key: "recent_collaborators";
};
type TWidgetIssue = TIssue & {
  issue_relation: {
    id: string;
    project_id: string;
    relation_type: TIssueRelationTypes;
    sequence_id: number;
    type_id: string | null;
  }[];
};
type TOverviewStatsWidgetResponse = {
  assigned_issues_count: number;
  completed_issues_count: number;
  created_issues_count: number;
  pending_issues_count: number;
};
type TAssignedIssuesWidgetResponse = {
  issues: TWidgetIssue[];
  count: number;
};
type TCreatedIssuesWidgetResponse = {
  issues: TWidgetIssue[];
  count: number;
};
type TIssuesByStateGroupsWidgetResponse = {
  count: number;
  state: TStateGroups;
};
type TIssuesByPriorityWidgetResponse = {
  count: number;
  priority: TIssuePriorities;
};
type TRecentActivityWidgetResponse = IIssueActivity;
type TRecentProjectsWidgetResponse = string[];
type TRecentCollaboratorsWidgetResponse = {
  active_issue_count: number;
  user_id: string;
};
type TWidgetStatsResponse = TOverviewStatsWidgetResponse | TIssuesByStateGroupsWidgetResponse[] | TIssuesByPriorityWidgetResponse[] | TAssignedIssuesWidgetResponse | TCreatedIssuesWidgetResponse | TRecentActivityWidgetResponse[] | TRecentProjectsWidgetResponse | TRecentCollaboratorsWidgetResponse[];
type TDeprecatedDashboard = {
  created_at: string;
  created_by: string | null;
  description_html: string;
  id: string;
  identifier: string | null;
  is_default: boolean;
  name: string;
  owned_by: string;
  type: string;
  updated_at: string;
  updated_by: string | null;
};
type THomeDashboardResponse = {
  dashboard: TDeprecatedDashboard;
  widgets: TWidget[];
};
//#endregion
//#region src/de-dupe.d.ts
type TDuplicateIssuePayload = {
  title: string;
  workspace_id: string;
  issue_id?: string | null;
  project_id?: string;
  description_stripped?: string;
};
type TDeDupeIssue = {
  id: string;
  type_id: string | null;
  project_id: string;
  sequence_id: number;
  name: string;
  priority: TIssuePriorities;
  state_id: string;
  created_by: string;
};
type TDuplicateIssueResponse = {
  dupes: TDeDupeIssue[];
};
//#endregion
//#region src/description_version.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TDescriptionVersion = {
  created_at: string;
  created_by: string | null;
  id: string;
  last_saved_at: string;
  owned_by: string;
  project: string;
  updated_at: string;
  updated_by: string | null;
};
type TDescriptionVersionDetails = TDescriptionVersion & {
  description_binary: string | null;
  description_html: string | null;
  description_json: object | null;
  description_stripped: string | null;
};
type TDescriptionVersionsListResponse = {
  cursor: string;
  next_cursor: string | null;
  next_page_results: boolean;
  page_count: number;
  prev_cursor: string | null;
  prev_page_results: boolean;
  results: TDescriptionVersion[];
  total_pages: number;
  total_results: number;
};
//#endregion
//#region src/epics.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TEpicAnalyticsGroup = "backlog_issues" | "unstarted_issues" | "started_issues" | "completed_issues" | "cancelled_issues" | "overdue_issues";
type TEpicAnalytics = {
  backlog_issues: number;
  unstarted_issues: number;
  started_issues: number;
  completed_issues: number;
  cancelled_issues: number;
  overdue_issues: number;
};
//#endregion
//#region src/estimate.d.ts
interface IEstimatePoint {
  id: string | undefined;
  key: number | undefined;
  value: string | undefined;
  description: string | undefined;
  workspace: string | undefined;
  project: string | undefined;
  estimate: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  created_by: string | undefined;
  updated_by: string | undefined;
}
type TEstimateSystemKeys = EEstimateSystem.POINTS | EEstimateSystem.CATEGORIES | EEstimateSystem.TIME;
interface IEstimate {
  id: string | undefined;
  name: string | undefined;
  description: string | undefined;
  type: TEstimateSystemKeys | undefined;
  points: IEstimatePoint[] | undefined;
  workspace: string | undefined;
  project: string | undefined;
  last_used: boolean | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  created_by: string | undefined;
  updated_by: string | undefined;
}
interface IEstimateFormData {
  estimate?: {
    name?: string;
    type?: string;
    last_used?: boolean;
  };
  estimate_points: {
    id?: string | undefined;
    key: number;
    value: string;
  }[];
}
type TEstimatePointsObject = {
  id?: string | undefined;
  key: number;
  value: string;
};
type TTemplateValues = {
  title: string;
  i18n_title: string;
  values: TEstimatePointsObject[];
  hide?: boolean;
};
type TEstimateSystem = {
  name: string;
  i18n_name: string;
  templates: Record<string, TTemplateValues>;
  is_available: boolean;
  is_ee: boolean;
};
type TEstimateSystems = { [K in TEstimateSystemKeys]: TEstimateSystem };
type TEstimateUpdateStageKeys = EEstimateUpdateStages.CREATE | EEstimateUpdateStages.EDIT | EEstimateUpdateStages.SWITCH;
type TEstimateTypeErrorObject = {
  oldValue: string;
  newValue: string;
  message: string | undefined;
};
type TEstimateTypeError = Record<number, TEstimateTypeErrorObject> | undefined;
//#endregion
//#region src/favorite/favorite.d.ts
type IFavorite = {
  id: string;
  name: string;
  entity_type: string;
  entity_data: {
    id?: string;
    name: string;
    logo_props?: TLogoProps | undefined;
  };
  is_folder: boolean;
  sort_order: number;
  parent: string | null;
  entity_identifier?: string | null;
  children: IFavorite[];
  project_id: string | null;
  sequence: number;
  workspace_id: string;
};
//#endregion
//#region src/home.d.ts
type TRecentActivityFilterKeys = "all item" | "issue" | "page" | "project" | "workspace_page";
type THomeWidgetKeys = "quick_links" | "recents" | "my_stickies" | "quick_tutorial" | "new_at_plane";
type THomeWidgetProps = {
  workspaceSlug: string;
};
type TPageEntityData = {
  id: string;
  name: string;
  logo_props: TLogoProps;
  project_id?: string;
  owned_by: string;
  project_identifier?: string;
};
type TProjectEntityData = {
  id: string;
  name: string;
  logo_props: TLogoProps;
  project_members: string[];
  identifier: string;
};
type TIssueEntityData = {
  id: string;
  name: string;
  state: string;
  priority: TIssuePriorities;
  assignees: string[];
  type: string | null;
  sequence_id: number;
  project_id: string;
  project_identifier: string;
  is_epic: boolean;
};
type TActivityEntityData = {
  id: string;
  entity_name: "page" | "project" | "issue" | "workspace_page";
  entity_identifier: string;
  visited_at: string;
  entity_data: TPageEntityData | TProjectEntityData | TIssueEntityData;
};
type TLinkEditableFields = {
  title: string;
  url: string;
};
type TLink = TLinkEditableFields & {
  created_by_id: string;
  id: string;
  metadata: any;
  workspace_slug: string;
  created_at: Date;
};
type TLinkMap = {
  [workspace_slug: string]: TLink;
};
type TLinkIdMap = {
  [workspace_slug: string]: string[];
};
type TWidgetEntityData = {
  key: THomeWidgetKeys;
  name: string;
  is_enabled: boolean;
  sort_order: number;
};
//#endregion
//#region src/importer/github-importer.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
interface IGithubServiceImportFormData {
  metadata: {
    owner: string;
    name: string;
    repository_id: number;
    url: string;
  };
  data: {
    users: {
      username: string;
      import: boolean | "invite" | "map";
      email: string;
    }[];
  };
  config: {
    sync: boolean;
  };
  project_id: string;
}
interface IGithubRepoCollaborator {
  avatar_url: string;
  html_url: string;
  id: number;
  login: string;
  url: string;
}
interface IGithubRepoInfo {
  issue_count: number;
  labels: number;
  collaborators: IGithubRepoCollaborator[];
}
//#endregion
//#region src/importer/jira-importer.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
interface IJiraImporterForm {
  metadata: IJiraMetadata;
  config: IJiraConfig;
  data: IJiraData;
  project_id: string;
}
interface IJiraConfig {
  epics_to_modules: boolean;
}
interface IJiraData {
  users: User[];
  invite_users: boolean;
  total_issues: number;
  total_labels: number;
  total_states: number;
  total_modules: number;
}
interface User {
  username: string;
  import: "invite" | "map" | false;
  email: string;
}
interface IJiraMetadata {
  cloud_hostname: string;
  api_token: string;
  project_key: string;
  email: string;
}
interface IJiraResponse {
  issues: number;
  modules: number;
  labels: number;
  states: number;
  users: IJiraResponseUser[];
}
interface IJiraResponseUser {
  self: string;
  accountId: string;
  accountType: string;
  emailAddress: string;
  avatarUrls: IJiraResponseAvatarUrls;
  displayName: string;
  active: boolean;
  locale: string;
}
interface IJiraResponseAvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}
//#endregion
//#region src/importer/index.d.ts
interface IImporterService {
  created_at: string;
  config: {
    sync: boolean;
  };
  created_by: string | null;
  data: {
    users: [];
  };
  id: string;
  initiated_by: string;
  initiated_by_detail: IUserLite;
  metadata: {
    name: string;
    owner: string;
    repository_id: number;
    url: string;
  };
  project: string;
  project_detail: IProjectLite;
  service: string;
  status: "processing" | "completed" | "failed";
  updated_at: string;
  updated_by: string;
  token: string;
  workspace: string;
}
interface IExportData {
  id: string;
  created_at: string;
  updated_at: string;
  project: string[];
  provider: string;
  status: string;
  url: string;
  token: string;
  created_by: string;
  updated_by: string;
  initiated_by_detail: IUserLite;
}
interface IExportServiceResponse {
  count: number;
  extra_stats: null;
  next_cursor: string;
  next_page_results: boolean;
  prev_cursor: string;
  prev_page_results: boolean;
  results: IExportData[];
  total_pages: number;
}
//#endregion
//#region src/integration.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
interface IAppIntegration {
  author: string;
  avatar_url: string | null;
  created_at: string;
  created_by: string | null;
  description: any;
  id: string;
  metadata: any;
  network: number;
  provider: string;
  redirect_url: string;
  title: string;
  updated_at: string;
  updated_by: string | null;
  verified: boolean;
  webhook_secret: string;
  webhook_url: string;
}
interface IWorkspaceIntegration {
  actor: string;
  api_token: string;
  config: any;
  created_at: string;
  created_by: string;
  id: string;
  integration: string;
  integration_detail: IAppIntegration;
  metadata: any;
  updated_at: string;
  updated_by: string;
  workspace: string;
}
interface ISlackIntegration {
  id: string;
  created_at: string;
  updated_at: string;
  access_token: string;
  scopes: string;
  bot_user_id: string;
  webhook_url: string;
  data: ISlackIntegrationData;
  team_id: string;
  team_name: string;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  workspace_integration: string;
}
interface ISlackIntegrationData {
  ok: boolean;
  team: {
    id: string;
    name: string;
  };
  scope: string;
  app_id: string;
  enterprise: any;
  token_type: string;
  authed_user: string;
  bot_user_id: string;
  access_token: string;
  incoming_webhook: {
    url: string;
    channel: string;
    channel_id: string;
    configuration_url: string;
  };
  is_enterprise_install: boolean;
}
//#endregion
//#region src/issues/issue_sub_issues.d.ts
type TSubIssuesStateDistribution = {
  backlog: string[];
  unstarted: string[];
  started: string[];
  completed: string[];
  cancelled: string[];
};
type TIssueSubIssues = {
  state_distribution: TSubIssuesStateDistribution;
  sub_issues: TSubIssueResponse;
};
type TSubIssueResponse = TIssue[] | {
  [key: string]: TIssue[];
};
type TIssueSubIssuesStateDistributionMap = {
  [issue_id: string]: TSubIssuesStateDistribution;
};
type TIssueSubIssuesIdMap = {
  [issue_id: string]: string[];
};
type TSubIssueOperations = {
  copyLink: (path: string) => void;
  fetchSubIssues: (workspaceSlug: string, projectId: string, parentIssueId: string) => Promise<void>;
  addSubIssue: (workspaceSlug: string, projectId: string, parentIssueId: string, issueIds: string[]) => Promise<void>;
  updateSubIssue: (workspaceSlug: string, projectId: string, parentIssueId: string, issueId: string, issueData: Partial<TIssue>, oldIssue?: Partial<TIssue>, fromModal?: boolean) => Promise<void>;
  removeSubIssue: (workspaceSlug: string, projectId: string, parentIssueId: string, issueId: string) => Promise<void>;
  deleteSubIssue: (workspaceSlug: string, projectId: string, parentIssueId: string, issueId: string) => Promise<void>;
};
//#endregion
//#region src/issues/base.d.ts
type TLoader = "init-loader" | "mutation" | "pagination" | "loaded" | undefined;
type TGroupedIssues = {
  [group_id: string]: string[];
};
type TSubGroupedIssues = {
  [sub_grouped_id: string]: TGroupedIssues;
};
type TIssues = TGroupedIssues | TSubGroupedIssues;
type TPaginationData = {
  nextCursor: string;
  prevCursor: string;
  nextPageResults: boolean;
};
type TIssuePaginationData = {
  [group_id: string]: TPaginationData;
};
type TGroupedIssueCount = {
  [group_id: string]: number;
};
type TUnGroupedIssues = string[];
//#endregion
//#region src/issues/issue-identifier.d.ts
type TIssueIdentifierSize = "xs" | "sm" | "md" | "lg";
type TIdentifierTextVariant = "default" | "secondary" | "tertiary" | "primary" | "primary-subtle" | "success";
type TIssueIdentifierBaseProps = {
  projectId: string;
  size?: TIssueIdentifierSize;
  variant?: TIdentifierTextVariant;
  displayProperties?: IIssueDisplayProperties | undefined;
  enableClickToCopyIdentifier?: boolean;
};
type TIssueIdentifierFromStore = TIssueIdentifierBaseProps & {
  issueId: string;
};
type TIssueIdentifierWithDetails = TIssueIdentifierBaseProps & {
  issueTypeId?: string | null;
  projectIdentifier: string;
  issueSequenceId: string | number;
};
type TIssueIdentifierProps = TIssueIdentifierFromStore | TIssueIdentifierWithDetails;
type TIssueTypeIdentifier = {
  issueTypeId: string;
  size?: TIssueIdentifierSize;
};
type TIdentifierTextProps = {
  identifier: string;
  enableClickToCopyIdentifier?: boolean;
  size?: TIssueIdentifierSize;
  variant?: TIdentifierTextVariant;
};
//#endregion
//#region src/layout/gantt.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
declare enum EGanttBlockType {
  EPIC = "epic",
  PROJECT = "project",
  ISSUE = "issue",
}
interface IGanttBlock {
  data: any;
  id: string;
  name: string;
  position?: {
    marginLeft: number;
    width: number;
  };
  sort_order: number | undefined;
  start_date: string | undefined;
  target_date: string | undefined;
  meta?: Record<string, any>;
}
interface IBlockUpdateData {
  sort_order?: {
    destinationIndex: number;
    newSortOrder: number;
    sourceIndex: number;
  };
  start_date?: string;
  target_date?: string;
  meta?: Record<string, any>;
}
interface IBlockUpdateDependencyData {
  id: string;
  start_date?: string;
  target_date?: string;
  meta?: Record<string, any>;
}
type TGanttViews = "week" | "month" | "quarter";
interface WeekMonthDataType {
  key: number;
  shortTitle: string;
  title: string;
  abbreviation: string;
}
interface ChartDataType {
  key: string;
  i18n_title: string;
  data: ChartDataTypeData;
}
interface ChartDataTypeData {
  startDate: Date;
  currentDate: Date;
  endDate: Date;
  approxFilterRange: number;
  dayWidth: number;
}
//#endregion
//#region src/page/extended.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TPageExtended = object;
//#endregion
//#region src/page/core.d.ts
type TPage = {
  access: EPageAccess | undefined;
  archived_at: string | null | undefined;
  color: string | undefined;
  created_at: Date | undefined;
  created_by: string | undefined;
  description_json: object | undefined;
  description_html: string | undefined;
  id: string | undefined;
  is_favorite: boolean;
  is_locked: boolean;
  label_ids: string[] | undefined;
  name: string | undefined;
  owned_by: string | undefined;
  project_ids?: string[] | undefined;
  updated_at: Date | undefined;
  updated_by: string | undefined;
  workspace: string | undefined;
  logo_props: TLogoProps | undefined;
  deleted_at: Date | undefined;
} & TPageExtended;
type TPageNavigationTabs = "public" | "private" | "archived";
type TPageFiltersSortKey = "name" | "created_at" | "updated_at" | "opened_at";
type TPageFiltersSortBy = "asc" | "desc";
type TPageFilterProps = {
  created_at?: string[] | null;
  created_by?: string[] | null;
  favorites?: boolean;
  labels?: string[] | null;
};
type TPageFilters = {
  searchQuery: string;
  sortKey: TPageFiltersSortKey;
  sortBy: TPageFiltersSortBy;
  filters?: TPageFilterProps;
};
type TPageEmbedType = "mention" | "issue";
type TPageVersion = {
  created_at: string;
  created_by: string;
  deleted_at: string | null;
  description_binary?: string | null;
  description_html?: string | null;
  description_json?: object;
  id: string;
  last_saved_at: string;
  owned_by: string;
  page: string;
  updated_at: string;
  updated_by: string;
  workspace: string;
};
type TDocumentPayload = {
  description_binary: string;
  description_html: string;
  description_json: object;
};
type TWebhookConnectionQueryParams = {
  documentType: "project_page" | "team_page" | "workspace_page";
  projectId?: string;
  teamId?: string;
  workspaceSlug: string;
};
//#endregion
//#region src/payment.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
declare enum EProductSubscriptionEnum {
  FREE = "FREE",
  ONE = "ONE",
  PRO = "PRO",
  BUSINESS = "BUSINESS",
  ENTERPRISE = "ENTERPRISE",
}
type TBillingFrequency = "month" | "year";
type IPaymentProductPrice = {
  currency: string;
  id: string;
  product: string;
  recurring: TBillingFrequency;
  unit_amount: number;
  workspace_amount: number;
};
type TProductSubscriptionType = "FREE" | "ONE" | "PRO" | "BUSINESS" | "ENTERPRISE";
type IPaymentProduct = {
  description: string;
  id: string;
  name: string;
  type: Omit<TProductSubscriptionType, "FREE">;
  payment_quantity: number;
  prices: IPaymentProductPrice[];
  is_active: boolean;
};
type TSubscriptionPrice = {
  key: string;
  id: string | undefined;
  currency: string;
  price: number;
  recurring: TBillingFrequency;
};
type TProductBillingFrequency = { [key in EProductSubscriptionEnum]: TBillingFrequency | undefined };
//#endregion
//#region src/pragmatic.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TDropTarget = {
  element: Element;
  data: Record<string | symbol, unknown>;
};
type TDropTargetMiscellaneousData = {
  dropEffect: string;
  isActiveDueToStickiness: boolean;
};
interface IPragmaticPayloadLocation {
  initial: {
    dropTargets: (TDropTarget & TDropTargetMiscellaneousData)[];
  };
  current: {
    dropTargets: (TDropTarget & TDropTargetMiscellaneousData)[];
  };
  previous: {
    dropTargets: (TDropTarget & TDropTargetMiscellaneousData)[];
  };
}
interface IPragmaticDropPayload {
  location: IPragmaticPayloadLocation;
  source: TDropTarget;
  self: TDropTarget & TDropTargetMiscellaneousData;
}
type InstructionType = "reparent" | "reorder-above" | "reorder-below" | "make-child" | "instruction-blocked";
//#endregion
//#region src/publish.d.ts
type TPublishEntityType = "project" | "page";
type TProjectPublishLayouts = "calendar" | "gantt" | "kanban" | "list" | "spreadsheet";
type TProjectPublishViewProps = {
  calendar?: boolean;
  gantt?: boolean;
  kanban?: boolean;
  list?: boolean;
  spreadsheet?: boolean;
};
type TProjectDetails = IProjectLite & Pick<IProject, "cover_image" | "logo_props" | "description">;
type TPublishSettings = {
  anchor: string | undefined;
  created_at: string | undefined;
  created_by: string | undefined;
  entity_identifier: string | undefined;
  entity_name: TPublishEntityType | undefined;
  id: string | undefined;
  inbox: unknown;
  is_comments_enabled: boolean;
  is_reactions_enabled: boolean;
  is_votes_enabled: boolean;
  project: string | undefined;
  project_details: TProjectDetails | undefined;
  updated_at: string | undefined;
  updated_by: string | undefined;
  workspace: string | undefined;
  workspace_detail: IWorkspaceLite | undefined;
};
type TProjectPublishSettings = TPublishSettings & {
  view_props: TProjectPublishViewProps | undefined;
};
//#endregion
//#region src/reaction.d.ts
interface IIssueReaction {
  actor: string;
  actor_detail: IUserLite;
  created_at: Date;
  created_by: string;
  id: string;
  issue: string;
  project: string;
  reaction: string;
  updated_at: Date;
  updated_by: string;
  workspace: string;
}
interface IssueReactionForm {
  reaction: string;
}
interface IssueCommentReaction {
  id: string;
  created_at: Date;
  updated_at: Date;
  reaction: string;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  actor: string;
  comment: string;
}
interface IssueCommentReactionForm {
  reaction: string;
}
//#endregion
//#region src/intake/state.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TIntakeStateGroups = "triage";
interface IIntakeState {
  readonly id: string;
  color: string;
  default: boolean;
  description: string;
  group: TIntakeStateGroups;
  name: string;
  project_id: string;
  sequence: number;
  workspace_id: string;
}
//#endregion
//#region src/search.d.ts
type TSearchEntities = "user_mention" | "issue" | "project" | "cycle" | "module" | "page";
type TUserSearchResponse = {
  member__avatar_url: IUser["avatar_url"];
  member__display_name: IUser["display_name"];
  member__id: IUser["id"];
};
type TProjectSearchResponse = {
  name: IProject["name"];
  id: IProject["id"];
  identifier: IProject["identifier"];
  logo_props: IProject["logo_props"];
  workspace__slug: IWorkspace["slug"];
};
type TIssueSearchResponse = {
  name: TIssue["name"];
  id: TIssue["id"];
  sequence_id: TIssue["sequence_id"];
  project__identifier: IProject["identifier"];
  project_id: TIssue["project_id"];
  priority: TIssue["priority"];
  state_id: TIssue["state_id"];
  type_id: TIssue["type_id"];
};
type TCycleSearchResponse = {
  name: ICycle["name"];
  id: ICycle["id"];
  project_id: ICycle["project_id"];
  project__identifier: IProject["identifier"];
  status: ICycle["status"];
  workspace__slug: IWorkspace["slug"];
};
type TModuleSearchResponse = {
  name: IModule["name"];
  id: IModule["id"];
  project_id: IModule["project_id"];
  project__identifier: IProject["identifier"];
  status: IModule["status"];
  workspace__slug: IWorkspace["slug"];
};
type TPageSearchResponse = {
  name: TPage["name"];
  id: TPage["id"];
  logo_props: TPage["logo_props"];
  projects__id: TPage["project_ids"];
  workspace__slug: IWorkspace["slug"];
};
type TSearchResponse = {
  cycle?: TCycleSearchResponse[];
  issue?: TIssueSearchResponse[];
  module?: TModuleSearchResponse[];
  page?: TPageSearchResponse[];
  project?: TProjectSearchResponse[];
  user_mention?: TUserSearchResponse[];
};
type TSearchEntityRequestPayload = {
  count: number;
  project_id?: string;
  query_type: TSearchEntities[];
  query: string;
  team_id?: string;
  issue_id?: string;
};
//#endregion
//#region src/settings.d.ts
type TProfileSettingsTabs = "general" | "preferences" | "activity" | "notifications" | "security" | "api-tokens";
type TWorkspaceSettingsTabs = "general" | "members" | "billing-and-plans" | "export" | "webhooks";
type TWorkspaceSettingsItem = {
  key: TWorkspaceSettingsTabs;
  i18n_label: string;
  href: string;
  access: EUserWorkspaceRoles[];
  highlight: (pathname: string, baseUrl: string) => boolean;
};
type TProjectSettingsTabs = "general" | "members" | "features_cycles" | "features_modules" | "features_views" | "features_pages" | "features_intake" | "states" | "labels" | "estimates" | "automations";
type TProjectSettingsItem = {
  key: TProjectSettingsTabs;
  i18n_label: string;
  href: string;
  access: EUserProjectRoles[];
  highlight: (pathname: string, baseUrl: string) => boolean;
};
//#endregion
//#region src/stickies.d.ts
type TSticky = {
  created_at?: string | undefined;
  created_by?: string | undefined;
  background_color?: string | null | undefined;
  description?: object | undefined;
  description_html?: string | undefined;
  id: string;
  logo_props: TLogoProps | undefined;
  name?: string;
  sort_order: number | undefined;
  updated_at?: string | undefined;
  updated_by?: string | undefined;
  workspace: string | undefined;
};
//#endregion
//#region src/timezone.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TTimezoneObject = {
  utc_offset: string;
  gmt_offset: string;
  label: string;
  value: string;
};
type TTimezones = {
  timezones: TTimezoneObject[];
};
//#endregion
//#region src/views.d.ts
declare enum EViewAccess {
  PRIVATE = 0,
  PUBLIC = 1,
}
interface IProjectView {
  id: string;
  access: EViewAccess;
  created_at: Date;
  updated_at: Date;
  is_favorite: boolean;
  created_by: string;
  updated_by: string;
  name: string;
  description: string;
  rich_filters: TWorkItemFilterExpression;
  display_filters: IIssueDisplayFilterOptions;
  display_properties: IIssueDisplayProperties;
  query: IIssueFilterOptions;
  query_data: IIssueFilterOptions;
  project: string;
  workspace: string;
  logo_props: TLogoProps | undefined;
  is_locked: boolean;
  anchor?: string;
  owned_by: string;
}
interface IPublishedProjectView extends Omit<IProjectView, "rich_filters"> {
  filters: IIssueFilterOptions;
}
type TPublishViewSettings = {
  is_comments_enabled: boolean;
  is_reactions_enabled: boolean;
  is_votes_enabled: boolean;
};
type TPublishViewDetails = TPublishViewSettings & {
  id: string;
  anchor: string;
};
type TViewFiltersSortKey = "name" | "created_at" | "updated_at";
type TViewFiltersSortBy = "asc" | "desc";
type TViewFilterProps = {
  created_at?: string[] | null;
  owned_by?: string[] | null;
  favorites?: boolean;
  view_type?: EViewAccess[];
};
type TViewFilters = {
  searchQuery: string;
  sortKey: TViewFiltersSortKey;
  sortBy: TViewFiltersSortBy;
  filters?: TViewFilterProps;
};
//#endregion
//#region src/waitlist.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
interface IWebWaitListResponse {
  status: string;
}
//#endregion
//#region src/webhook.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
interface IWebhook {
  created_at: string;
  cycle: boolean;
  id: string;
  is_active: boolean;
  issue: boolean;
  issue_comment: boolean;
  module: boolean;
  project: boolean;
  secret_key?: string;
  updated_at: string;
  url: string;
}
type TWebhookEventTypes = "all" | "individual";
//#endregion
//#region src/workspace-draft-issues/base.d.ts
type TWorkspaceDraftIssue = {
  id: string;
  name: string;
  sort_order: number;
  state_id: string | undefined;
  priority: TIssuePriorities | undefined;
  label_ids: string[];
  assignee_ids: string[];
  estimate_point: string | undefined;
  project_id: string | undefined;
  parent_id: string | undefined;
  cycle_id: string | undefined;
  module_ids: string[] | undefined;
  start_date: string | undefined;
  target_date: string | undefined;
  completed_at: string | undefined;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_draft: boolean;
  type_id: string;
};
type TWorkspaceDraftPaginationInfo<T> = {
  next_cursor: string | undefined;
  prev_cursor: string | undefined;
  next_page_results: boolean | undefined;
  prev_page_results: boolean | undefined;
  total_pages: number | undefined;
  count: number | undefined;
  total_count: number | undefined;
  total_results: number | undefined;
  results: T[] | undefined;
  extra_stats: string | undefined;
  grouped_by: string | undefined;
  sub_grouped_by: string | undefined;
};
type TWorkspaceDraftQueryParams = {
  per_page: number;
  cursor: string;
};
type TWorkspaceDraftIssueLoader = "init-loader" | "empty-state" | "mutation" | "pagination" | "loaded" | "create" | "update" | "delete" | "move" | undefined;
//#endregion
//#region src/workspace-notifications.d.ts
type TNotificationFilter = {
  type: { [key in ENotificationFilterType]: boolean };
  snoozed: boolean;
  archived: boolean;
  read: boolean;
};
type TNotificationIssueLite = {
  id: string | undefined;
  sequence_id: number | undefined;
  identifier: string | undefined;
  name: string | undefined;
  state_name: string | undefined;
  state_group: string | undefined;
};
type TNotificationData = {
  issue: TNotificationIssueLite | undefined;
  issue_activity: {
    id: string | undefined;
    actor: string | undefined;
    field: string | undefined;
    issue_comment: string | undefined;
    verb: "created" | "updated" | "deleted";
    new_value: string | undefined;
    old_value: string | undefined;
  };
};
type TNotification = {
  id: string;
  title: string | undefined;
  data: TNotificationData | undefined;
  entity_identifier: string | undefined;
  entity_name: string | undefined;
  message_html: string | undefined;
  message: undefined;
  message_stripped: undefined;
  sender: string | undefined;
  receiver: string | undefined;
  triggered_by: string | undefined;
  triggered_by_details: IUserLite | undefined;
  read_at: string | undefined;
  archived_at: string | undefined;
  snoozed_till: string | undefined;
  is_inbox_issue: boolean | undefined;
  is_mentioned_notification: boolean | undefined;
  workspace: string | undefined;
  project: string | undefined;
  created_at: string | undefined;
  updated_at: string | undefined;
  created_by: string | undefined;
  updated_by: string | undefined;
};
type TNotificationPaginatedInfoQueryParams = {
  type?: string | undefined;
  snoozed?: boolean;
  archived?: boolean;
  mentioned?: boolean;
  read?: boolean;
  per_page?: number;
  cursor?: string;
};
type TNotificationPaginatedInfo = {
  next_cursor: string | undefined;
  prev_cursor: string | undefined;
  next_page_results: boolean | undefined;
  prev_page_results: boolean | undefined;
  total_pages: number | undefined;
  extra_stats: string | undefined;
  count: number | undefined;
  total_count: number | undefined;
  results: TNotification[] | undefined;
  grouped_by: string | undefined;
  sub_grouped_by: string | undefined;
};
type TUnreadNotificationsCount = {
  total_unread_notifications_count: number;
  mention_unread_notifications_count: number;
};
type TNotificationLite = {
  workspace_slug: string | undefined;
  project_id: string | undefined;
  notification_id: string | undefined;
  issue_id: string | undefined;
  is_inbox_issue: boolean | undefined;
};
//#endregion
//#region src/workspace-views.d.ts
interface IWorkspaceView {
  id: string;
  access: EViewAccess;
  created_at: Date;
  updated_at: Date;
  is_favorite: boolean;
  created_by: string;
  updated_by: string;
  name: string;
  description: string;
  rich_filters: TWorkItemFilterExpression;
  display_filters: IIssueDisplayFilterOptions;
  display_properties: IIssueDisplayProperties;
  query: any;
  query_data: IWorkspaceViewProps;
  project: string;
  workspace: string;
  is_locked: boolean;
  owned_by: string;
  workspace_detail?: {
    id: string;
    name: string;
    slug: string;
  };
}
declare const STATIC_VIEW_TYPES: string[];
type TStaticViewTypes = (typeof STATIC_VIEW_TYPES)[number];
//#endregion
//#region src/base-layouts/base.d.ts
interface IBaseLayoutsBaseItem {
  id: string;
  [key: string]: unknown;
}
interface IBaseLayoutsBaseGroup {
  id: string;
  name: string;
  icon?: ReactNode;
  payload?: Record<string, unknown>;
  count?: number;
}
interface IDragDropHandlers<T extends IBaseLayoutsBaseItem> {
  enableDragDrop?: boolean;
  onDrop?: (sourceId: string, destinationId: string | null, sourceGroupId: string, destinationGroupId: string) => Promise<void>;
  canDrag?: (item: T) => boolean;
}
interface IItemRenderProps<T extends IBaseLayoutsBaseItem> {
  renderItem: (item: T, groupId: string) => ReactNode;
}
interface IGroupHeaderControls {
  isCollapsed: boolean;
  onToggleGroup: (groupId: string) => void;
}
interface IGroupHeaderProps extends IGroupHeaderControls {
  group: IBaseLayoutsBaseGroup;
  itemCount: number;
}
interface IGroupRenderProps {
  renderGroupHeader?: (props: IGroupHeaderProps) => ReactNode;
}
interface IRenderProps<T extends IBaseLayoutsBaseItem> extends IItemRenderProps<T>, IGroupRenderProps {}
type TBaseLayoutType = "list" | "kanban" | "gantt";
interface IBaseLayoutConfig {
  key: TBaseLayoutType;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}
interface IBaseLayoutsBaseProps<T extends IBaseLayoutsBaseItem> extends IDragDropHandlers<T>, IRenderProps<T> {
  items: Record<string, T>;
  groupedItemIds: Record<string, string[]>;
  groups: IBaseLayoutsBaseGroup[];
  collapsedGroups?: string[];
  onToggleGroup?: (groupId: string) => void;
  isLoading?: boolean;
  loadMoreItems?: (groupId: string) => void;
  showEmptyGroups?: boolean;
  className?: string;
}
interface IBaseLayoutsBaseGroupProps<T extends IBaseLayoutsBaseItem> extends IDragDropHandlers<T>, IRenderProps<T> {
  group: IBaseLayoutsBaseGroup;
  itemIds: string[];
  items: Record<string, T>;
  isCollapsed: boolean;
  onToggleGroup: (groupId: string) => void;
  loadMoreItems?: (groupId: string) => void;
}
interface IBaseLayoutsBaseItemProps<T extends IBaseLayoutsBaseItem> extends IDragDropHandlers<T>, IItemRenderProps<T> {
  item: T;
  index: number;
  groupId: string;
  isLast: boolean;
}
//#endregion
//#region src/base-layouts/list.d.ts
type IBaseLayoutsListItem = IBaseLayoutsBaseItem;
type IBaseLayoutsListProps<T extends IBaseLayoutsListItem> = IBaseLayoutsBaseProps<T>;
type IBaseLayoutsListGroupProps<T extends IBaseLayoutsListItem> = IBaseLayoutsBaseGroupProps<T>;
type IBaseLayoutsListItemProps<T extends IBaseLayoutsListItem> = IBaseLayoutsBaseItemProps<T>;
//#endregion
//#region src/base-layouts/kanban.d.ts
type IBaseLayoutsKanbanItem = IBaseLayoutsBaseItem;
interface IBaseLayoutsKanbanProps<T extends IBaseLayoutsKanbanItem> extends IBaseLayoutsBaseProps<T> {
  groupClassName?: string;
}
interface IBaseLayoutsKanbanGroupProps<T extends IBaseLayoutsKanbanItem> extends IBaseLayoutsBaseGroupProps<T> {
  groupClassName?: string;
}
type IBaseLayoutsKanbanItemProps<T extends IBaseLayoutsKanbanItem> = IBaseLayoutsBaseItemProps<T>;
//#endregion
//#region src/base-layouts/gantt/core.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
declare const CORE_GANTT_TIMELINE_TYPE: {
  readonly ISSUE: "ISSUE";
  readonly MODULE: "MODULE";
  readonly PROJECT: "PROJECT";
  readonly GROUPED: "GROUPED";
};
//#endregion
//#region src/base-layouts/gantt/extended.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
declare const EXTENDED_GANTT_TIMELINE_TYPE: {};
//#endregion
//#region src/base-layouts/gantt/index.d.ts
interface IBaseLayoutsGanttItem extends IBaseLayoutsBaseItem {
  start_date?: string | null;
  target_date?: string | null;
}
type TGanttBlockUpdateData = {
  start_date?: string;
  target_date?: string;
  sort_order?: {
    destinationIndex: number;
    newSortOrder: number;
  };
};
type TGanttDateUpdate = {
  id: string;
  start_date?: string;
  target_date?: string;
};
interface IGanttRenderProps<T extends IBaseLayoutsGanttItem> {
  renderBlock: (item: T) => ReactNode;
  renderSidebar?: (item: T) => ReactNode;
}
interface IGanttCapabilities {
  enableBlockLeftResize?: boolean | ((itemId: string) => boolean);
  enableBlockRightResize?: boolean | ((itemId: string) => boolean);
  enableBlockMove?: boolean | ((itemId: string) => boolean);
  enableReorder?: boolean | ((itemId: string) => boolean);
  enableAddBlock?: boolean | ((itemId: string) => boolean);
  enableSelection?: boolean | ((itemId: string) => boolean);
  enableDependency?: boolean | ((itemId: string) => boolean);
}
type TGanttDisplayOptions = {
  showAllBlocks?: boolean;
  showToday?: boolean;
  border?: boolean;
  title?: string;
  loaderTitle?: string;
  quickAdd?: ReactNode;
  timelineType?: TTimelineType;
};
interface IBaseLayoutsGanttProps<T extends IBaseLayoutsGanttItem> extends Omit<IBaseLayoutsBaseProps<T>, "renderItem" | "enableDragDrop" | "onDrop" | "canDrag">, IGanttRenderProps<T>, IGanttCapabilities, TGanttDisplayOptions {
  onBlockUpdate?: (item: T, payload: TGanttBlockUpdateData) => void | Promise<void>;
  onDateUpdate?: (updates: TGanttDateUpdate[]) => void | Promise<void>;
}
declare const GANTT_TIMELINE_TYPE: {
  readonly ISSUE: "ISSUE";
  readonly MODULE: "MODULE";
  readonly PROJECT: "PROJECT";
  readonly GROUPED: "GROUPED";
};
type TTimelineTypeCore = (typeof CORE_GANTT_TIMELINE_TYPE)[keyof typeof CORE_GANTT_TIMELINE_TYPE];
type TTimelineType = TTimelineTypeCore | (typeof EXTENDED_GANTT_TIMELINE_TYPE)[keyof typeof EXTENDED_GANTT_TIMELINE_TYPE];
//#endregion
//#region src/pagination.d.ts
/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
type TPaginatedResponse<T> = {
  results: T;
  grouped_by?: string | null;
  sub_grouped_by?: string | null;
  total_count?: number;
  next_cursor?: string;
  prev_cursor?: string;
  next_page_results?: boolean;
  prev_page_results?: boolean;
  count?: number;
  total_pages?: number;
  total_results?: number;
  extra_stats?: string | null;
};
//#endregion
export { ActorDetail, AnalyticsTab, AnalyticsTableDataMap, Attrs, COLLECTION_OPERATOR, COMPARISON_OPERATOR, CORE_COLLECTION_OPERATOR, CORE_COMPARISON_OPERATOR, CORE_EQUALITY_OPERATOR, CORE_FILTER_FIELD_TYPE, CORE_LOGICAL_OPERATOR, CORE_MULTI_VALUE_OPERATORS, CORE_OPERATORS, ChartDataType, ChartDataTypeData, ChartXAxisProperty, ChartYAxisMetric, CompleteOrEmpty, Content, ContentContent, CycleDateCheckData, CycleIssueResponse, Description, DescriptionContent, ECreateOrJoinWorkspaceViews, EDurationFilters, EEstimateSystem, EEstimateUpdateStages, EFileAssetType, EGanttBlockType, EInboxIssueCurrentTab, EInboxIssueSource, EInboxIssueStatus, EIssueCommentAccessSpecifier, EIssueLayoutTypes, EIssueServiceType, EIssuesStoreType, ENotificationFilterType, EOnboardingSteps, EPageAccess, EProductSubscriptionEnum, EProjectNetwork, EQUALITY_OPERATOR, EStartOfTheWeek, EUpdateStatus, EUserPermissions, EUserProjectRoles, EUserWorkspaceRoles, EViewAccess, EXTENDED_COLLECTION_OPERATOR, EXTENDED_COMPARISON_OPERATOR, EXTENDED_EQUALITY_OPERATOR, EXTENDED_FILTER_FIELD_TYPE, EXTENDED_LOGICAL_OPERATOR, EXTENDED_MULTI_VALUE_OPERATORS, EXTENDED_OPERATORS, FILTER_FIELD_TYPE, FILTER_NODE_TYPE, GANTT_TIMELINE_TYPE, GithubRepositoriesResponse, GroupByColumnTypes, HTMLContent, IAnalyticsParams, IAnalyticsResponse, IAnalyticsResponseFields, IApiToken, IAppIntegration, IBaseLayoutConfig, IBaseLayoutsBaseGroup, IBaseLayoutsBaseGroupProps, IBaseLayoutsBaseItem, IBaseLayoutsBaseItemProps, IBaseLayoutsBaseProps, IBaseLayoutsGanttItem, IBaseLayoutsGanttProps, IBaseLayoutsKanbanGroupProps, IBaseLayoutsKanbanItem, IBaseLayoutsKanbanItemProps, IBaseLayoutsKanbanProps, IBaseLayoutsListGroupProps, IBaseLayoutsListItem, IBaseLayoutsListItemProps, IBaseLayoutsListProps, IBlockUpdateData, IBlockUpdateDependencyData, ICalendarDate, ICalendarMonth, ICalendarPayload, ICalendarRange, ICalendarWeek, IChartResponse, ICsrfTokenData, ICustomSearchSelectOption, ICycle, IDragDropHandlers, IEmailCheckData, IEmailCheckResponse, IEstimate, IEstimateFormData, IEstimatePoint, IExportData, IExportServiceResponse, IFavorite, IFilterAdapter, IFilterOption, IFormattedInstanceConfiguration, IGanttBlock, IGanttCapabilities, IGanttRenderProps, IGithubRepoCollaborator, IGithubRepoInfo, IGithubRepository, IGithubServiceImportFormData, IGptResponse, IGroupByColumn, IGroupHeaderControls, IGroupHeaderProps, IGroupRenderProps, IImporterService, IInstance, IInstanceAdmin, IInstanceAdminStatus, IInstanceConfig, IInstanceConfiguration, IInstanceInfo, IIntakeState, IIssueActivity, IIssueCycle, IIssueDisplayFilterOptions, IIssueDisplayProperties, IIssueFilterOptions, IIssueFilters, IIssueFiltersResponse, IIssueLabel, IIssueLabelTree, IIssueMap, IIssueModule, IIssuePublicReaction, IIssueReaction, IItemRenderProps, IJiraConfig, IJiraData, IJiraImporterForm, IJiraMetadata, IJiraResponse, IJiraResponseAvatarUrls, IJiraResponseUser, ILastActiveWorkspaceDetails, ILayoutDisplayFiltersOptions, ILinkDetails, ILoginTokenResponse, IMagicSignInData, IModule, IPartialProject, IPasswordSignInData, IPaymentProduct, IPaymentProductPrice, IPragmaticDropPayload, IPragmaticPayloadLocation, IProductUpdateResponse, IProject, IProjectBulkAddFormData, IProjectDetails, IProjectLite, IProjectMap, IProjectMemberLite, IProjectMemberNavigationPreferences, IProjectMemberPreferencesFullResponse, IProjectMemberPreferencesResponse, IProjectMemberPreferencesUpdate, IProjectUserPropertiesResponse, IProjectView, IProjectViewProps, IPublicIssue, IPublicVote, IPublishedProjectView, IRenderProps, ISearchIssueResponse, ISlackIntegration, ISlackIntegrationData, IState, IStateLite, IStateResponse, ISubIssueResponse, ISubWorkItemFilters, IUser, IUserAccount, IUserActivity, IUserActivityResponse, IUserEmailNotificationSettings, IUserLite, IUserMemberLite, IUserPriorityDistribution, IUserProfileData, IUserProfileProjectSegregation, IUserProjectsRole, IUserSettings, IUserStateDistribution, IUserTheme, IWebWaitListResponse, IWebhook, IWorkItemPeekOverview, IWorkspace, IWorkspaceActiveCyclesResponse, IWorkspaceAnalyticsResponse, IWorkspaceBulkInviteFormData, IWorkspaceDefaultSearchResult, IWorkspaceIntegration, IWorkspaceIssueFilterOptions, IWorkspaceIssueSearchResult, IWorkspaceLite, IWorkspaceMember, IWorkspaceMemberInvitation, IWorkspaceMemberMe, IWorkspacePageSearchResult, IWorkspaceProgressResponse, IWorkspaceProjectSearchResult, IWorkspaceSearchResult, IWorkspaceSearchResults, IWorkspaceSidebarNavigation, IWorkspaceSidebarNavigationItem, IWorkspaceUserPropertiesResponse, IWorkspaceView, IWorkspaceViewIssuesParams, IWorkspaceViewProps, InstructionType, IssueCommentReaction, IssueCommentReactionForm, IssueDetail, IssuePaginationOptions, IssueReactionForm, JSONContent, LOGICAL_OPERATOR, MULTI_VALUE_OPERATORS, MakeOptional, ModuleIssueResponse, ModuleLink, PartialDeep, ProjectDetail, Properties, STATIC_VIEW_TYPES, SelectCycleType, SelectModuleType, SingleOrArray, TActivityEntityData, TAllAvailableDateFilterOperatorsForDisplay, TAllAvailableOperatorsForDisplay, TAllAvailableSelectFilterOperatorsForDisplay, TAnalyticsFilterParams, TAnalyticsGraphsBase, TAnalyticsTabsBase, TAnchors, TAreaChartProps, TAreaItem, TAssignedIssuesWidgetFilters, TAssignedIssuesWidgetResponse, TAxisChartProps, TBarChartProps, TBarChartShapeVariant, TBarItem, TBaseActivity, TBaseActivityVerbs, TBaseChartProps, TBaseFilterFieldConfig, TBaseIssue, TBaseLayoutType, TBillingFrequency, TBottomSectionConfig, TBuildFilterExpressionParams, TBulkIssueProperties, TBulkOperationsPayload, TCalendarLayouts, TCellItem, TChart, TChartColorScheme, TChartData, TChartDatum, TChartLegend, TChartMargin, TCollectionOperator, TCommandPaletteActionList, TCommandPaletteShortcut, TCommandPaletteShortcutList, TCommentReaction, TCommentsOperations, TComparisonOperator, TContentVisibility, TCoreAllAvailableDateFilterOperatorsForDisplay, TCoreAllAvailableSelectFilterOperatorsForDisplay, TCoreExactOperatorConfigs, TCoreFilterFieldConfigs, TCoreInOperatorConfigs, TCoreInstanceAuthenticationModeKeys, TCoreLoginMediums, TCoreOperatorSpecificConfigs, TCoreRangeOperatorConfigs, TCoreSupportedDateFilterOperators, TCoreSupportedMultiSelectFilterOperators, TCoreSupportedOperators, TCoreSupportedRangeDateFilterOperators, TCoreSupportedSelectFilterOperators, TCoreSupportedSingleDateFilterOperators, TCoreSupportedSingleSelectFilterOperators, TCreatedIssuesWidgetFilters, TCreatedIssuesWidgetResponse, TCycleAssigneesDistribution, TCycleCompletionChartDistribution, TCycleDisplayFilters, TCycleDistribution, TCycleDistributionBase, TCycleEstimateDistribution, TCycleEstimateDistributionBase, TCycleEstimateType, TCycleFilters, TCycleFiltersByState, TCycleGroups, TCycleLabelsDistribution, TCycleLayoutOptions, TCyclePlotType, TCycleProgress, TCycleSearchResponse, TCycleStoredFilters, TCycleTabOptions, TDateFilterFieldConfig, TDateRangeFilterFieldConfig, TDeDupeIssue, TDeprecatedDashboard, TDescriptionVersion, TDescriptionVersionDetails, TDescriptionVersionsListResponse, TDocumentPayload, TDropTarget, TDropTargetMiscellaneousData, TDuplicateAssetData, TDuplicateAssetResponse, TDuplicateIssuePayload, TDuplicateIssueResponse, TEditorAssetType, TEmailCheckTypes, TEpicAnalytics, TEpicAnalyticsGroup, TEqualityOperator, TEstimatePointsObject, TEstimateSystem, TEstimateSystemKeys, TEstimateSystems, TEstimateTypeError, TEstimateTypeErrorObject, TEstimateUpdateStageKeys, TExactOperatorConfigs, TExtendedAllAvailableDateFilterOperatorsForDisplay, TExtendedAllAvailableSelectFilterOperatorsForDisplay, TExtendedExactOperatorConfigs, TExtendedFilterFieldConfigs, TExtendedInOperatorConfigs, TExtendedInstanceAuthenticationModeKeys, TExtendedLoginMediums, TExtendedOperatorSpecificConfigs, TExtendedRangeOperatorConfigs, TExtendedSupportedDateFilterOperators, TExtendedSupportedOperators, TExtendedSupportedSelectFilterOperators, TExternalFilter, TFetchStatus, TFileEntityInfo, TFileMetaData, TFileMetaDataLite, TFileSignedURLResponse, TFilterAndGroupNode, TFilterAndGroupPayload, TFilterConditionForBuild, TFilterConditionNode, TFilterConditionNodeForDisplay, TFilterConditionPayload, TFilterConfig, TFilterExpression, TFilterFieldType, TFilterGroupNode, TFilterGroupPayload, TFilterNodeType, TFilterOperatorHelper, TFilterProperty, TFilterValue, TGanttBlockUpdateData, TGanttDateUpdate, TGanttDisplayOptions, TGanttViews, TGetBaseAuthenticationModeProps, TGetColumns, TGroupedIssueCount, TGroupedIssues, THomeDashboardResponse, THomeWidgetKeys, THomeWidgetProps, TIdentifierTextProps, TIdentifierTextVariant, TInOperatorConfigs, TInboxDuplicateIssueDetails, TInboxForm, TInboxIssue, TInboxIssueCurrentTab, TInboxIssueFilter, TInboxIssueFilterDateKeys, TInboxIssueFilterMemberKeys, TInboxIssueForm, TInboxIssuePaginationInfo, TInboxIssueSorting, TInboxIssueSortingKeys, TInboxIssueSortingOrderByKeys, TInboxIssueSortingOrderByQueryParam, TInboxIssueSortingOrderByQueryParamKeys, TInboxIssueSortingSortByKeys, TInboxIssueStatus, TInboxIssueWithPagination, TInboxIssuesQueryParams, TInstanceAIConfigurationKeys, TInstanceAuthenticationConfigurationKeys, TInstanceAuthenticationKeys, TInstanceAuthenticationMethodKeys, TInstanceAuthenticationModeKeys, TInstanceAuthenticationModes, TInstanceConfigurationKeys, TInstanceEmailConfigurationKeys, TInstanceGiteaAuthenticationConfigurationKeys, TInstanceGithubAuthenticationConfigurationKeys, TInstanceGitlabAuthenticationConfigurationKeys, TInstanceGoogleAuthenticationConfigurationKeys, TInstanceImageConfigurationKeys, TInstanceIntercomConfigurationKeys, TInstanceWorkspaceConfigurationKeys, TIntakeStateGroups, TIssue, TIssueActivity, TIssueActivityComment, TIssueActivityIdMap, TIssueActivityIssueDetail, TIssueActivityMap, TIssueActivityProjectDetail, TIssueActivityUserDetail, TIssueActivityWorkspaceDetail, TIssueAttachment, TIssueAttachmentIdMap, TIssueAttachmentMap, TIssueAttachmentUploadResponse, TIssueComment, TIssueCommentIdMap, TIssueCommentMap, TIssueCommentReaction, TIssueCommentReactionIdMap, TIssueCommentReactionMap, TIssueEntityData, TIssueExtraOptions, TIssueGroupByOptions, TIssueGroupingFilters, TIssueIdentifierBaseProps, TIssueIdentifierFromStore, TIssueIdentifierProps, TIssueIdentifierSize, TIssueIdentifierWithDetails, TIssueKanbanFilters, TIssueLayouts, TIssueLink, TIssueLinkEditableFields, TIssueLinkIdMap, TIssueLinkMap, TIssueMap, TIssueOrderByOptions, TIssuePaginationData, TIssueParams, TIssuePriorities, TIssuePublicComment, TIssueReaction, TIssueReactionIdMap, TIssueReactionMap, TIssueRelation, TIssueRelationIdMap, TIssueRelationMap, TIssueRelationTypes, TIssueResponseResults, TIssueSearchResponse, TIssueServiceType, TIssueSubIssues, TIssueSubIssuesIdMap, TIssueSubIssuesStateDistributionMap, TIssueTypeIdentifier, TIssues, TIssuesByPriorityWidgetFilters, TIssuesByPriorityWidgetResponse, TIssuesByStateGroupsWidgetFilters, TIssuesByStateGroupsWidgetResponse, TIssuesListTypes, TIssuesResponse, TLineChartProps, TLineItem, TLink, TLinkEditableFields, TLinkIdMap, TLinkMap, TLoader, TLogicalOperator, TLoginMediums, TLogoProps, TModuleAssigneesDistribution, TModuleCompletionChartDistribution, TModuleDisplayFilters, TModuleDistribution, TModuleDistributionBase, TModuleEstimateDistribution, TModuleEstimateDistributionBase, TModuleFilters, TModuleFiltersByState, TModuleLabelsDistribution, TModuleLayoutOptions, TModuleOrderByOptions, TModulePlotType, TModuleSearchResponse, TModuleStatus, TModuleStoredFilters, TMultiSelectFilterFieldConfig, TNameDescriptionLoader, TNegativeOperatorConfig, TNotification, TNotificationData, TNotificationFilter, TNotificationIssueLite, TNotificationLite, TNotificationPaginatedInfo, TNotificationPaginatedInfoQueryParams, TOAuthConfigs, TOAuthOption, TOnboardingStep, TOnboardingSteps, TOperatorConfigMap, TOperatorSpecificConfigs, TOverviewStatsWidgetResponse, TPage, TPageEmbedType, TPageEntityData, TPageExtended, TPageFilterProps, TPageFilters, TPageFiltersSortBy, TPageFiltersSortKey, TPageNavigationTabs, TPageSearchResponse, TPageVersion, TPaginatedResponse, TPaginationData, TPaginationInfo, TPartialProject, TPieChartProps, TProductBillingFrequency, TProductSubscriptionType, TProfileSettingsTabs, TProfileViews, TProgressChartData, TProgressSnapshot, TProject, TProjectAnalyticsCount, TProjectAnalyticsCountParams, TProjectAppliedDisplayFilterKeys, TProjectBaseActivity, TProjectDetails, TProjectDisplayFilters, TProjectEntityData, TProjectFilters, TProjectIssuesSearchParams, TProjectLink, TProjectLinkEditableFields, TProjectLinkIdMap, TProjectLinkMap, TProjectMembership, TProjectOrderByOptions, TProjectPublishLayouts, TProjectPublishSettings, TProjectPublishViewProps, TProjectSearchResponse, TProjectSettingsItem, TProjectSettingsTabs, TProjectStoredFilters, TPublicCycle, TPublicIssuesResponse, TPublicMember, TPublicModule, TPublishEntityType, TPublishSettings, TPublishViewDetails, TPublishViewSettings, TRadarChartProps, TRadarItem, TRangeOperatorConfigs, TRecentActivityFilterKeys, TRecentActivityWidgetResponse, TRecentCollaboratorsWidgetResponse, TRecentProjectsWidgetResponse, TScatterChartProps, TScatterPointItem, TSearchEntities, TSearchEntityRequestPayload, TSearchResponse, TSingleSelectFilterFieldConfig, TSpreadsheetColumn, TStateGroups, TStateOperationsCallbacks, TStaticViewTypes, TSticky, TSubGroupedIssues, TSubIssueOperations, TSubIssueResponse, TSubIssuesStateDistribution, TSubscriptionPrice, TSupportedDateFilterOperators, TSupportedFilterFieldConfigs, TSupportedFilterForUpdate, TSupportedOperators, TSupportedSelectFilterOperators, TTemplateValues, TTimelineType, TTimelineTypeCore, TTimezoneObject, TTimezones, TTopSectionConfig, TUnGroupedIssues, TUnreadNotificationsCount, TUserPermissions, TUserProfile, TUserSearchResponse, TViewFilterProps, TViewFilters, TViewFiltersSortBy, TViewFiltersSortKey, TWebhookConnectionQueryParams, TWebhookEventTypes, TWidget, TWidgetEntityData, TWidgetFiltersFormData, TWidgetIssue, TWidgetKeys, TWidgetStatsRequestParams, TWidgetStatsResponse, TWorkItemFilterAndGroup, TWorkItemFilterConditionData, TWorkItemFilterConditionKey, TWorkItemFilterExpression, TWorkItemFilterExpressionData, TWorkItemFilterGroup, TWorkItemFilterProperty, TWorkItemWidgets, TWorkspaceBaseActivity, TWorkspaceDraftIssue, TWorkspaceDraftIssueLoader, TWorkspaceDraftPaginationInfo, TWorkspaceDraftQueryParams, TWorkspacePaginationInfo, TWorkspaceSettingsItem, TWorkspaceSettingsTabs, TreeMapChartProps, TreeMapItem, User, UserAuth, ViewFlags, WORK_ITEM_FILTER_PROPERTY_KEYS, WeekMonthDataType, WorkItemInsightColumns };
//# sourceMappingURL=index.d.mts.map