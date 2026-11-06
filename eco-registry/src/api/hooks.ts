import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Appeal, CitizenDetails, CitizenFilters, SortState } from '../entities/citizen/types'
import { citizensApi } from './citizens'

export const queryKeys = {
  list: (filters: CitizenFilters, sort: SortState) => ['citizens', 'list', filters, sort] as const,
  details: (id: number) => ['citizens', 'details', id] as const,
  stats: ['dashboard', 'stats'] as const,
}

export const useCitizenList = (filters: CitizenFilters, sort: SortState) =>
  useQuery({
    queryKey: queryKeys.list(filters, sort),
    queryFn: () => citizensApi.query(filters, sort),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

export const useCitizen = (id: number | null) =>
  useQuery({
    queryKey: queryKeys.details(id ?? 0),
    queryFn: () => citizensApi.getDetails(id!),
    enabled: id !== null,
    staleTime: 60_000,
  })

export const useDashboardStats = () =>
  useQuery({
    queryKey: queryKeys.stats,
    queryFn: citizensApi.stats,
    staleTime: 60_000,
  })

function useCitizenMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<CitizenDetails>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (citizen) => {
      client.setQueryData(queryKeys.details(citizen.id), citizen)
      client.invalidateQueries({ queryKey: ['citizens', 'list'] })
      client.invalidateQueries({ queryKey: queryKeys.stats })
    },
  })
}

export const useSaveCitizen = () => useCitizenMutation((citizen: CitizenDetails) => citizensApi.save(citizen))

export const useCreateCitizen = () => useCitizenMutation((draft: CitizenDetails) => citizensApi.create(draft))

export const useAddAppeal = () =>
  useCitizenMutation(
    ({ citizen, appeal }: { citizen: CitizenDetails; appeal: Omit<Appeal, 'id' | 'number' | 'citizenId'> }) =>
      citizensApi.addAppeal(citizen, appeal),
  )
