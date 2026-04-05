import { Clock, FileText, Play, Edit, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Exam } from "../types";
import ModeToggle from "@/components/theme/mode-toggle";
import NotificationBell from "@/components/notifications/NotificationBell";

interface ExamHomeViewProps {
  exam: Exam;
  onStartExam: () => void;
  onEditExam: () => void;
  onBack: () => void;
}

export default function ExamHomeView({
  exam,
  onStartExam,
  onEditExam,
  onBack,
}: ExamHomeViewProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8">
      <div className="absolute top-10 right-40 flex items-center gap-3">
        <NotificationBell />
        <ModeToggle />
      </div>
      <div className="max-w-2xl w-full">
        <Button
          variant="outline"
          className="absolute top-10 left-40"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" />
          {t("exam.back")}
        </Button>
        <div className="bg-card border-2 border-border rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{exam.title}</h2>
            {exam.description && (
              <p className="text-muted-foreground">{exam.description}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold mb-1">
                {exam.questions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("exam.home.questions")}
              </div>
            </div>

            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold mb-1">
                {exam.timeLimit}
                <span className="text-base"> {t("exam.common.min")}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {t("exam.home.timeLimit")}
              </div>
            </div>

            <div className="bg-background rounded-lg p-4 text-center border border-border">
              <div className="text-2xl font-bold mb-1 text-primary">
                {exam.totalScore}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("exam.home.totalPoints")}
              </div>
            </div>
          </div>

          <div className="bg-background rounded-lg p-4 mb-8 border border-border">
            <h3 className="font-semibold mb-3 text-sm">
              {t("exam.home.questionTypes")}
            </h3>
            <div className="space-y-2 text-sm">
              {exam.questions.filter((q) => q.type === "MULTIPLE_CHOICE")
                .length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("exam.common.multipleChoice")}:
                  </span>
                  <span className="font-medium">
                    {
                      exam.questions.filter((q) => q.type === "MULTIPLE_CHOICE")
                        .length
                    }
                  </span>
                </div>
              )}
              {exam.questions.filter((q) => q.type === "TRUE_FALSE").length >
                0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("exam.common.trueFalse")}:
                  </span>
                  <span className="font-medium">
                    {
                      exam.questions.filter((q) => q.type === "TRUE_FALSE")
                        .length
                    }
                  </span>
                </div>
              )}
              {exam.questions.filter((q) => q.type === "ESSAY").length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Essay:</span>
                  <span className="font-medium">
                    {exam.questions.filter((q) => q.type === "ESSAY").length}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-sm">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              {t("exam.home.beforeStart")}
            </h3>
            <ul className="space-y-1 text-blue-800 dark:text-blue-200">
              <li>• {t("exam.home.hintInternet")}</li>
              <li>• {t("exam.home.hintNoPause")}</li>
              <li>• {t("exam.home.hintProgress")}</li>
              <li>• {t("exam.home.hintReview")}</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={onEditExam} variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              {t("exam.home.editExam")}
            </Button>
            <Button onClick={onStartExam} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {t("exam.home.startExam")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
