import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { authAPI } from "@/services/endpoints/auth";
import { setUser, logout } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

type Props = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const response = await authAPI.getMe();
          dispatch(setUser(response.data.data));
        } catch {
          dispatch(logout());
        }
      }
    };

    fetchUser();
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
