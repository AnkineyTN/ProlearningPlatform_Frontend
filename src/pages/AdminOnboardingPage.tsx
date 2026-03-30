import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Database,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { OnboardingSubmission } from "@/components/onboarding/type";
import {
  clearOnboardingSubmissions,
  loadOnboardingSubmissions,
  seedMockOnboardingSubmissions,
} from "@/lib/onboardingStorage";
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

const AdminOnboardingPage = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState<OnboardingSubmission[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRows(loadOnboardingSubmissions());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSeed = () => {
    seedMockOnboardingSubmissions();
    refresh();
  };

  const handleClear = () => {
    if (!window.confirm(t("adminOnboarding.clearConfirm"))) {
      return;
    }
    clearOnboardingSubmissions();
    refresh();
  };

  const formatDate = (iso: string) => {
    try {
      const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
      return new Date(iso).toLocaleString(locale);
    } catch {
      return iso;
    }
  };

  const expandedRow =
    expandedId != null ? rows.find((r) => r.id === expandedId) : undefined;

  const na = t("adminOnboarding.notAvailable");

  return (
    <div className='min-h-screen bg-background text-foreground p-6 md:p-10'>
      <div className='max-w-6xl mx-auto space-y-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <Link
              to='/dashboard'
              className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2'
            >
              <ArrowLeft className='w-4 h-4' />
              {t("adminOnboarding.backToDashboard")}
            </Link>
            <h1 className='text-2xl font-bold tracking-tight'>
              {t("adminOnboarding.title")}
            </h1>
            <p className='text-muted-foreground text-sm mt-1'>
              {t("adminOnboarding.description")}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' size='sm' onClick={refresh}>
              <RefreshCw className='w-4 h-4 mr-2' />
              {t("adminOnboarding.refresh")}
            </Button>
            <Button variant='secondary' size='sm' onClick={handleSeed}>
              <Database className='w-4 h-4 mr-2' />
              {t("adminOnboarding.seedMock")}
            </Button>
            <Button variant='destructive' size='sm' onClick={handleClear}>
              <Trash2 className='w-4 h-4 mr-2' />
              {t("adminOnboarding.clearAll")}
            </Button>
          </div>
        </div>

        <Card className='p-0 overflow-hidden border border-ring'>
          {rows.length === 0 ? (
            <div className='p-12 text-center text-muted-foreground'>
              <Trans
                i18nKey='adminOnboarding.empty'
                components={{
                  link: (
                    <Link
                      to='/onboarding'
                      className='underline text-foreground'
                    />
                  ),
                }}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-10' />
                  <TableHead>{t("adminOnboarding.colTime")}</TableHead>
                  <TableHead>{t("adminOnboarding.colUser")}</TableHead>
                  <TableHead>{t("adminOnboarding.colCompletion")}</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    {t("adminOnboarding.colSummary")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const open = expandedId === row.id;
                  const { data } = row;
                  const summary = [
                    data.language,
                    data.education,
                    data.role,
                    data.source,
                    data.premium
                      ? t("adminOnboarding.planPremium")
                      : t("adminOnboarding.planFree"),
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <TableRow key={row.id} className='align-top'>
                      <TableCell className='py-3'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() =>
                            setExpandedId(open ? null : row.id)
                          }
                          aria-expanded={open}
                          aria-label={
                            open
                              ? t("adminOnboarding.collapseRow")
                              : t("adminOnboarding.expandRow")
                          }
                        >
                          {open ? (
                            <ChevronDown className='w-4 h-4' />
                          ) : (
                            <ChevronRight className='w-4 h-4' />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className='py-3 whitespace-nowrap text-xs md:text-sm'>
                        {formatDate(row.submittedAt)}
                      </TableCell>
                      <TableCell className='py-3'>
                        <div className='font-medium'>
                          {row.displayName ?? na}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {row.email ?? na}
                          {row.userId != null && (
                            <span className='ml-1'>
                              {t("adminOnboarding.userIdChip", {
                                id: row.userId,
                              })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='py-3'>
                        <span
                          className={
                            row.completedVia === "complete"
                              ? "text-green-600 dark:text-green-400"
                              : "text-amber-600 dark:text-amber-400"
                          }
                        >
                          {row.completedVia === "complete"
                            ? t("adminOnboarding.statusCreatedSet")
                            : t("adminOnboarding.statusSkipped")}
                        </span>
                      </TableCell>
                      <TableCell className='hidden md:table-cell py-3 text-muted-foreground text-sm max-w-[280px] truncate'>
                        {summary}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        {expandedRow != null && (
          <Card className='p-6 border border-ring space-y-4'>
            <h2 className='font-semibold'>
              {t("adminOnboarding.detailJsonTitle")}
            </h2>
            <pre className='text-xs bg-card-secondary rounded-lg p-4 overflow-x-auto border border-ring'>
              {JSON.stringify(expandedRow, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminOnboardingPage;
