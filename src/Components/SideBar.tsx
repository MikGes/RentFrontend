"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BedDouble } from "lucide-react";

const SideBar: React.FC = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false); // Toggle drawer

    const links = [
        {
            name: "Dashboard",
            link: "/Dashboard",
            icon: <Home className="w-5 h-5" />,
            gradient: "from-indigo-500 to-purple-500",
        },
        {
            name: "Tenants",
            link: "/Dashboard/Tenants",
            icon: <Users className="w-5 h-5" />,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            name: "Rooms",
            link: "/Dashboard/Rooms",
            icon: <BedDouble className="w-5 h-5" />,
            gradient: "from-pink-500 to-red-500",
        }, {
            name: "Assignment",
            link: "/Dashboard/Assignment",
            icon: <BedDouble className="w-5 h-5" />,
            gradient: "from-teal-500 to-green-500",
        },
    ];

    return (
        <>
            {/* Hamburger Button (Visible on Mobile) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-gray-800 text-white shadow-lg"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                </svg>
            </button>

            {/* Sidebar Drawer */}
            <div
                className={`min-h-screen fixed inset-y-0 left-0 z-20 w-64 bg-gray-900 text-white transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl md:flex md:relative`}
            >
                <div className="flex flex-col w-full min-h-screen p-4">
                    {/* Logo */}
                    <h1 className="text-2xl font-bold mb-8 text-center">🏠 My Home</h1>

                    {/* Navigation Links */}
                    <nav className="flex flex-col space-y-3 flex-1">
                        {links.map((link) => {
                            const isActive = pathname === link.link;

                            return (
                                <Link
                                    key={link.name}
                                    href={link.link}
                                    onClick={() => setIsOpen(false)} // Close drawer on click (mobile)
                                    className={`flex items-center space-x-3 px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${isActive
                                            ? `bg-gradient-to-r ${link.gradient} shadow-lg`
                                            : "hover:bg-gray-800"
                                        }`}
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Backdrop Overlay (only on mobile when open) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default SideBar;