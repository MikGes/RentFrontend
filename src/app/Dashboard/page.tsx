"use client";

import React, { useState, useEffect } from "react";
import { PieChart, BarChart3, Users, BedDouble, DollarSign } from "lucide-react";
import Skeleton from "@/Components/Skeleton";

// Types
interface Tenant {
    _id: string;
    fullname: string;
    rent_money: number;
    active: boolean;
}

interface Room {
    _id: string;
    unique_room_name: string;
    tenants: Tenant[]; // populated from backend
}

const Dashboard: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            const token = sessionStorage.getItem("jwtToken");

        const fetchRooms = async () => {
            try {
                const res = await fetch("https://rentmanagement-production.up.railway.app/rooms", {
                    method: "GET",
                     headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },

                });
                const data = await res.json();

                if (data.success && Array.isArray(data.rooms)) {
                    setRooms(data.rooms);
                } else {
                    console.error("Failed to load rooms:", data.message);
                }
            } catch (err) {
                console.error("Network error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // Flatten all tenants from all rooms
    const allTenantsInRooms = rooms.flatMap(room => room.tenants);

    // Stats
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(room => room.tenants.length > 0).length;
    const freeRooms = totalRooms - occupiedRooms;
    const roomOccupiedRate = totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

    const totalRevenue = allTenantsInRooms
        .reduce((sum, tenant) => sum + (tenant.rent_money || 0), 0);

    const activeTenantsCount = allTenantsInRooms.filter(tenant => tenant.active).length;
    const totalTenantsCount = allTenantsInRooms.length;

    const stats = [
        {
            title: "Room Occupied Rate",
            value: `${roomOccupiedRate}%`,
            icon: <PieChart className="w-6 h-6" />,
            gradient: "from-indigo-500 to-purple-500",
        },
        {
            title: "Free Rooms",
            value: `${freeRooms}`,
            icon: <BedDouble className="w-6 h-6" />,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            title: "Total Revenue (This Month)",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: <DollarSign className="w-6 h-6" />,
            gradient: "from-pink-500 to-red-500",
        },
        {
            title: "Number of Tenants (Active)",
            value: `${activeTenantsCount}`,
            icon: <Users className="w-6 h-6" />,
            gradient: "from-yellow-500 to-orange-500",
        },
        {
            title: "Number of Rooms",
            value: `${totalRooms}`,
            icon: <BarChart3 className="w-6 h-6" />,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            title: "Total Tenants in Rooms",
            value: `${totalTenantsCount}`,
            icon: <Users className="w-6 h-6" />,
            gradient: "from-blue-500 to-green-500",
        },
    ];

    if (loading) {
        return <Skeleton />
    }

    return (
        <div className="p-6 min-h-screen text-white w-full">
            <h1 className="mb-6 text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Dashboard
            </h1>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className={`rounded-xl shadow-lg p-6 flex flex-col items-start transition-all duration-300 bg-gradient-to-r ${stat.gradient}`}
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-black bg-opacity-30 rounded-full">
                                {stat.icon}
                            </div>
                            <h2 className="text-lg font-semibold">{stat.title}</h2>
                        </div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;