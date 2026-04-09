import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  adminUsersAPI,
  extractAdminUsersList,
} from "@/services/endpoints/adminUsers";
import { onboardingAPI } from "@/services/endpoints/onboarding";
import type { AdminUserDirectoryRow } from "@/services/types/adminUsers.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 20;

const PIE_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#ec4899",
  "#84cc16",
  "#64748b",
];

const AdminDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [editRow, setEditRow] = useState<AdminUserDirectoryRow | null>(null);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editAccountType, setEditAccountType] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: async () => {
      const res = await adminUsersAPI.list({
        page,
        size: PAGE_SIZE,
        sort: "id,DESC",
      });
      return extractAdminUsersList(res.data.data);
    },
  });

  const analyticsQuery = useQuery({
    queryKey: ["admin", "onboarding", "analytics"],
    queryFn: async () => {
      const res = await onboardingAPI.getAdminAnalytics();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!editRow) return;
    const u = editRow.user;
    setEditFirst(u.firstName);
    setEditLast(u.lastName);
    setEditAccountType(u.accountType ?? "");
  }, [editRow]);

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      userId: number;
      firstName: string;
      lastName: string;
      accountType: string | undefined;
    }) => {
      const body: Record<string, string> = {
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
      if (payload.accountType != null && payload.accountType !== "") {
        body.accountType = payload.accountType;
      }
      return adminUsersAPI.update(payload.userId, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("adminDashboard.userUpdated"));
      setEditRow(null);
    },
    onError: () => {
      toast.error(t("adminDashboard.updateError"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => adminUsersAPI.delete(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("adminDashboard.userDeleted"));
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error(t("adminDashboard.deleteError"));
    },
  });

  const rows = usersQuery.data ?? [];
  const analytics = analyticsQuery.data;

  const refreshAll = () => {
    void usersQuery.refetch();
    void analyticsQuery.refetch();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    try {
      const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
      return new Date(iso).toLocaleString(locale);
    } catch {
      return iso;
    }
  };

  const na = t("adminOnboarding.notAvailable");

  const displayOrDash = (v: string | null | undefined) =>
    v != null && v !== "" ? v : na;

  const premiumBarData = analytics
    ? [
        { type: "PRO", count: analytics.premium.proCount },
        { type: "FREE", count: analytics.premium.freeCount },
      ]
    : [];

  const openEdit = (row: AdminUserDirectoryRow) => {
    setEditRow(row);
  };

  const saveEdit = () => {
    if (!editRow) return;
    updateMutation.mutate({
      userId: editRow.user.id,
      firstName: editFirst.trim(),
      lastName: editLast.trim(),
      accountType: editAccountType === "" ? undefined : editAccountType,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("adminDashboard.backToDashboard")}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("adminDashboard.title")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("adminDashboard.description")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={usersQuery.isFetching || analyticsQuery.isFetching}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("adminDashboard.refresh")}
          </Button>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            {t("adminDashboard.usersTitle")}
          </h2>
          {usersQuery.isError && (
            <p className="text-sm text-destructive">
              {t("adminDashboard.usersLoadError")}
            </p>
          )}
          <Card className="p-0 overflow-hidden border border-ring">
            {usersQuery.isLoading ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                {t("onboarding.loading")}
              </div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                {t("adminDashboard.emptyUsers")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        {t("adminDashboard.colId")}
                      </TableHead>
                      <TableHead>{t("adminDashboard.colName")}</TableHead>
                      <TableHead className="min-w-[180px]">
                        {t("adminDashboard.colEmail")}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t("adminDashboard.colRoles")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("adminDashboard.colLanguage")}
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        {t("adminDashboard.colEducation")}
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        {t("adminDashboard.colHearAppFrom")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("adminDashboard.colAccountType")}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell whitespace-nowrap">
                        {t("adminDashboard.colOnboardingAt")}
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        {t("adminDashboard.colActions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const u = row.user;
                      const submitted =
                        formatDate(row.onboardingSubmittedAt) ?? na;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-sm">
                            {u.id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {u.firstName} {u.lastName}
                          </TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[140px] truncate">
                            {u.roles.join(", ")}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {displayOrDash(u.language)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm">
                            {displayOrDash(u.education)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm">
                            {displayOrDash(u.hearAppFrom)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {displayOrDash(u.accountType)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs whitespace-nowrap text-muted-foreground">
                            {submitted}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(row)}
                                aria-label={t("adminDashboard.editUser")}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: u.id,
                                    label: `${u.firstName} ${u.lastName}`.trim(),
                                  })
                                }
                                aria-label={t("adminDashboard.deleteUser")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0 || usersQuery.isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("adminDashboard.prevPage")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={rows.length < PAGE_SIZE || usersQuery.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("adminDashboard.nextPage")}
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            {t("adminOnboarding.analyticsTitle")}
          </h2>
          {analyticsQuery.isError && (
            <p className="text-sm text-destructive">
              {t("adminOnboarding.analyticsLoadError")}
            </p>
          )}
          {analyticsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">
              {t("onboarding.loading")}
            </p>
          )}
          {analytics && (
            <div className="flex flex-col gap-4">
              <Card className="p-6 border border-ring">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("adminOnboarding.totalRegistered")}
                </p>
                <p className="text-3xl font-bold tabular-nums">
                  {analytics.totalRegisteredUsers}
                </p>
              </Card>

              <div className="flex gap-4 w-full flex-col lg:flex-row">
                <Card className="p-6 border border-ring w-full">
                  <h3 className="text-sm font-medium mb-4">
                    {t("adminOnboarding.analyticsEducation")}
                  </h3>
                  {analytics.education.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{na}</p>
                  ) : (
                    <div className="h-[280px] w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.education}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            paddingAngle={1}
                          >
                            {analytics.education.map((_, i) => (
                              <Cell
                                key={`edu-${i}`}
                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, _n, item) => {
                              const p = (item.payload as { percent?: number })
                                ?.percent;
                              const pct =
                                p != null ? ` (${p.toFixed(1)}%)` : "";
                              return [
                                `${value}${pct}`,
                                t("adminOnboarding.chartCount"),
                              ];
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>

                <Card className="p-6 border border-ring w-full">
                  <h3 className="text-sm font-medium mb-4">
                    {t("adminOnboarding.analyticsPremium")}
                  </h3>
                  <div className="h-[220px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={premiumBarData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(v: number) => [
                            v,
                            t("adminOnboarding.chartCount"),
                          ]}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {premiumBarData.map((entry) => (
                            <Cell
                              key={entry.type}
                              fill={
                                entry.type === "PRO" ? "#a855f7" : "#64748b"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    PRO {analytics.premium.proPercent.toFixed(1)}% ·{" "}
                    {t("adminOnboarding.chartCount")}: PRO{" "}
                    {analytics.premium.proCount}, FREE{" "}
                    {analytics.premium.freeCount}
                  </p>
                </Card>
              </div>

              <Card className="p-6 border border-ring">
                <h3 className="text-sm font-medium mb-4">
                  {t("adminOnboarding.analyticsHearAppFrom")}
                </h3>
                {analytics.hearAppFrom.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{na}</p>
                ) : (
                  <div className="h-[320px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={analytics.hearAppFrom}
                        margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis
                          dataKey="label"
                          type="category"
                          width={120}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value: number, _n, item) => {
                            const p = (item.payload as { percent?: number })
                              ?.percent;
                            const pct = p != null ? ` (${p.toFixed(1)}%)` : "";
                            return [
                              `${value}${pct}`,
                              t("adminOnboarding.chartCount"),
                            ];
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#6366f1"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          )}
        </section>
      </div>

      <Dialog open={editRow != null} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("adminDashboard.editDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-edit-first">
                {t("adminDashboard.fieldFirstName")}
              </Label>
              <Input
                id="admin-edit-first"
                value={editFirst}
                onChange={(e) => setEditFirst(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-edit-last">
                {t("adminDashboard.fieldLastName")}
              </Label>
              <Input
                id="admin-edit-last"
                value={editLast}
                onChange={(e) => setEditLast(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("adminDashboard.fieldAccountType")}</Label>
              <Select
                value={editAccountType === "" ? "__unset__" : editAccountType}
                onValueChange={(v) =>
                  setEditAccountType(v === "__unset__" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("adminDashboard.accountTypeUnset")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unset__">
                    {t("adminDashboard.accountTypeUnset")}
                  </SelectItem>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditRow(null)}
            >
              {t("adminDashboard.cancel")}
            </Button>
            <Button
              type="button"
              onClick={saveEdit}
              disabled={
                updateMutation.isPending ||
                editFirst.trim() === "" ||
                editLast.trim() === ""
              }
            >
              {t("adminDashboard.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("adminDashboard.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("adminDashboard.deleteConfirmDescription", {
                name: deleteTarget?.label ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("adminDashboard.cancel")}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || deleteTarget == null}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
            >
              {t("adminDashboard.deleteConfirmAction")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboardPage;
