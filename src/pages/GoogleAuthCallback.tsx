import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast' // hoặc toast library bạn đang dùng

const GoogleAuthCallback = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const accessToken = searchParams.get('accessToken')

        if (accessToken) {
            // Lưu token vào localStorage
            localStorage.setItem('accessToken', accessToken)

            // Hoặc nếu bạn dùng context/redux thì dispatch action ở đây
            // dispatch(setAccessToken(accessToken))

            toast.success('Đăng nhập thành công!')

            // Redirect về dashboard
            navigate('/dashboard')
        } else {
            // Không có token, redirect về login
            toast.error('Đăng nhập thất bại')
            navigate('/login')
        }
    }, [searchParams, navigate])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
            </div>
        </div>
    )
}

export default GoogleAuthCallback