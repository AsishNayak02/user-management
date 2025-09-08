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
    const isAuthPage = !!pathname && (pathname === "/login" || pathname === "/session-expired");
    useEffect(() => {

        if (!pathname || isAuthPage) return;

        // const accessToken = localStorage.getItem("AccessToken");
        const accessToken = Cookies.get("AccessToken");
        if (!accessToken) return;

        try {
      const decoded: any = jwtDecode(accessToken);
      dispatch(
        updateAuth({
          name: decoded?.name,
          role: decoded?.realm_access?.roles,
          organization: decoded?.organization?.[0] ?? "",
          group: decoded?.groups?.[0] ?? "",
          isLogged: true,
        })
      );
    } catch (err) {
      dispatch(clearAuth());
      router.replace("/session-expired");
    }
  }, [pathname, dispatch, router, isAuthPage]);

  useEffect(() => {
    if (!pathname || isAuthPage) return;

    const accessToken = Cookies.get("AccessToken");
    const refreshToken = Cookies.get("RefreshToken");

    // if tokens missing -> clear and redirect to session-expired (only for non-auth pages)
    if (!accessToken || !refreshToken) {
      dispatch(clearAuth());
      router.replace("/session-expired");
    }
  }, [pathname, isLoggedIn, dispatch, router, isAuthPage]);


    return (<>
        {isLoggedIn && !isAuthPage ? <SidebarProvider>
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
