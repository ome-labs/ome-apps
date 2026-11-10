// The public API, by domain. Names and props match @ome-labs/ui-web where the platforms allow.

export { Button, type ButtonProps } from "./actions/button.tsx";
export { IconButton, type IconButtonProps } from "./actions/icon-button.tsx";

export { Checkbox, type CheckboxProps } from "./forms/checkbox.tsx";
export { SegmentedControl, type SegmentedControlProps } from "./forms/segmented-control.tsx";
export { Switch, type SwitchProps } from "./forms/switch.tsx";
export { TextField, type TextFieldProps } from "./forms/text-field.tsx";

export { StatusBadge, type StatusBadgeProps } from "./status/status-badge.tsx";
export { Tag, type TagProps } from "./status/tag.tsx";

export { MemberAvatar, type MemberAvatarProps } from "./identity/member-avatar.tsx";
export { TokenMonogram, type TokenMonogramProps } from "./identity/token-monogram.tsx";

export { Address, type AddressProps } from "./values/address.tsx";
export { Amount, type AmountProps } from "./values/amount.tsx";
export { CopyButton, type CopyButtonProps } from "./values/copy-button.tsx";
export { Hash, type HashProps } from "./values/hash.tsx";

export { HealthMeter, type HealthMeterProps } from "./thresholds/health-meter.tsx";
export { ThresholdChip, type ThresholdChipProps } from "./thresholds/threshold-chip.tsx";
export { VoteProgress, type VoteProgressProps } from "./thresholds/vote-progress.tsx";

export { StepList, type StepListProps } from "./steps/step-list.tsx";
export { StepRow, type StepRowProps } from "./steps/step-row.tsx";

export { CheckRow, type CheckRowProps } from "./review/check-row.tsx";
export { ReviewPanel, type ReviewPanelProps } from "./review/review-panel.tsx";

export { CodeBox, type CodeBoxProps } from "./codes/code-box.tsx";
export { QrCode, type QrCodeProps } from "./codes/qr-code.tsx";

export { Banner, type BannerProps } from "./feedback/banner.tsx";
export { Toaster, toast } from "./feedback/toaster.tsx";

export { Dialog, type DialogProps } from "./overlays/dialog.tsx";
export { Sheet, type SheetProps } from "./overlays/sheet.tsx";
export { TypeToConfirm, type TypeToConfirmProps } from "./overlays/type-to-confirm.tsx";

export { ActivityRow, type ActivityRowProps } from "./data/activity-row.tsx";
export { ProposalList, type ProposalListProps } from "./data/proposal-list.tsx";
export { ProposalRow, type ProposalRowProps } from "./data/proposal-row.tsx";

export { Card, CardHeader, DetailRow, type CardHeaderProps } from "./surfaces/card.tsx";
export { EmptyState, type EmptyStateProps } from "./surfaces/empty-state.tsx";

export { cn } from "./styling/class-names.ts";
export { Text, TextClassContext, type TextProps } from "./styling/text.tsx";
export { setTheme, useResolvedTheme, type ThemePreference } from "./styling/theme.ts";
