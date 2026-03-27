import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { setAPI } from "@/services/endpoints/sets";
import {
  type CreateSetPayload,
  type SetQueryParams,
  type UpdateSetPayload,
} from "@/services/types/set.types";

export const useSetData = (params: SetQueryParams) => {
  return useQuery({
    queryKey: ["setData", params],
    queryFn: () => setAPI.getSetData(params),
  });
};

export const useSet = (setId: number) => {
  return useQuery({
    queryKey: ["set", setId],
    queryFn: async () => {
      const res = await setAPI.getSetById(setId);
      return res.data.data;
    },
    enabled: Number.isFinite(setId) && setId > 0,
  });
};

export const useCreateSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSetPayload) => setAPI.createSet(payload),
    onSuccess: () => {
      // Refresh lại danh sách sets sau khi tạo thành công
      queryClient.invalidateQueries({ queryKey: ["setData"] });
    },
  });
};

// Hook for deleting a set
export const useDeleteSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => setAPI.deleteSet(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["setData"] });
      queryClient.removeQueries({ queryKey: ["set", deletedId] });
    },
    onError: (error) => {
      console.error("Error deleting set:", error);
    },
  });
};

// Hook for updating a set
export const useUpdateSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSetPayload }) =>
      setAPI.updateSet(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["setData"] });
      queryClient.invalidateQueries({ queryKey: ["set", variables.id] });
    },
    onError: (error) => {
      console.error("Error updating set:", error);
    },
  });
};
