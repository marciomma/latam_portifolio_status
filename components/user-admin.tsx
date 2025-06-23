"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Users, Clock, Shield, Crown } from "lucide-react";

interface User {
  email: string;
  name: string;
  requestedAt?: string;
  approvedAt?: string;
  lastLogin?: string;
  status: 'pending' | 'approved';
  role: 'user' | 'admin';
}

interface UsersData {
  pendingUsers: User[];
  approvedUsers: User[];
}

export function UserAdmin() {
  const [users, setUsers] = useState<UsersData>({ pendingUsers: [], approvedUsers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRoles, setSelectedRoles] = useState<{ [email: string]: 'user' | 'admin' }>({});

  const fetchUsers = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setMessage({ type: 'error', text: 'You must be logged in to access this page' });
        setIsLoading(false);
        return;
      }

      const userData = JSON.parse(user);
      setCurrentUser(userData);

      // Check if user is admin
      if (userData.role !== 'admin') {
        setMessage({ type: 'error', text: 'Only administrators can access user management' });
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/admin/users', {
        headers: {
          'Authorization': `Bearer ${userData.email}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to fetch users' });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage({ type: 'error', text: 'Failed to fetch users' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAction = async (email: string, action: 'approve' | 'deny') => {
    setActionLoading(email);
    setMessage(null);

    try {
      if (!currentUser) {
        setMessage({ type: 'error', text: 'You must be logged in' });
        return;
      }

      const role = selectedRoles[email] || 'user'; // Default to 'user' if no role selected

      const response = await fetch('/api/auth/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.email}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, action, role }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: result.message,
        });
        // Refresh users list
        await fetchUsers();
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Action failed',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error occurred',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      {message && (
        <Alert className={`${
          message.type === 'success' 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Requests ({users.pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Approved Users ({users.approvedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {users.pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending requests</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            users.pendingUsers.map((user) => (
              <Card key={user.email}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                      <p className="text-sm text-gray-500">
                        Requested: {formatDate(user.requestedAt || '')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`role-${user.email}`}>Assign Role</Label>
                      <Select
                        value={selectedRoles[user.email] || 'user'}
                        onValueChange={(value: 'user' | 'admin') => 
                          setSelectedRoles(prev => ({ ...prev, [user.email]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUserAction(user.email, 'approve')}
                        disabled={actionLoading === user.email}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve as {selectedRoles[user.email] || 'User'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleUserAction(user.email, 'deny')}
                        disabled={actionLoading === user.email}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Deny
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {users.approvedUsers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No approved users yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            users.approvedUsers.map((user) => (
              <Card key={user.email}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          Approved: {formatDate(user.approvedAt || '')}
                        </p>
                        {user.lastLogin && (
                          <p className="text-sm text-gray-500">
                            Last login: {formatDate(user.lastLogin)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} 
                             className={user.role === 'admin' ? 'bg-purple-600' : ''}>
                        {user.role === 'admin' ? (
                          <Crown className="h-3 w-3 mr-1" />
                        ) : (
                          <Users className="h-3 w-3 mr-1" />
                        )}
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 