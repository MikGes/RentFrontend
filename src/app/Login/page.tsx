"use client"
import React, { useEffect, useState } from "react";
import { Home, User, Eye, EyeOff } from "lucide-react"; // icons
import { useRouter } from "next/navigation";
import jwt from 'jsonwebtoken';
import Skeleton from "@/Components/Skeleton";
const LoginPage = () => {
    const [username, setUsername] = useState("");

    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter()
    useEffect(() => {
       const token = sessionStorage.getItem("jwtToken");
        
if (token) {
    try {
        const payload:any = jwt.verify(token, process.env.JWTSECRET!!);
        if (payload.exp * 1000 > Date.now()) {
            router.push("/Dashboard");
        }
    } catch (err) {
        console.error("Invalid token");
        setLoading(false)
        alert("Nice try, Invalid token anyway...")
    }
}

        else {
            setLoading(false)
        }
    }, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("https://rentmanagement-production.up.railway.app/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed. Please check your credentials.");
            } else {
            //     // Save token in cookie
            //  document.cookie = `auth_token=${data.access_token}; path=/; max-age=${60 * 60 * 24}; samesite=None; Secure`;
            sessionStorage.setItem("jwtToken", data.access_token); 
            router.push("/Dashboard")
                // redirect or save token
            }
        } catch (err) {
            setError("⚠️ Something went wrong. Please try again later.");
        }
    };
    if (loading) return <Skeleton />
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
                {/* Logo and Title */}
                <div className="flex items-center justify-center mb-6">
                    <Home className="w-8 h-8 text-indigo-600 mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800">My Home</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Username */}
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full pl-3 pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-2.5 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Error */}
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
