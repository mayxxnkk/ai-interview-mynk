import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth_action";
import LogoutButton from "@/components/LogoutButton";

const RootLayout = async ({ children }: { children: ReactNode }) => {
    const authed = await isAuthenticated();
    if (!authed) redirect("/sign-in");

    const user = await getCurrentUser();

    return (
        <div className="root-layout">
            <nav className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="./logo.svg" alt="Logo" width={38} height={32} />
                    <h2 className="text-primary-100">Prepwise</h2>
                </Link>
                <div className="flex items-center gap-3">
                    {user && (
                        <p className="text-light-400 text-sm hidden sm:block">
                            Hi, <span className="text-primary-100 font-medium">{user.name}</span>
                        </p>
                    )}
                    <LogoutButton />
                </div>
            </nav>
            {children}
        </div>
    );
};
export default RootLayout;
