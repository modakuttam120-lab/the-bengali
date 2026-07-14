import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200 w-full" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/6" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/5" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="flex space-x-3 items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="h-[400px] bg-gray-200 rounded-xl w-full" />
      <div className="space-y-3 pt-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}
