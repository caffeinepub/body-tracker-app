import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, DailyEntry, Measurement, Workout } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<DailyEntry[]>({
    queryKey: ['allEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEntryByDate() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (date: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEntryByDate(date);
    },
  });
}

export function useCreateOrUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: DailyEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEntries'] });
      queryClient.invalidateQueries({ queryKey: ['weightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['workoutEntries'] });
      queryClient.invalidateQueries({ queryKey: ['comparisonImages'] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteEntry(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEntries'] });
      queryClient.invalidateQueries({ queryKey: ['weightEntries'] });
      queryClient.invalidateQueries({ queryKey: ['workoutEntries'] });
      queryClient.invalidateQueries({ queryKey: ['comparisonImages'] });
    },
  });
}

export function useGetWeightEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<Measurement[]>({
    queryKey: ['weightEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWeightEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWorkoutEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<Workout[]>({
    queryKey: ['workoutEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComparisonImages() {
  const { actor, isFetching } = useActor();

  return useQuery<{
    day1?: DailyEntry;
    day30?: DailyEntry;
    day90?: DailyEntry;
  }>({
    queryKey: ['comparisonImages'],
    queryFn: async () => {
      if (!actor) return { day1: undefined, day30: undefined, day90: undefined };
      return actor.getComparisonImages();
    },
    enabled: !!actor && !isFetching,
  });
}
