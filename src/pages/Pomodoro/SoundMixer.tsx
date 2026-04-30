import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Heart, Music, Trash2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useCreateSound,
  useDeleteSound,
  useSoundsSearch,
  useToggleFavoriteSound,
  useUploadPomodoroAsset,
} from "@/hooks/usePomodoro";
import type {
  PomodoroTab,
  SoundDto,
} from "@/services/types/pomodoro.types";
import { PRESET_SOUND_VOLUME } from "./constants";
import type { ActiveSound } from "./SoundLayer";

interface Props {
  open: boolean;
  activeSounds: ActiveSound[];
  onClose: () => void;
  onChange: (next: ActiveSound[]) => void;
}

const SoundMixer = ({ open, activeSounds, onClose, onChange }: Props) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<PomodoroTab>("ALL");
  const [keyword, setKeyword] = useState("");
  const [uploadName, setUploadName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useSoundsSearch({
    tab,
    keyword: keyword.trim() || undefined,
    page: 0,
    size: 50,
  });

  const upload = useUploadPomodoroAsset();
  const createSound = useCreateSound();
  const deleteSound = useDeleteSound();
  const toggleFav = useToggleFavoriteSound();

  const items: SoundDto[] = data?.data ?? [];
  const activeMap = new Map(activeSounds.map((a) => [a.sound.id, a]));

  const handleUpload = async (file: File) => {
    if (!uploadName.trim()) {
      toast.error(t("pomodoro.toast.nameRequired"));
      return;
    }
    if (!file.type.startsWith("audio/")) {
      toast.error(t("pomodoro.toast.invalidSoundFile"));
      return;
    }
    try {
      const asset = await upload.mutateAsync({ file, type: "AUDIO" });
      await createSound.mutateAsync({
        name: uploadName.trim(),
        assetId: asset.assetId,
      });
      setUploadName("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success(t("pomodoro.toast.soundCreated"));
    } catch {
      toast.error(t("pomodoro.toast.uploadFailed"));
    }
  };

  const toggleSound = (sound: SoundDto) => {
    if (activeMap.has(sound.id)) {
      onChange(activeSounds.filter((a) => a.sound.id !== sound.id));
    } else {
      onChange([...activeSounds, { sound, volume: PRESET_SOUND_VOLUME }]);
    }
  };

  const setVolume = (id: number, volume: number) => {
    onChange(
      activeSounds.map((a) =>
        a.sound.id === id ? { ...a, volume } : a,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("pomodoro.sounds.title")}</DialogTitle>
        </DialogHeader>

        {activeSounds.length > 0 && (
          <div className="border rounded-lg p-3 bg-[var(--pl-bg-sunken)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-[var(--pl-text-muted)] tracking-wide uppercase">
                {t("pomodoro.sounds.active")}
              </div>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] underline-offset-2 hover:underline"
              >
                {t("pomodoro.sounds.clearAll")}
              </button>
            </div>
            {activeSounds.map(({ sound, volume }) => (
              <div key={sound.id} className="flex items-center gap-3">
                <Music
                  size={14}
                  className="text-[var(--pl-text-muted)] shrink-0"
                />
                <span className="text-sm flex-1 min-w-0 truncate">
                  {sound.name}
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(sound.id, parseFloat(e.target.value))}
                  className="w-32"
                />
                <button
                  type="button"
                  className="text-[var(--pl-text-faint)] hover:text-[var(--pl-text)]"
                  onClick={() => toggleSound(sound)}
                  title={t("pomodoro.sounds.remove")}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Input
            placeholder={t("pomodoro.sounds.searchPlaceholder")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <Tabs value={tab} onValueChange={(v) => setTab(v as PomodoroTab)}>
            <TabsList>
              <TabsTrigger value="ALL">{t("pomodoro.tabs.all")}</TabsTrigger>
              <TabsTrigger value="MY_UPLOADS">
                {t("pomodoro.tabs.myUploads")}
              </TabsTrigger>
              <TabsTrigger value="FAVORITES">
                {t("pomodoro.tabs.favorites")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 items-center border rounded-lg p-2 bg-[var(--pl-bg-sunken)]">
            <Input
              placeholder={t("pomodoro.sounds.uploadName")}
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              className="flex-1 min-w-[180px]"
            />
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={upload.isPending || createSound.isPending}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} />
              {upload.isPending || createSound.isPending
                ? t("pomodoro.sounds.uploading")
                : t("pomodoro.sounds.upload")}
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {isLoading && (
            <div className="text-center py-12 text-[var(--pl-text-faint)]">
              {t("common.loading")}
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <div className="text-center py-12 text-[var(--pl-text-faint)]">
              {t("pomodoro.sounds.empty")}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {items.map((s) => {
              const active = activeMap.has(s.id);
              return (
                <div
                  key={s.id}
                  className={cn(
                    "relative group rounded-lg border p-3 cursor-pointer transition-all flex items-center gap-2",
                    active
                      ? "border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]"
                      : "border-[var(--pl-border)] hover:border-[var(--pl-text-muted)]",
                  )}
                  onClick={() => toggleSound(s)}
                >
                  <Music
                    size={16}
                    className={cn(
                      "shrink-0",
                      active
                        ? "text-[var(--pl-accent-strong)]"
                        : "text-[var(--pl-text-muted)]",
                    )}
                  />
                  <div className="text-sm flex-1 min-w-0 truncate">
                    {s.name}
                  </div>
                  <button
                    type="button"
                    title={
                      s.isFavorite
                        ? t("pomodoro.unfavorite")
                        : t("pomodoro.favorite")
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav.mutate(s.id);
                    }}
                    className="text-[var(--pl-text-faint)] hover:text-[var(--pl-text)]"
                  >
                    <Heart
                      size={13}
                      fill={s.isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                  {s.source === "USER" && (
                    <button
                      type="button"
                      title={t("common.delete")}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(t("pomodoro.sounds.confirmDelete"))) {
                          deleteSound.mutate(s.id);
                        }
                      }}
                      className="text-[var(--pl-text-faint)] hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            <X size={14} />
            {t("common.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SoundMixer;
