import {useQuery} from '@tanstack/react-query'
import { setAPI, type SetQueryParams } from '@/services/api'

export const useSetData = ({ page, size, sort }: SetQueryParams) => {
    return useQuery({
        queryKey: ['setData', { page, size, sort }],
        queryFn: () => setAPI.getSetData({ page, size, sort }),
    })
}
