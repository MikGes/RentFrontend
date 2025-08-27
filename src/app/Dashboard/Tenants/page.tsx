"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Skeleton from "@/Components/Skeleton";

interface Tenant {
    _id: string;
    fullname: string;
    email: string;
    phone?: string;
    address?: string;
    rental_date: string;
    leave_date?: string;
    active: boolean;
    emergency_contact?: string;
    rent_money: number;
}

const Tenants: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false); // Track mode
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTenant, setSearchTenant] = useState<Tenant[]>([]);
    // Form state
    const [form, setForm] = useState<Partial<Tenant>>({
        fullname: "",
        email: "",
        phone: "",
        address: "",
        rental_date: "",
        leave_date: "",
        emergency_contact: "",
        rent_money: 0,
    });
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 4000); // Disappear after 4 seconds
            return () => clearTimeout(timer);
        }
    }, [error]);
    // Fetch tenants
    useEffect(() => {
            const token = sessionStorage.getItem("jwtToken");

        const fetchTenants = async () => {
            setLoading(true);
            try {
                setError("");
                const res = await fetch("https://rentmanagement-production.up.railway.app/tenant", {
                    method: "GET",
                    headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },

                });
                const data = await res.json();
                setTenants(data.data);
                setSearchTenant(data.data)
            } catch (err) {
                setError("Failed to load tenants");
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    // Open Modal for Add
    const handleAdd = () => {
        setIsEditing(false);
        setForm({
            fullname: "",
            email: "",
            phone: "",
            address: "",
            rental_date: "",
            leave_date: "",
            emergency_contact: "",
            rent_money: 0,
        });
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const handleEdit = (tenant: Tenant) => {
        setIsEditing(true);
        setForm({ ...tenant });
        setIsModalOpen(true);
    };

    // Delete Tenant
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this tenant?")) return;
        const token = sessionStorage.getItem("jwtToken");

        try {
            const res = await fetch(`https://rentmanagement-production.up.railway.app/delete/${id}`, {
                method: "DELETE",
                headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },

            });

            const result = await res.json();
            if (result.success) {
                setTenants(tenants.filter((t) => t._id !== id));
            } else {
                setError(result.message || "Delete failed");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    // Handle form submit (Add or Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEditing
            ? `https://rentmanagement-production.up.railway.app/tenant/${form._id}`
            : "https://rentmanagement-production.up.railway.app/tenant/create";

        const method = isEditing ? "PUT" : "POST";

        try {
            const token = sessionStorage.getItem("jwtToken");
            const res = await fetch(url, {
                method,
                 headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
                body: JSON.stringify(form),
                credentials: "include"

            });

            const result = await res.json();
            if (result.success) {
                if (isEditing) {
                    // Update tenant in list
                    setTenants(
                        tenants.map((t) => (t._id === result.tenant._id ? result.tenant : t))
                    );
                } else {
                    // Add new tenant
                    setTenants([...tenants, result.tenant]);
                }
                setIsModalOpen(false);
            } else {
                setError(result.message || "Action failed");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    function filteredTenants() {
        const filtered = tenants.filter((tenant) =>
            tenant.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tenant.phone && tenant.phone.includes(searchTerm))
        );
        setSearchTenant(filtered)
    }
    useEffect(() => {
        filteredTenants()
    }, [searchTerm])
    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                {/* Title */}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Tenants
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 lg:w-80 border border-gray-300 dark:border-gray-600 rounded-xl 
                   bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                            🔍
                        </span>
                    </div>

                    {/* Add Tenant Button */}
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 
                 text-white shadow-lg hover:scale-105 transition-transform whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Tenant
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className=" absolute z-[1000] w-[190px] left-[600px] mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm transition-opacity duration-300 ease-out">
                    {error}
                </div>
            )}

            {/* Tenant Grid */}
            {!isLoading ? (
                <div className="h-[600px] overflow-y-auto p-4 scroll-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchTenant.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500">No tenants found.</p>
                        ) : (
                            searchTenant.map((tenant) => (
                                <motion.div
                                    key={tenant._id}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    className={`p-6 rounded-xl shadow-lg transition-all duration-300 text-white bg-gradient-to-br ${tenant.active
                                        ? "from-blue-500 to-indigo-600"
                                        : "from-red-500 to-pink-600"
                                        }`}
                                >
                                    {/* Tenant Info */}
                                    <h2 className="font-bold text-xl mb-2">{tenant.fullname}</h2>
                                    <p className="text-blue-50 text-sm mb-1 truncate">📧 {tenant.email}</p>
                                    <p className="text-sm mb-1">📞 {tenant.phone || "N/A"}</p>
                                    <p className="text-sm font-semibold">💰 ${tenant.rent_money}</p>

                                    {/* Status Badge */}
                                    <div className="mt-4">
                                        <span
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${tenant.active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {tenant.active ? "✅ Active" : "🛑 Inactive"}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-4 mt-5">
                                        <button
                                            onClick={() => handleEdit(tenant)}
                                            className="text-yellow-50 hover:text-white transition duration-200 transform hover:scale-110"
                                            aria-label="Edit tenant"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tenant._id)}
                                            className="text-red-50 hover:text-white transition duration-200 transform hover:scale-110"
                                            aria-label="Delete tenant"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <Skeleton />
            )}

            {/* Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-600/20 via-purple-700/30 to-pink-500/20 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {isEditing ? "✏️ Edit Tenant" : "➕ Add New Tenant"}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {isEditing
                                    ? "Update the tenant details below."
                                    : "Fill in the details. Fields marked with * are required."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Full Name, Email, Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        name="fullname"
                                        value={form.fullname || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        name="phone"
                                        value={form.phone || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Address
                                </label>
                                <input
                                    name="address"
                                    value={form.address || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                />
                            </div>

                            {/* Rental Date, Leave Date, Rent */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Rental Start Date *
                                    </label>
                                    <input
                                        name="rental_date"
                                        type="date"
                                        value={form.rental_date || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Expected Leave Date
                                    </label>
                                    <input
                                        name="leave_date"
                                        type="date"
                                        value={form.leave_date || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Monthly Rent ($) *
                                    </label>
                                    <input
                                        name="rent_money"
                                        type="number"
                                        value={form.rent_money || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Emergency Contact
                                </label>
                                <input
                                    name="emergency_contact"
                                    value={form.emergency_contact || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-2xl hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 transform"
                                >
                                    {isEditing ? "Update Tenant" : "Save Tenant"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tenants;