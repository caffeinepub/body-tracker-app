import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, DailyEntry, Measurement, Workout, Time } from '../backend';

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
      queryClient.invalidateQueries({ queryKey: ['bodyFatEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chestEntries'] });
      queryClient.invalidateQueries({ queryKey: ['waistEntries'] });
      queryClient.invalidateQueries({ queryKey: ['hipsEntries'] });
      queryClient.invalidateQueries({ queryKey: ['workoutDurationTimeSeries'] });
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
      queryClient.invalidateQueries({ queryKey: ['bodyFatEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chestEntries'] });
      queryClient.invalidateQueries({ queryKey: ['waistEntries'] });
      queryClient.invalidateQueries({ queryKey: ['hipsEntries'] });
      queryClient.invalidateQueries({ queryKey: ['workoutDurationTimeSeries'] });
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

export function useGetBodyFatEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ date: Time; bodyFatPercent: number }>>({
    queryKey: ['bodyFatEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBodyFatEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetChestEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<Measurement[]>({
    queryKey: ['chestEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChestEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWaistEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<Measurement[]>({
    queryKey: ['waistEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWaistEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHipsEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<Measurement[]>({
    queryKey: ['hipsEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHipsEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWorkoutDurationTimeSeries() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ date: Time; totalDuration: bigint }>>({
    queryKey: ['workoutDurationTimeSeries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutDurationTimeSeries();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Parameterized comparison query that accepts three target dates
 */
export function useGetComparisonEntries(target1: Time, target2: Time, target3: Time) {
  const { actor, isFetching } = useActor();

  return useQuery<{
    entry1?: DailyEntry;
    entry2?: DailyEntry;
    entry3?: DailyEntry;
  }>({
    queryKey: ['comparisonImages', target1.toString(), target2.toString(), target3.toString()],
    queryFn: async () => {
      if (!actor) return { entry1: undefined, entry2: undefined, entry3: undefined };
      return actor.getComparisonEntries(target1, target2, target3);
    },
    enabled: !!actor && !isFetching,
  });
}
