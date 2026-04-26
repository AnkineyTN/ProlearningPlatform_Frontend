import { useQuery } from "@tanstack/react-query";
import { activityLogAPI } from "@/services/endpoints/activityLog";

export const useHeatmap = (months = 6) =>
  useQuery({
    queryKey: ["activity-heatmap", months],
    queryFn: async () => {
      const res = await activityLogAPI.getHeatmap(months);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useStreak = () =>
  useQuery({
    queryKey: ["activity-streak"],
    queryFn: async () => {
      const res = await activityLogAPI.getStreak();
      return res.data.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

export const useActivitySummary = (days = 30) =>
  useQuery({
    queryKey: ["activity-summary", days],
    queryFn: async () => {
      const res = await activityLogAPI.getSummary(days);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
