import { useEffect, useState } from "react";
import { useSetData } from "@/hooks/useSets";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Checklist from "@/components/cards/CheckListCard";
import SetCard, { type Set } from "@/components/cards/SetCard";
import CalendarCard from "@/components/cards/CalendarCard";
import Header from "@/components/header/HeaderDashboard";
import { useDeleteSet, useUpdateSet } from "@/hooks/useSets";
import { type UpdateSetPayload } from "@/services/types/set.types";
import CreateNewModal from "@/components/modals/CreateNewModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { getTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function parseGlobalSearchItems(data: unknown): Record<string, unknown>[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as Record<string, unknown>[];
    if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
    if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  }
  return [];
}

function searchResultTitle(item: Record<string, unknown>): string {
  const raw = item.title ?? item.name ?? item.code ?? item.id;
  return raw != null ? String(raw) : "—";
}

function searchResultHref(item: Record<string, unknown>): string | null {
  const id = item.id ?? item.resourceId;
  if (id == null) return null;
  const typeRaw = item.type ?? item.resourceType ?? item.searchType ?? "";
  const type = String(typeRaw).toUpperCase();
  const setId = item.setId ?? item.set_id;
  if (type.includes("SET")) return `/sets/${id}`;
  if (type.includes("NOTE")) return `/note/${id}`;
  if (type.includes("FLASH") && setId != null)
    return `/sets/${setId}/flashcards/${id}`;
  if (type.includes("EXAM") && setId != null)
    return `/sets/${setId}/exams/${id}`;
  return null;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteSetMutation = useDeleteSet();
  const updateSetMutation = useUpdateSet();
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [checklistItems, setChecklistItems] = useState([
    { label: "Study for 2000 minutes", checked: false },
    { label: "Sleep...", checked: false },
    { label: "Complete 2 reading exercise", checked: false },
    { label: "Complete 2 reading exercise", checked: false },
  ]);
  const page = 0;
  const size = 4;
  const sort = [{ property: "id", direction: "ASC" }];

  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(searchKeyword.trim()),
      400,
    );
    return () => window.clearTimeout(t);
  }, [searchKeyword]);

  const {
    data: searchPayload,
    isFetching: searchLoading,
    isError: searchError,
  } = useGlobalSearch(debouncedSearch, { size: 15 });
  const searchItems = parseGlobalSearchItems(searchPayload?.data);

  const { data: setData } = useSetData({ page, size, sort });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sets: Set[] = (setData?.data.data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    code: item.code,
    progress: item.progress,
    duration: item.duration,
    flashcards: item.flashcards,
    tests: item.tests,
    audio: item.audio,
    video: item.video,
    lastUpdated: item.lastUpdated,
    date: item.date,
    description: item.description ?? "",
    numNotes: item.numNotes ?? 0,
    updated_at: getTimeAgo(item.updatedAt),
    created_at: new Date(item.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  const handleDeleteSet = async (id: number) => {
    try {
      await deleteSetMutation.mutateAsync(id);
      toast.success("Set deleted successfully");
    } catch (error) {
      console.error("Error deleting set:", error);
      toast.error("Failed to delete set");
    }
  };

  const handleUpdateSet = (set: Set) => {
    setSelectedSet(set);
    setIsUpdateModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateSubmit = async (data: any) => {
    if (!selectedSet) return;

    try {
      const payload: UpdateSetPayload = {
        ...data,
        privacy: data.privacy === "PUBLIC" ? "PUBLIC" : "PRIVATE",
      };

      await updateSetMutation.mutateAsync({
        id: selectedSet.id,
        payload,
      });
      setIsUpdateModalOpen(false);
      setSelectedSet(null);
    } catch (error) {
      console.error("Error updating set:", error);
    }
  };

  const handleViewSets = () => {
    navigate("/sets");
  };

  const handleSetAccess = (setId: number) => {
    navigate(`/sets/${setId}`);
  };

  const handleViewNotes = () => {
    navigate("/notes");
  };

  // const handleAccessNote = (id: string) => {
  //     navigate(`/note/${id}`);
  // };

  const handleChecklistChange = (idx: number, checked: boolean) => {
    const newItems = [...checklistItems];
    newItems[idx].checked = checked;
    setChecklistItems(newItems);
  };
  const completionRate = Math.round(
    (checklistItems.filter((item) => item.checked).length /
      checklistItems.length) *
      100,
  );
  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <Header
          onSearch={(val) => setSearchKeyword(val)}
          title={t("header.welcome")}
        />

        {debouncedSearch.length > 0 && (
          <Card className='mb-8 p-4 border-border'>
            <h3 className='text-lg font-semibold mb-3'>
              {t("dashboard.searchResults", { defaultValue: "Search results" })}
            </h3>
            {searchLoading && (
              <p className='text-sm text-muted-foreground'>
                {t("dashboard.searchLoading", { defaultValue: "Searching…" })}
              </p>
            )}
            {searchError && (
              <p className='text-sm text-destructive'>
                {t("dashboard.searchError", {
                  defaultValue: "Search failed. Try again.",
                })}
              </p>
            )}
            {!searchLoading && !searchError && searchItems.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                {t("dashboard.searchEmpty", { defaultValue: "No matches." })}
              </p>
            )}
            {!searchLoading && searchItems.length > 0 && (
              <ul className='divide-y divide-border rounded-md border border-border overflow-hidden'>
                {searchItems.map((item, idx) => {
                  const href = searchResultHref(item);
                  const title = searchResultTitle(item);
                  const key = `${title}-${idx}`;
                  return (
                    <li
                      key={key}
                      className='flex items-center justify-between gap-2 bg-card px-3 py-2 text-sm'
                    >
                      <span className='truncate font-medium'>{title}</span>
                      {href ? (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='shrink-0 gap-1'
                          onClick={() => navigate(href)}
                        >
                          <ExternalLink className='h-3.5 w-3.5' />
                          {t("dashboard.open", { defaultValue: "Open" })}
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        )}

        <div className='grid grid-cols-3 gap-12'>
          {/* Left Column */}
          <div className='col-span-2 space-y-8'>
            <Checklist
              items={checklistItems}
              onItemChange={handleChecklistChange}
              completionRate={completionRate}
            />
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>{t("dashboard.yourSets")}</h2>
              <button
                onClick={handleViewSets}
                className='text-sm flex items-center gap-1 hover:underline cursor-pointer'
              >
                {t("dashboard.viewAll")} <ChevronRight className='w-4 h-4' />
              </button>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {sets.map((set: Set) => (
                <SetCard
                  key={set.id}
                  set={set}
                  onAccess={handleSetAccess}
                  onDelete={handleDeleteSet}
                  onUpdate={handleUpdateSet}
                />
              ))}
            </div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>
                {t("dashboard.recentNotes")}
              </h2>
              <button
                onClick={handleViewNotes}
                className='text-sm flex items-center gap-1 hover:underline cursor-pointer'
              >
                {t("dashboard.viewAll")} <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Calendar */}
            <CalendarCard />
          </div>
        </div>
      </div>
      {/* Update Modal */}
      {selectedSet && (
        <CreateNewModal
          isUpdateMode={true}
          type='Set'
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedSet(null);
          }}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: selectedSet.title,
            description: selectedSet.description,
            privacy: "Public", // hoặc lấy từ set nếu có field này
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
