"use client";

import React, { useState, useEffect } from "react";

// Match your backend: tenants are fully populated inside rooms
interface Tenant {
  _id: string;
  fullname: string;
  email: string;
  rooms: string[];
  active: boolean;
}

interface Room {
  _id: string;
  unique_room_name: string;
  size: string;
  occupied: boolean;
  tenants: Tenant[]; // ← Already populated by backend!
}

const RoomAssignmentDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]); // still needed for drag source

  // Fetch rooms (with populated tenants) and all tenants
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("jwtToken");
      try {
        const [roomsRes, tenantsRes] = await Promise.all([
          fetch("https://rentmanagement-production.up.railway.app/rooms/", {
            method: "GET",    
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }

          }), // ← This returns populated tenants
          fetch("https://rentmanagement-production.up.railway.app/tenant/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
          }),
        ]);

        const roomsData = await roomsRes.json();
        const tenantsData = await tenantsRes.json();

        // ✅ Use rooms with populated tenants directly
        setRooms(roomsData.rooms || []);
        setTenants(tenantsData.data || []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    fetchData();
  }, []);

  // Drag start
  const handleDragStart = (e: React.DragEvent, tenant: Tenant) => {
    e.dataTransfer.setData("tenantId", tenant._id);
  };

  // Allow drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Drop: Assign tenant to room
  const handleDrop = async (e: React.DragEvent, targetRoomId: string) => {
    e.preventDefault();
    const tenantId = e.dataTransfer.getData("tenantId");
    if (!tenantId) return;

    const tenant = tenants.find((t) => t._id === tenantId);
    if (!tenant) return;

    // Prevent reassigning to same room
    const targetRoom = rooms.find(r => r._id === targetRoomId);
    if (targetRoom?.tenants.some(t => t._id === tenantId)) return;

    // Find previous room
    const prevRoom = rooms.find(room => room.tenants.some(t => t._id === tenantId));
    const prevRoomId = prevRoom?._id || null;

    try {
      // Call your existing endpoint
      const token = sessionStorage.getItem("jwtToken")
      const res = await fetch(
        `https://rentmanagement.onrender.com/rooms/addTenant/${targetRoomId}/${prevRoomId}`,
        {
          method: "PUT",
         headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
          body: JSON.stringify({ id: tenantId }),
          
        }
      );

      const result = await res.json();

      if (res.ok) {
        // ✅ Update rooms: use the tenant object from `tenants` list
        setRooms((prev) =>
          prev.map((room) => {
            if (room._id === targetRoomId) {
              // Add to new room
              return {
                ...room,
                tenants: [...room.tenants, tenant],
                occupied: true,
              };
            }
            if (room._id === prevRoomId) {
              // Remove from old room
              return {
                ...room,
                tenants: room.tenants.filter((t) => t._id !== tenantId),
                occupied: room.tenants.length > 1, // update occupied
              };
            }
            return room;
          })
        );

        // Optional: update tenant's `rooms` field
        setTenants((prev) =>
          prev.map((t) =>
            t._id === tenantId ? { ...t, rooms: [targetRoomId] } : t
          )
        );
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      alert("Network error. Could not assign tenant.");
    }
  };

  // Get unassigned tenants (active tenants not in any room)
  const unassignedTenants = tenants.filter((tenant) => {
    const isInAnyRoom = rooms.some(room =>
      room.tenants.some(t => t._id === tenant._id)
    );
    return !tenant.active && !isInAnyRoom;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-8">
        Room Management
      </h1>

      {/* Layout: Unassigned + Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unassigned Tenants Box */}
        <div
          className="lg:col-span-1 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden"
          onDragOver={handleDragOver}
        >
          <div className="p-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-semibold text-lg">
            Unassigned Tenants
            <span className="block text-sm opacity-90 mt-1">
              {unassignedTenants.length} available
            </span>
          </div>

          <div className="p-4 min-h-32 bg-gray-50 dark:bg-gray-900/50">
            {unassignedTenants.length > 0 ? (
              <ul className="space-y-2">
                {unassignedTenants.map((tenant) => (
                  <li
                    key={tenant._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tenant)}
                    className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow cursor-move hover:shadow-md transition text-gray-800 dark:text-white text-sm font-medium"
                  >
                    {tenant.fullname}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                All tenants are assigned
              </p>
            )}
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rooms.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No rooms available.
            </p>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                className="border border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden"
                onDrop={(e) => handleDrop(e, room._id)}
                onDragOver={handleDragOver}
              >
                {/* Room Header */}
                <div
                  className={`p-4 font-semibold text-lg text-white ${room.tenants.length > 0
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600"
                    }`}
                >
                  {room.unique_room_name} ({room.size})
                  <span className="block text-sm opacity-90 mt-1">
                    {room.tenants.length} tenant(s)
                  </span>
                </div>

                {/* Tenant List */}
                <div className="p-4 min-h-32 bg-gray-50 dark:bg-gray-900/50">
                  {room.tenants.length > 0 ? (
                    <ul className="space-y-2">
                      {room.tenants.map((tenant) => (
                        <li
                          key={tenant._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, tenant)}
                          className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow cursor-move hover:shadow-md transition text-gray-800 dark:text-white text-sm font-medium"
                        >
                          {tenant.fullname}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      Empty
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomAssignmentDashboard;