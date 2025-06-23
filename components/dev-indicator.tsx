"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";

export function DevIndicator() {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <Code className="h-3 w-3 mr-1" />
        DEV MODE
      </Badge>
    </div>
  );
} 