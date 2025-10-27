import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ModeToggle } from "@/components/theme/mode-toggle";

interface HeaderProps {
    onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-bold">Welcome back!</h1>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="bg-card pl-10 pr-4 py-2 w-80 rounded-full border border-muted-foreground"
                    />
                </div>
                <button className="p-2 hover:bg-card-secondary rounded-lg cursor-pointer" title="Notifications">
                    <Bell className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-card-secondary rounded-lg cursor-pointer" title="Profile">
                    <User className="w-6 h-6" />
                </button>
                <ModeToggle />
            </div>
        </div>
    );
};