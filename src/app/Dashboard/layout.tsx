"use client";

import SideBar from "@/Components/SideBar";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // npm i jwt-decode

interface JwtPayload {
    username?: string; // adjust if your JWT uses a different field
    exp?: number;
    iat?: number;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem("jwtToken");

        if (!token) {
            router.push("/Login");
        } else {
            try {
                const decoded: JwtPayload = jwtDecode(token);

                if (decoded?.username) {
                    setUsername(decoded.username);
                } else {
                    setUsername("User");
                }
            } catch (err) {
                console.error("Invalid token", err);
                Cookies.remove("auth_token");
                router.push("/Login");
            }
        }
    }, [router]);

    const handleLogout = () => {
        Cookies.remove("auth_token");
        router.push("/Login");
    };

    return (
        <div className="flex bg-gray-950 text-white">
            <div className="w-1/5 min-h-screen">
                <SideBar />
            </div>
            <div className="w-4/5">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <span>Hey {username}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
