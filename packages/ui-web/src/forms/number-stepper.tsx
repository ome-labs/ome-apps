import { NumberField } from "@base-ui/react/number-field";
import { Icon } from "@ome-labs/icons/web";

export type NumberStepperProps = {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  "aria-label": string;
  disabled?: boolean | undefined;
  className?: string | undefined;
};

const step =
  "focus-ring grid size-8 place-items-center rounded-md text-fg-muted transition-[background-color,color] duration-fast ease-standard hover:bg-hover hover:text-fg disabled:pointer-events-none disabled:text-fg-disabled";

/**
 * A small whole number chosen with − and + (and the arrow keys, or by typing), held between `min` and `max`. For
 * counts that are easy to get wrong in a free field, such as a vault's thresholds.
 */
export function NumberStepper({
  value,
  onValueChange,
  min,
  max,
  className,
  ...props
}: NumberStepperProps) {
  return (
    <NumberField.Root
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange(Math.round(next));
      }}
      min={min}
      max={max}
      step={1}
      disabled={props.disabled}
      className={className}
    >
      <NumberField.Group className="inline-flex items-center gap-0.5 rounded-lg bg-sunken p-0.5 shadow-field">
        <NumberField.Decrement aria-label="Fewer" className={step}>
          <Icon name="minus" size={16} />
        </NumberField.Decrement>
        <NumberField.Input
          aria-label={props["aria-label"]}
          className="h-8 w-10 rounded-md bg-surface text-center type-label-m text-fg tabular-nums shadow-control outline-none focus:shadow-focus"
        />
        <NumberField.Increment aria-label="More" className={step}>
          <Icon name="plus" size={16} />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
