import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { BookOpen, Loader2, Pencil, Trash2 } from "lucide-react";

import CreateNewModal from "@/components/modals/CreateNewModal";
import DeleteConfirmDialog from "@/components/modals/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import LanguageToggle from "@/components/language/language-toggle";
import ModeToggle from "@/components/theme/mode-toggle";
import { useDeleteSet, useSet, useUpdateSet } from "@/hooks/useSets";

type Props = {
  setId: string;
};

function modalPrivacyFromApi(privacy: string | undefined): string {
  const u = privacy?.toUpperCase();
  if (u === "PRIVATE") return "Private";
  return "Public";
}

function mapModalPrivacyToApi(privacy: string): "PUBLIC" | "PRIVATE" {
  const p = privacy.trim();
  if (p === "Private" || p === "Unlisted") return "PRIVATE";
  return "PUBLIC";
}

const HeaderSetDetails = ({ setId }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const id = Number(setId);
  const { data: setDetail, isLoading, isError } = useSet(id);
  const updateSetMutation = useUpdateSet();
  const deleteSetMutation = useDeleteSet();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSetList = () => {
    navigate("/sets");
  };

  const handleUpdateSubmit = async (data: {
    title: string;
    description: string;
    privacy: string;
  }) => {
    await updateSetMutation.mutateAsync({
      id,
      payload: {
        title: data.title.trim(),
        description: data.description.trim(),
        privacy: mapModalPrivacyToApi(data.privacy),
      },
    });
    toast.success(
      t("toast.setUpdated", { defaultValue: "Set updated successfully" }),
    );
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSetMutation.mutateAsync(id);
      toast.success(
        t("toast.setDeleted", { defaultValue: "Set deleted successfully" }),
      );
      setShowDeleteDialog(false);
      navigate("/sets");
    } catch (error) {
      console.error("Error deleting set:", error);
      toast.error(
        t("toast.setDeleteFailed", { defaultValue: "Failed to delete set" }),
      );
    }
  };

  const titleDisplay = setDetail?.title ?? "";
  const descriptionDisplay = setDetail?.description ?? "";

  return (
    <div className="flex items-start justify-between mb-6 gap-10">
      <div className="bg-card w-full rounded-2xl p-6 shadow-sm border border-card-secondary mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <Button
              className="w-12 h-12 shrink-0 bg-card-secondary rounded-lg flex items-center hover:bg-card-secondary/60 justify-center cursor-pointer"
              onClick={handleSetList}
            >
              <BookOpen className="text-foreground" />
            </Button>
            <div className="min-w-0">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">
                    {t("common.loading", { defaultValue: "Loading…" })}
                  </span>
                </div>
              ) : isError ? (
                <p className="text-sm text-destructive">
                  {t("set.header.loadError", {
                    defaultValue: "Could not load set details.",
                  })}
                </p>
              ) : (
                <>
                  <h1 className="text-xl font-semibold text-foreground mb-1 truncate">
                    {titleDisplay || "—"}
                  </h1>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {descriptionDisplay ||
                      t("set.header.noDescription", {
                        defaultValue: "No description",
                      })}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0 ml-2">
            <Button
              type="button"
              className="p-2 bg-card hover:bg-card-secondary rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              onClick={() => setIsUpdateModalOpen(true)}
              disabled={
                isLoading ||
                isError ||
                !setDetail ||
                updateSetMutation.isPending ||
                deleteSetMutation.isPending
              }
              aria-label={t("modal.update", { type: "set" })}
            >
              <Pencil className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button
              type="button"
              className="p-2 bg-card hover:bg-card-secondary rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              onClick={() => setShowDeleteDialog(true)}
              disabled={
                isLoading ||
                isError ||
                !setDetail ||
                updateSetMutation.isPending ||
                deleteSetMutation.isPending
              }
              aria-label={t("modal.delete", { defaultValue: "Delete" })}
            >
              <Trash2 className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between px-4 gap-4">
        <ModeToggle />
        <LanguageToggle />
      </div>

      {isUpdateModalOpen && setDetail && (
        <CreateNewModal
          key={`set-${setDetail.id}-${setDetail.updatedAt}`}
          type="Set"
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: setDetail.title,
            description: setDetail.description ?? "",
            privacy: modalPrivacyFromApi(setDetail.privacy),
          }}
          isUpdateMode
        />
      )}

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t("modal.deleteConfirmationTitle")}
        itemName={`"${titleDisplay || t("set.thisSet", { defaultValue: "this set" })}"`}
      />
    </div>
  );
};

export default HeaderSetDetails;
