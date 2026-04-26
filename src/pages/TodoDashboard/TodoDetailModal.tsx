import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ExternalLink, FileText, FlipHorizontal, GraduationCap, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { todoAPI } from "@/services/endpoints/todo";
import type { Goal, ResourceRef, Todo, TodoPriority, TodoStatus, TodoType } from "@/services/types/todo.types";
import { TODO_STATUS_LABEL, TODO_TYPE_LABEL, type ResourceType } from "./constants";

type TodoDetailModalProps = {
  open: boolean;
  todo: Todo | null;
  goals: Goal[];
  onClose: () => void;
};

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  set: <BookOpen className="w-3.5 h-3.5" />,
  note: <FileText className="w-3.5 h-3.5" />,
  flashcard: <FlipHorizontal className="w-3.5 h-3.5" />,
  exam: <GraduationCap className="w-3.5 h-3.5" />,
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  set: "oklch(0.7 0.15 260)",
  note: "oklch(0.72 0.12 180)",
  flashcard: "oklch(0.7 0.15 310)",
  exam: "oklch(0.72 0.15 40)",
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  set: "Set",
  note: "Ghi chú",
  flashcard: "Flashcard",
  exam: "Bài kiểm tra",
};

type RefField = "setRefs" | "noteRefs" | "flashcardRefs" | "examRefs";
const TYPE_TO_FIELD: Record<ResourceType, RefField> = {
  set: "setRefs",
  note: "noteRefs",
  flashcard: "flashcardRefs",
  exam: "examRefs",
};

const AddResourceRow = ({
  type,
  onAdd,
}: {
  type: ResourceType;
  onAdd: (ref: ResourceRef) => void;
}) => {
  // const [id, setId] = useState("");
  const [setId, setSetId] = useState("");
  const [title, setTitle] = useState("");
  const needsSetId = type !== "set";

  const handleAdd = () => {
    const parsedId = Number(setId);
    if (!parsedId) return toast.warn("ID không hợp lệ");
    if (needsSetId && !setId) return toast.warn("Cần nhập Set ID");
    onAdd({ id: parsedId, setId: needsSetId ? Number(setId) : null, title: title || null });
    setSetId("");
    setTitle("");
  };

  return (
    <div className="flex gap-1.5 items-center">
      <input
        value={setId}
        onChange={(e) => setSetId(e.target.value)}
        placeholder="ID"
        className="w-16 rounded-lg border border-[var(--pl-border)] bg-transparent text-xs px-2 py-1.5 text-[var(--pl-text)] outline-none"
      />
      {needsSetId && (
        <input
          value={setId}
          onChange={(e) => setSetId(e.target.value)}
          placeholder="Set ID"
          className="w-16 rounded-lg border border-[var(--pl-border)] bg-transparent text-xs px-2 py-1.5 text-[var(--pl-text)] outline-none"
        />
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tên hiển thị..."
        className="flex-1 rounded-lg border border-[var(--pl-border)] bg-transparent text-xs px-2 py-1.5 text-[var(--pl-text)] outline-none"
      />
      <button
        onClick={handleAdd}
        className="p-1.5 rounded-lg bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};

const TodoDetailModal = ({ open, todo, goals, onClose }: TodoDetailModalProps) => {
  const qc = useQueryClient();

  const [title, setTitle] = useState(todo?.title ?? "");
  const [description, setDescription] = useState(todo?.description ?? "");
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? "");
  const [todoType, setTodoType] = useState<TodoType>(todo?.type ?? "DAILY");
  const [todoStatus, setTodoStatus] = useState<TodoStatus>(todo?.status ?? "TODO");
  const [goalId, setGoalId] = useState<number | "">(todo?.goalId ?? "");

  const [setRefs, setSetRefs] = useState<ResourceRef[]>(todo?.setRefs ?? []);
  const [noteRefs, setNoteRefs] = useState<ResourceRef[]>(todo?.noteRefs ?? []);
  const [flashcardRefs, setFlashcardRefs] = useState<ResourceRef[]>(todo?.flashcardRefs ?? []);
  const [examRefs, setExamRefs] = useState<ResourceRef[]>(todo?.examRefs ?? []);
  const [addingType, setAddingType] = useState<ResourceType | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof todoAPI.updateTodo>[1]) =>
      todoAPI.updateTodo(todo!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Cập nhật todo thành công!");
      onClose();
    },
    onError: () => toast.error("Cập nhật todo thất bại"),
  });

  if (!open || !todo) return null;

  const getNavUrl = (type: ResourceType, ref: ResourceRef): string => {
    switch (type) {
      case "set": return `/sets/${ref.id}`;
      case "note": return `/sets/${ref.setId}/notes/${ref.id}`;
      case "flashcard": return `/sets/${ref.setId}/flashcards/${ref.id}`;
      case "exam": return `/sets/${ref.setId}/exams/${ref.id}`;
    }
  };

  const removeRef = (type: ResourceType, id: number) => {
    const update = (prev: ResourceRef[]) => prev.filter((r) => r.id !== id);
    if (type === "set") setSetRefs(update);
    else if (type === "note") setNoteRefs(update);
    else if (type === "flashcard") setFlashcardRefs(update);
    else setExamRefs(update);
  };

  const addRef = (type: ResourceType, ref: ResourceRef) => {
    const update = (prev: ResourceRef[]) =>
      prev.some((r) => r.id === ref.id) ? prev : [...prev, ref];
    if (type === "set") setSetRefs(update);
    else if (type === "note") setNoteRefs(update);
    else if (type === "flashcard") setFlashcardRefs(update);
    else setExamRefs(update);
    setAddingType(null);
  };

  const handleSave = () => {
    if (!title.trim()) return toast.warn("Tên todo không được để trống");
    updateMutation.mutate({
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate || undefined,
      type: todoType,
      status: todoStatus,
      goalId: goalId !== "" ? Number(goalId) : undefined,
      clearGoal: goalId === "" && todo.goalId != null,
      setRefs,
      noteRefs,
      flashcardRefs,
      examRefs,
    });
  };

  const allRefs: { type: ResourceType; refs: ResourceRef[] }[] = [
    { type: "set", refs: setRefs },
    { type: "note", refs: noteRefs },
    { type: "flashcard", refs: flashcardRefs },
    { type: "exam", refs: examRefs },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--pl-bg)] rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">Chi tiết Todo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên todo..."
            className="rounded-xl"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả (tùy chọn)..."
            className="rounded-xl"
          />

          {/* Type + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Loại task</label>
              <div className="flex gap-1.5">
                {(["DAILY", "WEEKLY"] as TodoType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTodoType(t)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs border transition-all ${
                      todoType === t
                        ? "border-[var(--pl-accent)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] font-medium"
                        : "border-[var(--pl-border)] text-muted-foreground"
                    }`}
                  >
                    {TODO_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Trạng thái</label>
              <div className="flex gap-1">
                {(["TODO", "DONE", "SKIPPED"] as TodoStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTodoStatus(s)}
                    className={`flex-1 rounded-lg px-1.5 py-1.5 text-[10px] border transition-all ${
                      todoStatus === s
                        ? "border-[var(--pl-accent)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] font-medium"
                        : "border-[var(--pl-border)] text-muted-foreground"
                    }`}
                  >
                    {TODO_STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TodoPriority)}
                className="w-full rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] text-sm px-3 py-2 text-[var(--pl-text)] outline-none"
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Ngày hết hạn</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Goal</label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] text-sm px-3 py-2 text-[var(--pl-text)] outline-none"
            >
              <option value="">-- Không có goal --</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          {/* Linked resources */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[var(--pl-text)]">Tài nguyên liên kết</label>
              <div className="flex gap-1">
                {(["set", "note", "flashcard", "exam"] as ResourceType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAddingType(addingType === t ? null : t)}
                    title={`Thêm ${RESOURCE_LABELS[t]}`}
                    style={{ color: addingType === t ? RESOURCE_COLORS[t] : undefined }}
                    className={`p-1.5 rounded-lg border transition-all text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] ${
                      addingType === t ? "border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]" : "border-[var(--pl-border)]"
                    }`}
                  >
                    {RESOURCE_ICONS[t]}
                  </button>
                ))}
              </div>
            </div>

            {addingType && (
              <div className="mb-2 p-2 rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg-elev)]">
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  Thêm {RESOURCE_LABELS[addingType]}
                </p>
                <AddResourceRow type={addingType} onAdd={(ref) => addRef(addingType, ref)} />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {allRefs.flatMap(({ type, refs }) =>
                refs.map((ref) => {
                  const navUrl = getNavUrl(type, ref);
                  return (
                    <div
                      key={`${type}-${ref.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border text-[11px] group"
                      style={{
                        borderColor: `color-mix(in oklch, ${RESOURCE_COLORS[type]} 40%, transparent)`,
                        background: `color-mix(in oklch, ${RESOURCE_COLORS[type]} 10%, transparent)`,
                        color: RESOURCE_COLORS[type],
                      }}
                    >
                      {RESOURCE_ICONS[type]}
                      <a
                        href={navUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline flex items-center gap-1"
                        target="_self"
                        rel="noopener noreferrer"
                      >
                        {ref.title ?? `${RESOURCE_LABELS[type]} #${ref.id}`}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                      <button
                        onClick={() => removeRef(type, ref.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }),
              )}
              {allRefs.every(({ refs }) => refs.length === 0) && (
                <p className="text-[11px] text-[var(--pl-text-faint)] italic">
                  Chưa có tài nguyên nào. Dùng các nút trên để thêm.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={updateMutation.isPending}
            onClick={handleSave}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoDetailModal;
