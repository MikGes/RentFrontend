"use client"
import React from 'react'

const Skeleton = () => {
    return (
        <div className="w-[100%] grid grid-cols-3 gap-x-2 gap-2">
            {/* Skeleton Cards */}
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="w-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg p-6 rounded-lg border border-white/30 dark:border-gray-700/40 shadow-lg animate-pulse"
                >
                    {/* Title Line */}
                    <div className="h-5 bg-white/30 rounded-full mb-4 max-w-xs"></div>

                    {/* Info Lines */}
                    <div className="space-y-3">
                        <div className="h-4 bg-white/20 rounded-full max-w-lg"></div>
                        <div className="h-4 bg-white/20 rounded-full max-w-md"></div>
                        <div className="h-4 bg-white/20 rounded-full max-w-sm"></div>
                        <div className="h-4 bg-white/20 rounded-full w-24"></div>
                    </div>

                    {/* Action Buttons (simulated) */}
                    <div className="flex justify-end mt-6 space-x-3">
                        <div className="h-8 w-8 bg-white/30 rounded-full"></div>
                        <div className="h-8 w-8 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Skeleton