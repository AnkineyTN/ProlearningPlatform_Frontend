import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { todoAPI } from "@/services/endpoints/todo";
import type { Goal, GoalType } from "@/services/types/todo.types";
import { GOAL_PRESET_COLORS } from "./constants";

type GoalModalProps = {
  open: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
  longGoals?: Goal[];
};

const GoalModal = ({ open, onClose, editGoal, longGoals = [] }: GoalModalProps) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [title, setTitle] = useState(editGoal?.title ?? "");
  const [description, setDescription] = useState(editGoal?.description ?? "");
  const [color, setColor] = useState(editGoal?.color ?? GOAL_PRESET_COLORS[0]);
  const [targetDate, setTargetDate] = useState(editGoal?.targetDate ?? "");
  const [type, setType] = useState<GoalType>(editGoal?.type ?? "LONG");
  const [parentGoalId, setParentGoalId] = useState<number | "">(
    editGoal?.parentGoalId ?? "",
  );

  const createMutation = useMutation({
    mutationFn: todoAPI.createGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success(t("todo.toast.goalCreated"));
      onClose();
    },
    onError: () => toast.error(t("todo.toast.goalCreateFailed")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof todoAPI.updateGoal>[1] }) =>
      todoAPI.updateGoal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success(t("todo.toast.goalUpdated"));
      onClose();
    },
    onError: () => toast.error(t("todo.toast.goalUpdateFailed")),
  });

  if (!open) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!title.trim()) return toast.warn(t("todo.toast.goalNameRequired"));
    const payload = {
      title,
      description: description || undefined,
      color,
      targetDate: targetDate || undefined,
      type,
      parentGoalId: type === "SHORT" && parentGoalId !== "" ? Number(parentGoalId) : undefined,
      clearParentGoal: type === "LONG" ? true : undefined,
    };
    if (editGoal) {
      updateMutation.mutate({ id: editGoal.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--pl-bg)] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {editGoal ? t("todo.goalModal.editTitle") : t("todo.goalModal.createTitle")}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              {t("todo.goalModal.goalType")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["LONG", "SHORT"] as GoalType[]).map((gt) => (
                <button
                  key={gt}
                  onClick={() => setType(gt)}
                  className={`rounded-xl px-3 py-2 text-sm border transition-all text-left ${
                    type === gt
                      ? "border-[var(--pl-accent)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] font-medium"
                      : "border-[var(--pl-border)] text-muted-foreground"
                  }`}
                >
                  <div className="font-medium">
                    {gt === "LONG" ? t("todo.goalModal.longLabel") : t("todo.goalModal.shortLabel")}
                  </div>
                  <div className="text-[11px] opacity-70 mt-0.5">
                    {gt === "LONG" ? t("todo.goalModal.longDesc") : t("todo.goalModal.shortDesc")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Parent goal (only for SHORT) */}
          {type === "SHORT" && longGoals.length > 0 && (
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {t("todo.goalModal.parentGoal")}
              </label>
              <select
                value={parentGoalId}
                onChange={(e) => setParentGoalId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] text-sm px-3 py-2 text-[var(--pl-text)] outline-none focus:border-[var(--pl-accent)]"
              >
                <option value="">{t("todo.goalModal.noParent")}</option>
                {longGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("todo.goalModal.namePlaceholder")}
            className="rounded-xl"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("todo.goalModal.descPlaceholder")}
            className="rounded-xl"
          />
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              {t("todo.goalModal.targetDate")}
            </label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              {t("todo.goalModal.color")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            {t("todo.goalModal.cancel")}
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {editGoal ? t("todo.goalModal.save") : t("todo.goalModal.create")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
