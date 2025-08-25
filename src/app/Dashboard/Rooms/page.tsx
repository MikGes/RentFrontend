"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash } from "lucide-react";
import Skeleton from "@/Components/Skeleton";

interface Tenant {
    _id: string;
    fullname: string;
    email: string;
}

interface Room {
    _id: string;
    unique_room_name: string;
    size: string;
    occupied: boolean;
    tenants: Tenant[]; // populated
}

const RoomsPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form state
    const [form, setForm] = useState({
        _id: "",
        unique_room_name: "",
        size: "Small",
    });

    // Fetch all rooms with populated tenants
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:3001/rooms", {
                    method: "GET",
                    credentials: "include"

                });
                const data = await res.json();
                if (data.success) {
                    // ✅ Ensure every room has tenants array
                    const normalizedRooms = (data.rooms || []).map((room: any) => ({
                        ...room,
                        tenants: Array.isArray(room.tenants) ? room.tenants : [],
                    }));
                    setRooms(normalizedRooms);
                } else {
                    setError(data.message || "Failed to load rooms");
                }
            } catch (err) {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // Open Add Modal
    const handleAdd = () => {
        setIsEditing(false);
        setForm({ _id: "", unique_room_name: "", size: "Small" });
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleEdit = (room: Room) => {
        setIsEditing(true);
        setForm({
            _id: room._id,
            unique_room_name: room.unique_room_name,
            size: room.size,
        });
        setIsModalOpen(true);
    };

    // Delete Room
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;

        try {
            const res = await fetch(`http://localhost:3001/rooms/delete/${id}`, {
                method: "DELETE",
                credentials: "include"

            });

            const result = await res.json();

            if (res.ok) {
                setRooms(rooms.filter((r) => r._id !== id));
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) {
            alert("Network error");
        }
    };

    // Handle form submit (Add/Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEditing
            ? `http://localhost:3001/rooms/${form._id}`
            : "http://localhost:3001/rooms/create";

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include"

            });

            const result = await res.json();

            if (res.ok) {
                // ✅ Normalize: ensure tenants is an array
                const normalizedRoom = {
                    ...result.room,
                    tenants: Array.isArray(result.room.tenants) ? result.room.tenants : [],
                };

                if (isEditing) {
                    setRooms(
                        rooms.map((r) => (r._id === normalizedRoom._id ? normalizedRoom : r))
                    );
                } else {
                    setRooms([...rooms, normalizedRoom]);
                }
                setIsModalOpen(false);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <Skeleton />;
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Rooms
                </h1>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-105 transition"
                >
                    <Plus size={18} /> Add Room
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Rooms Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">No rooms available.</p>
                ) : (
                    rooms.map((room) => {
                        // ✅ Safe: handle missing or undefined tenants
                        const hasTenants = Array.isArray(room.tenants) && room.tenants.length > 0;
                        const tenantsList = hasTenants ? room.tenants : [];

                        return (
                            <motion.div
                                key={room._id}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${hasTenants
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                    : "bg-gradient-to-br from-gray-500 to-gray-700"
                                    } text-white`}
                            >
                                {/* Room Name & Size */}
                                <h2 className="font-bold text-xl mb-2">{room.unique_room_name}</h2>
                                <p className="text-green-50 text-sm mb-1">
                                    Size: <strong>{room.size}</strong>
                                </p>

                                {/* Occupancy Status */}
                                <div className="mt-3">
                                    <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full ${hasTenants
                                            ? "bg-white text-green-600"
                                            : "bg-gray-200 text-gray-700"
                                            }`}
                                    >
                                        {hasTenants ? "✅ Occupied" : "🟰 Empty"}
                                    </span>
                                </div>

                                {/* Tenant List */}
                                <div className="mt-5">
                                    <h3 className="text-sm font-semibold mb-2 text-blue-50">
                                        Tenants ({tenantsList.length})
                                    </h3>
                                    {tenantsList.length > 0 ? (
                                        <ul className="space-y-1 max-h-32 overflow-y-auto pr-2">
                                            {tenantsList.map((tenant) => (
                                                <li
                                                    key={tenant._id}
                                                    className="text-sm bg-white/20 rounded px-2 py-1"
                                                >
                                                    {tenant.fullname}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-white/60 text-sm italic">No tenants</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 mt-5">
                                    <button
                                        onClick={() => handleEdit(room)}
                                        className="text-yellow-50 hover:text-white transition transform hover:scale-110"
                                        aria-label="Edit room"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(room._id)}
                                        className="text-red-50 hover:text-white transition transform hover:scale-110"
                                        aria-label="Delete room"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Modal (Add/Edit Room) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-600/20 via-purple-700/30 to-pink-500/20 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {isEditing ? "✏️ Edit Room" : "➕ Add Room"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Room Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Room Name *
                                </label>
                                <input
                                    name="unique_room_name"
                                    value={form.unique_room_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    placeholder="e.g. Room 101"
                                    required
                                />
                            </div>

                            {/* Size */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Size *
                                </label>
                                <select
                                    name="size"
                                    value={form.size}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    required
                                >
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Big">Big</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg hover:scale-105 transition"
                                >
                                    {isEditing ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsPage;