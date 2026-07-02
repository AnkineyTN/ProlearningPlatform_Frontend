/** Border + background classes for a selectable option card, shared by the
 * language / education / source pickers. */
export const optionCardClass = (selected: boolean) =>
  selected
    ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)]'
    : 'border-[var(--pl-border)] bg-[var(--pl-bg-elev)] hover:border-[var(--pl-border-strong)]';
