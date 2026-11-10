// The public API, by domain (the folders mirror Figma pages 24–40).

export { Button, type ButtonProps } from "./actions/button.tsx";
export { IconButton, type IconButtonProps } from "./actions/icon-button.tsx";

export { Checkbox, type CheckboxProps } from "./forms/checkbox.tsx";
export { Field, type FieldProps } from "./forms/field.tsx";
export { RadioGroup, type RadioGroupProps, type RadioOption } from "./forms/radio-group.tsx";
export { SegmentedControl, type SegmentedControlProps } from "./forms/segmented-control.tsx";
export { Select, type SelectOption, type SelectProps } from "./forms/select.tsx";
export { Switch, type SwitchProps } from "./forms/switch.tsx";
export {
  TextField,
  TextInput,
  type TextFieldProps,
  type TextInputProps,
} from "./forms/text-field.tsx";

export { FilterChip, type FilterChipProps } from "./navigation/filter-chip.tsx";
export { SidebarItem, type SidebarItemProps } from "./navigation/sidebar-item.tsx";
export { Tabs, type TabsProps } from "./navigation/tabs.tsx";

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

export { Dialog, DialogClose, type DialogProps } from "./overlays/dialog.tsx";
export { Menu, type MenuItem, type MenuProps } from "./overlays/menu.tsx";
export { Popover, type PopoverProps } from "./overlays/popover.tsx";
export { Sheet, type SheetProps } from "./overlays/sheet.tsx";
export { Tooltip, TooltipProvider, type TooltipProps } from "./overlays/tooltip.tsx";
export { TypeToConfirm, type TypeToConfirmProps } from "./overlays/type-to-confirm.tsx";

export { ActivityRow, type ActivityRowProps } from "./data/activity-row.tsx";
export {
  ProposalRow,
  ProposalTable,
  type ProposalRowProps,
  type ProposalTableProps,
} from "./data/proposal-row.tsx";
export {
  RowLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./data/table.tsx";

export { Card, CardHeader, DetailRow, type CardHeaderProps } from "./surfaces/card.tsx";
export { EmptyState, type EmptyStateProps } from "./surfaces/empty-state.tsx";
export { Scene, type SceneProps } from "./surfaces/scene.tsx";

export {
  AppShell,
  PageHeader,
  type AppShellProps,
  type PageHeaderProps,
} from "./shell/app-shell.tsx";
export {
  Sidebar,
  SidebarGroup,
  type SidebarGroupProps,
  type SidebarProps,
} from "./shell/sidebar.tsx";
export { StatusChip, type StatusChipProps } from "./shell/status-chip.tsx";
export { TopBar, type NodeState, type SignerState, type TopBarProps } from "./shell/top-bar.tsx";
export {
  VaultSwitcher,
  type VaultChoice,
  type VaultSwitcherProps,
} from "./shell/vault-switcher.tsx";

export { cn } from "./styling/class-names.ts";
export { ThemeProvider, useTheme, type ThemePreference } from "./styling/theme.tsx";
