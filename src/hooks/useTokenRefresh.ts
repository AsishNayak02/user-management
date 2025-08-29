"use client";
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { updateAuth, clearAuth } from "@/redux/actions/authSlice";
import { useAppDispatch } from "@/redux/hooks/redux.hooks";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/lib/utils.user";
import { refreshAccessToken } from "@/api/userLogin";



export function useTokenRefresh() {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const dispatch = useAppDispatch();

    const checkTokenExpiry = useCallback(() => {
        const accessToken = Cookies.get('AccessToken');
        if (!accessToken) return;

        try {
            const decoded: DecodedToken = jwtDecode(accessToken);
            const expiry = decoded?.exp * 1000; // convert to ms
            const now = Date.now();
            const remaining = Math.floor((expiry - now) / 1000); // in seconds

            if (remaining <= 60 && remaining > 0) {
                setTimeLeft(remaining);
                setShowDialog(true);
            } else if (remaining <= 0) {
                dispatch(clearAuth());
                Cookies.remove('AccessToken');
                Cookies.remove('RefreshToken');
                setShowDialog(false);
                setTimeLeft(null);
            }
            else {
                setShowDialog(false);
                setTimeLeft(null);
            }
        } catch (err) {
            console.error('Failed to decode token', err);
        }
    }, [dispatch]);

    const refreshToken = async () => {
        try {
            const refreshToken = Cookies.get('RefreshToken');
            if (!refreshToken) return;

            const res = await refreshAccessToken();
            const { accessToken } = res.data;

            const decoded: DecodedToken = jwtDecode(accessToken);
            dispatch(updateAuth({ name: decoded?.name, role: decoded?.realm_access?.roles, organization: decoded?.organization?.[0] ?? '', group: decoded?.groups?.[0] ?? '', isLogged: true }));

            setShowDialog(false);
            setTimeLeft(null);
        } catch (err) {
            console.error('Refresh failed', err);
            dispatch(clearAuth());
        }
    };

    // 🔹 Start checking token expiry every 20s (not too frequent)
    useEffect(() => {
        checkTokenExpiry();
        const interval = setInterval(() => {
            checkTokenExpiry();
        }, 20000);

        return () => clearInterval(interval);
    }, [checkTokenExpiry]);

    // 🔹 If dialog is visible, run a 1s countdown
    useEffect(() => {
        if (!showDialog || timeLeft === null) return;

        const countdown = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev && prev > 1) return prev - 1;
                clearInterval(countdown);
                return 0;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [showDialog]);

    return { showDialog, timeLeft, refreshToken, dismiss: () => setShowDialog(false) };
}
