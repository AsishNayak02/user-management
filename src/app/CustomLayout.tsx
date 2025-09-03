"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Logout from "@/input-components/Logout";
import { clearAuth, updateAuth } from "@/redux/actions/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import Cookies from "js-cookie";
import { TokenPopUp } from "@/input-components/TokenPopUp";


interface ICustomLayout {
    children: any;
}

const CustomLayout: FC<ICustomLayout> = ({ children }) => {
    const isLoggedIn = useAppSelector((state) => state.auth.isLogged);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        // const accessToken = localStorage.getItem("AccessToken");
        const accessToken = Cookies.get("AccessToken");

        if (accessToken && (pathname !== '/login' && pathname !== '/')) {
            const decoded: any = jwtDecode(accessToken);
            dispatch(updateAuth({ name: decoded?.name, role: decoded?.realm_access?.roles, organization: decoded?.organization?.[0]??'', group: decoded?.groups?.[0]??'', isLogged: true }));
        }

    }, [])

    useEffect(() => {
        // const accessToken = localStorage.getItem("AccessToken");
        // const refreshToken = localStorage.getItem("RefreshToken");
        const accessToken = Cookies.get("AccessToken");
        const refreshToken = Cookies.get("RefreshToken");
        if ((!accessToken || !refreshToken) && (pathname !== '/login' && pathname !== '/')) {
            dispatch(clearAuth());
            router.replace('/');
        }

    }, [pathname,isLoggedIn])

    return (<>
        {isLoggedIn ? <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                    <div className="flex flex-row justify-between w-full px-4">
                        <SidebarTrigger />
                        <Logout />
                    </div>
                </header>
                {children}
                <TokenPopUp />
            </SidebarInset>
        </SidebarProvider> : children}
    </>
    )
}

export default CustomLayout;
