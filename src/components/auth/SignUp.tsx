import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { signupSchema, type SignupFormData } from '@/schemas/auth'
import { authAPI } from '@/services/endpoints/auth'
import { loginStart, loginFailure, loginSuccess } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircleIcon, Lock, Mail, User, Eye, EyeOff, RefreshCw, CircleDot } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import LogoFG from '@/assets/logo_fg';

export default function SignUp() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const signupSchemaInstance = signupSchema(t)
    const { isLoading, error } = useAppSelector(state => state.auth)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchemaInstance),
        defaultValues: {
            role: 'ROLE_USER',
        },
    })

    const handleGoogleLogin = async () => {
        try {
            const response = await authAPI.googleAuth()
            window.location.href = response.data.data.authorizationUrl
        } catch (error: any) {
            toast.error(t('signin.failedGoogleConnect'))
        }
    }

    const onSubmit = async (data: SignupFormData) => {
        dispatch(loginStart())
        try {
            await authAPI.signup({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                role: 'ROLE_USER'
            })

            toast.success('🎉 ' + t('signup.success'), {
                position: "top-right",
                autoClose: 2000,
            })

            const loginResponse = await authAPI.login({
                email: data.email,
                password: data.password
            })

            dispatch(loginSuccess({
                user: loginResponse.data.data.userResponseDto,
                token: loginResponse.data.data.accessToken
            }))

            navigate('/onboarding')
        }
        catch (error: any) {
            dispatch(loginFailure(
                t('signup.failed')
            ))
        }
    }

    return (
        <div className={"min-w-screen min-h-screen flex items-center justify-center"}>
            <a href="/dashboard">
                <div className="absolute top-8 left-10 size-10">
                    <LogoFG />
                </div>
            </a>
            <div className="w-[50vw] flex items-center justify-center">
                <Card className="w-120 px-4 py-6">
                    <CardHeader className="text-start">
                        <CardTitle className="font-bold text-2xl">{t('signup.title')}</CardTitle>
                        <CardDescription>
                            {t('signup.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 text-start">
                            <div className='flex gap-4'>
                                <div>
                                    <Label htmlFor="name" className="font-bold text-base mb-1">
                                        {t('signup.firstName')}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative mb-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User size={16} />
                                        </span>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            {...register('firstName')}
                                            placeholder={t('signup.firstNamePlaceholder')}
                                            className={`ps-9 ${errors.firstName ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="text-sm text-red-500">{errors.firstName.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="name" className="font-bold text-base mb-1">
                                        {t('signup.lastName')}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative mb-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User size={16} />
                                        </span>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            {...register('lastName')}
                                            placeholder={t('signup.lastNamePlaceholder')}
                                            className={`ps-9 ${errors.lastName ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="text-sm text-red-500">{errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="email" className="font-bold text-base mb-1">{t('signup.email')}</Label>
                                <div className="relative mb-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail size={16} />
                                    </span>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder={t('signup.emailPlaceholder')}
                                        className={`ps-9 ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password" className="font-bold text-base mb-1">
                                    {t('signup.password')}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative mb-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={16} />
                                    </span>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        placeholder={"••••••••"}
                                        className={`ps-9 pe-9 ${errors.password ? 'border-red-500' : ''}`}
                                    />
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </span>
                                </div>
                                {errors.password ? (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                ) : (
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <CircleDot size={16} />
                                        {t('signup.passwordRequirement')}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword" className="font-bold text-base mb-1">
                                    {t('signup.confirmPassword')}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative mb-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={16} />
                                    </span>
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword')}
                                        placeholder={"••••••••"}
                                        className={`ps-9 pe-9 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    />
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </span>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full cursor-pointer mt-2"
                                disabled={isLoading}
                                data-testid="create-btn"
                            >
                                {isLoading && (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                )}
                                {t('signup.createAccount')}
                            </Button>
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-card text-muted-foreground relative z-10 px-2">
                                    {t('signup.orContinueWith')}
                                </span>
                            </div>
                            <Button
                                variant={"outline"}
                                className="w-full cursor-pointer"
                                type="button"
                                onClick={handleGoogleLogin}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Google
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-muted-foreground">
                            {t('signup.haveAccount')}
                            <Link to="/login" className="ms-1 text-foreground font-bold underline">
                                {t('signup.signIn')}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
            <div className={"w-[50vw] h-screen bg-gradient-to-r from-popover-foreground to-muted-foreground px-14 py-10"}>
                <div className={"text-background text-8xl font-bold"}>CREATE AN ACCOUNT!</div>
            </div>
        </div>
    )
}