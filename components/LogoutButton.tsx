"use client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth_action";
import { auth } from "@/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";

const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        await firebaseSignOut(auth);
        await signOut();
        router.push("/sign-in");
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-200 border border-light-600 text-light-100 hover:bg-destructive-100 hover:border-destructive-100 hover:text-white transition-colors text-sm font-medium cursor-pointer"
        >
            <span>Logout</span>
        </button>
    );
};

export default LogoutButton;
