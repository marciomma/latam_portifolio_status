"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Crown, CheckCircle2, AlertCircle, Key } from "lucide-react";

const setupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  adminKey: z.string().min(1, "Admin setup key is required"),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      email: "",
      adminKey: "",
    },
  });

  const handleSetup = async (data: SetupFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Admin user created successfully! You can now log in with your credentials.',
        });
        setIsSetupComplete(true);
        form.reset();
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to create admin user.',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Crown className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Setup
          </h1>
          <p className="text-gray-600">
            Create the first administrator for LATAM Portfolio Status
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Setup Administrator</CardTitle>
            <CardDescription className="text-center">
              This page is only accessible when no admin users exist
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSetupComplete ? (
              <form onSubmit={form.handleSubmit(handleSetup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter admin full name"
                    {...form.register('name')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter admin email address"
                    {...form.register('email')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminKey">Admin Setup Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="adminKey"
                      type="password"
                      placeholder="Enter admin setup key"
                      className="pl-10"
                      {...form.register('adminKey')}
                      disabled={isLoading}
                    />
                  </div>
                  {form.formState.errors.adminKey && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.adminKey.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Contact your system administrator for the setup key
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Create Admin User
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Setup Complete!</h3>
                  <p className="text-green-700">Admin user has been created successfully.</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {message && (
              <Alert className={`mt-4 ${
                message.type === 'success' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
} 