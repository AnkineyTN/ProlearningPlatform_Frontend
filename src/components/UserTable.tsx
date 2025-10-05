import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Clock } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface User {
    id: number
    name: string
    email: string
    createdAt: string
    updatedAt: string
}

interface Pagination {
    total: number
    totalPages: number
    page: number
    limit: number
}

interface UsersTableProps {
    users: {
        users: User[]
        pagination: Pagination
    } | null | undefined
    page: number
    setPage: (page: number) => void
}

const UsersTable: React.FC<UsersTableProps> = ({ users, page, setPage }) => {
    const formatDateTime = (dateString: string | number | Date): string => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5" />
                    Users List
                    <Badge variant="secondary" className="ml-2">
                        {users?.pagination?.total || 0} total
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary">
                                <TableHead className="font-bold w-16">ID</TableHead>
                                <TableHead className="font-bold w-60">Name</TableHead>
                                <TableHead className="font-bold w-100">Email</TableHead>
                                <TableHead className="font-bold">Created At</TableHead>
                                <TableHead className="font-bold">Updated At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.users?.map((user: User) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.id}</TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {formatDateTime(user.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {formatDateTime(user.updatedAt)}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {users?.pagination && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground w-full">
                            Showing {users?.users?.length || 0} of {users?.pagination?.total || 0} users
                        </div>
                        <Pagination className={"justify-end"}>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (page > 1) setPage(page - 1)
                                        }}
                                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {/* Hiển thị các trang */}
                                {Array.from({ length: users?.pagination?.totalPages || 0 }, (_, i) => i + 1)
                                    .filter(pageNum => {
                                        // Hiển thị trang hiện tại và 1 trang trước/sau
                                        return Math.abs(pageNum - page) <= 1 || pageNum === 1 || pageNum === (users?.pagination?.totalPages || 0)
                                    })
                                    .map((pageNum, index, array) => (
                                        <PaginationItem key={pageNum}>
                                            {index > 0 && array[index - 1] !== pageNum - 1 && (
                                                <PaginationEllipsis />
                                            )}
                                            <PaginationLink
                                                href="#"
                                                isActive={pageNum === page}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setPage(pageNum)
                                                }}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))
                                }

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (page < (users?.pagination?.totalPages || 0)) setPage(page + 1)
                                        }}
                                        className={page >= (users?.pagination?.totalPages || 0) ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default UsersTable