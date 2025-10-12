import {useQuery} from '@tanstack/react-query'
import { setAPI, type SetQueryParams } from '@/services/api'

export const useSetData = ({ page, size, sort }: SetQueryParams) => {
    return useQuery({
        queryKey: ['setData', { page, size, sort }],
        queryFn: () => setAPI.getSetData({ page, size, sort }),
    })
}

// export const useUsersList = (params?: UsersListParams) => {
//     return useQuery({
//         queryKey: ['usersList', params],
//         queryFn: () => dashboardAPI.getUsers(params),
//         placeholderData: keepPreviousData,
//     })
// }
