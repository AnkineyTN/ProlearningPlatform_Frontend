import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const isDark = theme === "dark"

    const handleToggle = (checked: boolean) => {
        setTheme(checked ? "dark" : "light")
    }

    return (
        <div className="flex items-center gap-2">
            <Sun className="h-[1.2rem] w-[1.2rem]" />
            <Switch
                className="cursor-pointer"
                checked={isDark}
                onCheckedChange={handleToggle}
            />
            <Moon className="h-[1.2rem] w-[1.2rem]" />
        </div>
    )
}