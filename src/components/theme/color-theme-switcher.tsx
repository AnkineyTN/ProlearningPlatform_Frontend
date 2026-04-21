import { useColorTheme, type ColorTheme } from "./color-theme-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const THEMES: { id: ColorTheme; label: string; color: string; darkColor: string }[] = [
  { id: "atlas", label: "Atlas · Forest Green", color: "oklch(0.58 0.09 155)", darkColor: "oklch(0.72 0.13 155)" },
  { id: "lumen", label: "Lumen · Ocean Blue",   color: "oklch(0.56 0.14 235)", darkColor: "oklch(0.72 0.16 235)" },
  { id: "ember", label: "Ember · Amber",         color: "oklch(0.62 0.16 35)",  darkColor: "oklch(0.75 0.16 45)" },
];

export default function ColorThemeSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center",
          collapsed ? "flex-col gap-0 py-1" : "flex-row gap-[6px] py-0.5"
        )}
      >
        {THEMES.map((t) => {
          const active = colorTheme === t.id;
          return (
            <Tooltip key={t.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setColorTheme(t.id)}
                  aria-label={t.label}
                  className="rounded-full shrink-0 cursor-pointer transition-all duration-[180ms]"
                  style={{
                    width: active ? 20 : 14,
                    height: active ? 20 : 14,
                    background: t.color,
                    border: active ? "2.5px solid var(--foreground)" : "2px solid transparent",
                    boxShadow: active ? `0 0 0 1px ${t.color}` : "none",
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[12px]">
                {t.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
