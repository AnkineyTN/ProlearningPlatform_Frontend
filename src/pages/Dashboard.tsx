import React, { useState } from 'react'
import { useUsersStats, useUsersList } from '../hooks/useDashboard.ts'
import { Badge } from '@/components/ui/badge.tsx'
import StatsCards from '../components/StatsCards.tsx'
import UserChart from '../components/UserChart.tsx'
import UsersTable from '../components/UserTable.tsx'
import {HashLoader} from "react-spinners";

const Dashboard: React.FC = () => {
    const [page, setPage] = useState(1)
    const limit = 5
    const { data: userStats, isLoading: statsLoading, error: statsError } = useUsersStats()
    const { data: usersList, isLoading: usersLoading, error: usersError } = useUsersList({
        page,
        limit
    })

    if (statsLoading || usersLoading) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-center mt-30">
                    <HashLoader className={"mb-6 mx-auto"} color={"var(--foreground)"} />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (statsError || usersError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading dashboard data</div>
            </div>
        )
    }

    const stats = userStats?.data
    const users = usersList?.data

    return (
        <div className="max-w-screen p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className={"font-bold text-4xl"}>Dashboard</h1>
                <Badge variant="outline" className="text-sm">
                    Last updated: {new Date().toLocaleString('vi-VN')}
                </Badge>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />
            <div>
                {/* Chart Section */}
                <UserChart stats={stats} />
            </div>

            {/* Users Table */}
            <UsersTable users={users} page={page} setPage={setPage} />
        </div>
    )
}

export default Dashboard