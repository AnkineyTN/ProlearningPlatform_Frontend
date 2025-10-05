import { Card, CardContent } from '@/components/ui/card'
import { Users, UserPlus, Calendar, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
    stats: {
        totalUsers: number
        usersToday: number
        usersThisWeek: number
        usersThisMonth: number
    } | undefined
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    const statsCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'text-stat-card-1-foreground',
            bgColor: 'bg-stat-card-1'
        },
        {
            title: 'Users Today',
            value: stats?.usersToday || 0,
            icon: UserPlus,
            color: 'text-stat-card-2-foreground',
            bgColor: 'bg-stat-card-2'
        },
        {
            title: 'Users This Week',
            value: stats?.usersThisWeek || 0,
            icon: Calendar,
            color: 'text-stat-card-3-foreground',
            bgColor: 'bg-stat-card-3'
        },
        {
            title: 'Users This Month',
            value: stats?.usersThisMonth || 0,
            icon: TrendingUp,
            color: 'text-stat-card-4-foreground',
            bgColor: 'bg-stat-card-4'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => {
                const Icon = card.icon
                return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="px-6 py-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-medium">{card.title}</p>
                                    <p className="text-4xl font-bold">{card.value}</p>
                                </div>
                                <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default StatsCards