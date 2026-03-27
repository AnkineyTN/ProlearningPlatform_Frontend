import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, FolderX } from "lucide-react";
import SetCard from "@/components/cards/SetCard";
import HeaderSet from "@/components/header/HeaderSet";
import CreateNewModal from "@/components/modals/CreateNewModal";
import { Button } from "@/components/ui/button";
import {
  useDeleteSet,
  useUpdateSet,
  useSetData,
  useCreateSet,
} from "@/hooks/useSets";
import { type Set } from "@/components/cards/SetCard";
import {
  type CreateSetPayload,
  type UpdateSetPayload,
} from "@/services/types/set.types";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getTimeAgo } from "@/lib/utils";
import {
  ResourceFiltersBar,
  type ListPrivacyFilter,
} from "@/components/lists/ResourceFiltersBar";

const PAGE_SIZE = 6;
const SORT_CONFIG = [{ property: "id", direction: "ASC" }];

const mapSetData = (items: any[]): Set[] =>
  items.map((item) => ({
    id: item.id ?? "",
    title: item.title,
    code: item.code,
    progress: item.progress,
    duration: item.duration,
    flashcards: item.flashcards,
    tests: item.tests,
    audio: item.audio,
    video: item.video,
    updated_at: getTimeAgo(item.updatedAt),
    created_at: new Date(item.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    description: item.description,
    numNotes: item.numNotes ?? 0,
  }));

export default function SetListPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(t("setlist.all"));
  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState<ListPrivacyFilter>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);

  const navigate = useNavigate();
  const createSetMutation = useCreateSet();
  const deleteSetMutation = useDeleteSet();
  const updateSetMutation = useUpdateSet();

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(listSearch.trim()), 350);
    return () => window.clearTimeout(t);
  }, [listSearch]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacyFilter]);

  const { data: setData } = useSetData({
    page: currentPage,
    size: PAGE_SIZE,
    sort: SORT_CONFIG,
    q: debouncedQ || undefined,
    privacy: privacyFilter || undefined,
  });

  const sets = mapSetData(setData?.data.data || []);
  const totalPages = setData?.data.metadata?.totalPages || 1;
  const totalItems = setData?.data.metadata?.totalItems || 0;
  const TABS = [
    { id: t("setlist.all"), label: t("setlist.all"), count: totalItems },
    { id: t("setlist.completed"), label: t("setlist.completed"), count: 0 },
    { id: t("setlist.in_progress"), label: t("setlist.in_progress"), count: 0 },
  ] as const;

  const filteredSets = activeTab === t("setlist.all") ? sets : [];

  const handleCreateSet = async (data: any) => {
    try {
      const payload: CreateSetPayload = {
        ...data,
        privacy: data.privacy === "PUBLIC" ? "PUBLIC" : "PRIVATE",
      };

      await createSetMutation.mutateAsync(payload);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating set:", error);
      toast.error("Failed to create set. Please try again.");
    }
  };

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
      toast.error("Failed to update set. Please try again.");
    }
  };

  const handleSetAccess = (setId: number) => {
    navigate(`/sets/${setId}`);
  };

  const handleSearch = (query: string) => {
    setListSearch(query);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    setCurrentPage((prev) =>
      direction === "prev"
        ? Math.max(0, prev - 1)
        : Math.min(totalPages - 1, prev + 1)
    );
  };

  return (
    <div className='min-h-screen p-8'>
      <div className='max-w-7xl mx-auto'>
        <HeaderSet onSearch={handleSearch} />

        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-2'>
            <span className='text-lg font-medium mr-4'>
              {t("setlist.your_set")}
            </span>
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    : "bg-card text-muted-foreground hover:bg-card-secondary"
                }`}
              >
                {tab.label} <span className='ml-1'>{tab.count}</span>
              </Button>
            ))}
          </div>

          <ResourceFiltersBar
            showSearch={false}
            privacy={privacyFilter}
            onPrivacyChange={setPrivacyFilter}
          />

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={createSetMutation.isPending}
            className='px-4 py-2 bg-card text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium flex items-center gap-2 hover:bg-card-secondary transition-colors disabled:opacity-50 cursor-pointer'
          >
            <Plus className='w-5 h-5' />
            {createSetMutation.isPending
              ? t("setlist.creating")
              : t("setlist.new_set")}
          </Button>
        </div>

        {filteredSets.length > 0 ? (
          <div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
              {filteredSets.map((set) => (
                <SetCard
                  key={set.id}
                  set={set}
                  onAccess={handleSetAccess}
                  onDelete={handleDeleteSet}
                  onUpdate={handleUpdateSet}
                />
              ))}
            </div>
            <div className='flex justify-center items-center gap-4'>
              <Button
                variant='ghost'
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 0}
                className='p-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft className='w-5 h-5 text-muted-foreground' />
              </Button>

              <span className='font-medium'>
                {currentPage + 1}/{totalPages}
              </span>

              <Button
                variant='ghost'
                onClick={() => handlePageChange("next")}
                disabled={currentPage === totalPages - 1}
                className='p-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronRight className='w-5 h-5 text-muted-foreground' />
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 mb-8'>
            <div className='text-center'>
              <FolderX className='mx-auto mb-4 text-6xl w-20 h-20' />
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                No sets available
              </h3>
              <p className='text-muted-foreground mb-6'>
                {activeTab === "all"
                  ? "Create your first study set to get started"
                  : `No ${
                      activeTab === "completed" ? "completed" : "in progress"
                    } sets yet`}
              </p>
              {activeTab === "all" && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className='px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity'
                >
                  Create New Set
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateNewModal
        type='Set'
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSet}
      />

      {/* Update Modal */}
      {selectedSet && (
        <CreateNewModal
          type='Set'
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedSet(null);
          }}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: selectedSet.title,
            description:
              selectedSet.description === "No description available..."
                ? ""
                : selectedSet.description,
            privacy: "Public",
          }}
          isUpdateMode={true}
        />
      )}
    </div>
  );
}
