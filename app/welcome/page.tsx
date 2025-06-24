"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [router]);

  const handleNavigateToDashboard = () => {
    router.push('/');
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to LATAM Portfolio Status
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Hello {user.name}! 👋
            </p>
            <p className="text-gray-600">
              You're successfully logged in and ready to access the Direct Market Portfolio Management Dashboard.
            </p>
          </div>



          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Button 
              onClick={handleNavigateToDashboard}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Access Dashboard
            </Button>
          </div>


        </div>
      </div>
    </div>
  );
} 