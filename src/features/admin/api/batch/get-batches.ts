import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { type Batch } from '@/types'
import { batchKeys } from './batch-keys'
import { APPLICATION_NAME } from '@/lib/constant'

const getBatches = async (): Promise<Batch[]> => {
  return apiClient.get(`application/${APPLICATION_NAME}/batches`)
}

export const useGetBatches = () => {
  return useQuery({
    queryKey: batchKeys.lists(),
    queryFn: getBatches,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

