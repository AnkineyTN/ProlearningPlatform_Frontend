import {
  Clock,
  FileText,
  Play,
  Edit,
  ChevronLeft,
  Share2,
  CheckSquare,
  ToggleLeft,
  AlignLeft,
  Info,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Exam } from "../types";
import ModeToggle from "@/components/theme/mode-toggle";
import NotificationBell from "@/components/notifications/NotificationBell";
import { ShareDialog } from "@/components/collaboration/ShareDialog";
import type { CollabRole } from "@/services/types/collaboration.types";
import { useAppSelector } from "@/hooks/redux";

interface ExamHomeViewProps {
  exam: Exam;
  setId: number;
  examId: number;
  onStartExam: () => void | Promise<void>;
  onEditExam: () => void;
  onBack: () => void;
  isStarting?: boolean;
  userRole?: CollabRole;
}

const questionTypeIcon = (type: string) => {
  if (type === "MULTIPLE_CHOICE") return <CheckSquare className="w-3.5 h-3.5" />;
  if (type === "TRUE_FALSE") return <ToggleLeft className="w-3.5 h-3.5" />;
  return <AlignLeft className="w-3.5 h-3.5" />;
};

const questionTypeLabel = (type: string, t: (k: string) => string) => {
  if (type === "MULTIPLE_CHOICE") return t("exam.common.multipleChoice");
  if (type === "TRUE_FALSE") return t("exam.common.trueFalse");
  return "Essay";
};

export default function ExamHomeView({
  exam,
  setId,
  examId,
  onStartExam,
  onEditExam,
  onBack,
  isStarting = false,
  userRole = "OWNER",
}: ExamHomeViewProps) {
  const { t } = useTranslation();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const [shareOpen, setShareOpen] = useState(false);

  const questionTypes = ["MULTIPLE_CHOICE", "TRUE_FALSE", "ESSAY"].filter(
    (type) => exam.questions.filter((q) => q.type === type).length > 0,
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border px-8 py-4 flex items-center justify-between bg-card">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("exam.back")}
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <NotificationBell />
          <ModeToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-8 py-12">
        <div className="w-full max-w-2xl">

          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-border flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-1">
                  {t("exam.home.questions")} · {exam.questions.length} total
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight leading-tight">
                  {exam.title}
                </h1>
              </div>
            </div>
            {exam.description && (
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                {exam.description}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {
                icon: <FileText className="w-4 h-4" />,
                value: exam.questions.length,
                label: t("exam.home.questions"),
              },
              {
                icon: <Clock className="w-4 h-4" />,
                value: exam.timeLimit,
                unit: t("exam.common.min"),
                label: t("exam.home.timeLimit"),
              },
              {
                value: exam.totalScore,
                unit: "pts",
                label: t("exam.home.totalPoints"),
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                {stat.icon && (
                  <div className="flex justify-center mb-2 text-muted-foreground">
                    {stat.icon}
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-[family-name:var(--font-mono-pl)] text-2xl font-medium">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Question breakdown */}
          {questionTypes.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 mb-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-3">
                {t("exam.home.questionTypes")}
              </p>
              <div className="space-y-2.5">
                {questionTypes.map((type) => {
                  const count = exam.questions.filter((q) => q.type === type).length;
                  const pct = Math.round((count / exam.questions.length) * 100);
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground w-36 flex-shrink-0 text-sm">
                        {questionTypeIcon(type)}
                        <span className="truncate">{questionTypeLabel(type, t)}</span>
                      </div>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Before start hints */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60">
                {t("exam.home.beforeStart")}
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                t("exam.home.hintInternet"),
                t("exam.home.hintNoPause"),
                t("exam.home.hintProgress"),
                t("exam.home.hintReview"),
              ].map((hint, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                  {hint}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onEditExam}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Edit className="w-4 h-4" />
              {t("exam.home.editExam")}
            </Button>
            <Button
              onClick={() => void onStartExam()}
              className="flex-1 gap-2"
              disabled={isStarting}
            >
              <Play className="w-4 h-4" />
              {isStarting ? t("exam.home.starting") : t("exam.home.startExam")}
            </Button>
          </div>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        setId={setId}
        resourceType="exams"
        resourceId={examId}
        userRole={userRole}
        currentUserId={currentUserId}
      />
    </div>
  );
}
