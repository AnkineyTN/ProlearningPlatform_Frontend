import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const GoogleAuthFailure = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const reason = searchParams.get('reason')

        // Hiển thị thông báo lỗi
        const errorMessage = reason
            ? `Đăng nhập thất bại: ${reason}`
            : 'Đăng nhập với Google thất bại'

        toast.error(errorMessage)

        // Redirect về trang login sau 2 giây
        const timeout = setTimeout(() => {
            navigate('/login')
        }, 2000)

        return () => clearTimeout(timeout)
    }, [searchParams, navigate])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                <div className="mb-4">
                    <svg
                        className="mx-auto h-12 w-12 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Đăng nhập thất bại
                </h2>
                <p className="text-gray-600 mb-4">
                    {searchParams.get('reason') || 'Có lỗi xảy ra khi đăng nhập với Google'}
                </p>
                <p className="text-sm text-gray-500">
                    Đang chuyển về trang đăng nhập...
                </p>
            </div>
        </div>
    )
}

export default GoogleAuthFailure