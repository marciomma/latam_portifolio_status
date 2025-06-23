"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BarChart3, Settings, Users, Database } from "lucide-react";

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
            <Badge variant="secondary" className="mt-4">
              Logged in as: {user.email}
            </Badge>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-lg">Portfolio Overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View real-time status of portfolio items across all LATAM countries with comprehensive filtering and visualization tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-lg">Status Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Update and manage portfolio status entries with full editorial control and real-time synchronization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-lg">Data Administration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive data management tools for products, countries, procedures, and classifications.
                </CardDescription>
              </CardContent>
            </Card>
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
            <p className="text-gray-500 text-sm">
              You can also navigate using the menu at the top of the page
            </p>
          </div>

          {/* Quick Stats */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="text-center">System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">Multi-Country</p>
                  <p className="text-sm text-gray-600">Coverage</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">Real-time</p>
                  <p className="text-sm text-gray-600">Updates</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">Advanced</p>
                  <p className="text-sm text-gray-600">Filtering</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">Export</p>
                  <p className="text-sm text-gray-600">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 