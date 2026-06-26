import React, { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth_action";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
    const authed = await isAuthenticated();
    if (authed) redirect("/");

    return <>{children}</>;
};
export default AuthLayout;