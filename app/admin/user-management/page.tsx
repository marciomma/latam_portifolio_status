"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock, 
  Shield, 
  Crown, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  User,
  Mail,
  RotateCcw,
  Key,
  Eye,
  EyeOff,
  Copy
} from "lucide-react";

// Validation schemas
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)"),
  role: z.enum(['user', 'admin']),
  status: z.enum(['pending', 'approved']),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserData {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  approvedAt?: string;
  lastLogin?: string;
  status: 'pending' | 'approved';
  role: 'user' | 'admin';
  userType: 'pending' | 'approved';
}

interface UsersResponse {
  success: boolean;
  users: UserData[];
  totalUsers: number;
  pendingCount: number;
  approvedCount: number;
}

export default function AdminUserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<UserData | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ password: string; showPassword: boolean } | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, pendingCount: 0, approvedCount: 0 });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Create user form
  const createForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      status: "approved",
    },
  });

  // Edit user form
  const editForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      status: "approved",
    },
  });

  useEffect(() => {
    // Check authorization
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    if (user.role !== 'admin') {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    setIsAuthorized(true);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      
      const response = await fetch('/api/auth/admin/manage-users', {
        headers: {
          'Authorization': `Bearer ${userData.email}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setStats({
          totalUsers: data.totalUsers,
          pendingCount: data.pendingCount,
          approvedCount: data.approvedCount
        });
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

  const handleCreateUser = async (data: UserFormData) => {
    setActionLoading('create');
    setMessage(null);

    try {
      if (!currentUser) return;

      const response = await fetch('/api/auth/admin/manage-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.email}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setIsCreateDialogOpen(false);
        createForm.reset();
        setShowCreatePassword(false);
        await fetchUsers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!editingUser) return;
    
    setActionLoading('edit');
    setMessage(null);

    try {
      if (!currentUser) return;

      const response = await fetch('/api/auth/admin/manage-users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.email}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...data
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setIsEditDialogOpen(false);
        setEditingUser(null);
        editForm.reset();
        await fetchUsers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setActionLoading('delete');
    setMessage(null);

    try {
      if (!currentUser) return;

      const response = await fetch('/api/auth/admin/manage-users', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.email}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userToDelete.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        await fetchUsers();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword) return;
    
    setActionLoading('reset-password');
    setMessage(null);

    try {
      if (!currentUser) return;

      const response = await fetch('/api/auth/admin/reset-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.email}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userToResetPassword.id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        if (result.newPassword) {
          setResetPasswordResult({ password: result.newPassword, showPassword: false });
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to reset password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setActionLoading(null);
    }
  };

  const openResetPasswordDialog = (user: UserData) => {
    setUserToResetPassword(user);
    setResetPasswordResult(null);
    setIsResetPasswordDialogOpen(true);
  };

  const copyPasswordToClipboard = async () => {
    if (resetPasswordResult?.password) {
      try {
        await navigator.clipboard.writeText(resetPasswordResult.password);
        setMessage({ type: 'success', text: 'Password copied to clipboard' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to copy password' });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (user: UserData) => {
    if (user.status === 'pending') {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-600">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Approved
      </Badge>
    );
  };

  const getRoleBadge = (role: 'user' | 'admin') => {
    return (
      <Badge variant={role === 'admin' ? 'default' : 'secondary'} 
             className={role === 'admin' ? 'bg-purple-600' : ''}>
        {role === 'admin' ? (
          <Crown className="h-3 w-3 mr-1" />
        ) : (
          <User className="h-3 w-3 mr-1" />
        )}
        {role === 'admin' ? 'Admin' : 'User'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Access denied. Only administrators can access user management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Admin User Management</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setShowCreatePassword(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. You can set their role, approval status, and initial password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="create-name"
                    placeholder="Enter full name"
                    className="pl-10"
                    {...createForm.register('name')}
                  />
                </div>
                {createForm.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="Enter email address"
                    className="pl-10"
                    {...createForm.register('email')}
                  />
                </div>
                {createForm.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {createForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password">Initial Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="create-password"
                    type={showCreatePassword ? "text" : "password"}
                    placeholder="Enter initial password"
                    className="pl-10 pr-10"
                    {...createForm.register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                  >
                    {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {createForm.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {createForm.formState.errors.password.message}
                  </p>
                )}
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-medium">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>At least 8 characters long</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={createForm.watch('role')} 
                    onValueChange={(value: 'user' | 'admin') => createForm.setValue('role', value)}
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

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={createForm.watch('status')} 
                    onValueChange={(value: 'pending' | 'approved') => createForm.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setShowCreatePassword(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading === 'create'}>
                  {actionLoading === 'create' ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      {message && (
        <Alert className={`${
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage all users in the system. You can edit user details, change roles, and delete users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(user.requestedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.lastLogin ? formatDate(user.lastLogin) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="h-8 w-8 p-0"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResetPasswordDialog(user)}
                        className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                        title="Reset password"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      {currentUser?.id !== user.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information, role, and status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-name"
                  placeholder="Enter full name"
                  className="pl-10"
                  {...editForm.register('name')}
                />
              </div>
              {editForm.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email address"
                  className="pl-10"
                  {...editForm.register('email')}
                />
              </div>
              {editForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {editForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={editForm.watch('role')} 
                  onValueChange={(value: 'user' | 'admin') => editForm.setValue('role', value)}
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={editForm.watch('status')} 
                  onValueChange={(value: 'pending' | 'approved') => editForm.setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading === 'edit'}>
                {actionLoading === 'edit' ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {userToDelete.name}</p>
              <p><strong>Email:</strong> {userToDelete.email}</p>
              <p><strong>Role:</strong> {userToDelete.role}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Generate a new password for this user. The user will need to use this new password to log in.
            </DialogDescription>
          </DialogHeader>
          {userToResetPassword && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Name:</strong> {userToResetPassword.name}</p>
                <p><strong>Email:</strong> {userToResetPassword.email}</p>
                <p><strong>Role:</strong> {userToResetPassword.role}</p>
              </div>

              {resetPasswordResult && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">New Password Generated</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={resetPasswordResult.showPassword ? "text" : "password"}
                          value={resetPasswordResult.password}
                          readOnly
                          className="pr-20 font-mono text-sm"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setResetPasswordResult(prev => prev ? { ...prev, showPassword: !prev.showPassword } : null)}
                          >
                            {resetPasswordResult.showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={copyPasswordToClipboard}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-green-600">
                      Make sure to securely share this password with the user. It cannot be retrieved again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsResetPasswordDialogOpen(false);
                setResetPasswordResult(null);
              }}
            >
              Close
            </Button>
            {!resetPasswordResult && (
              <Button 
                onClick={handleResetPassword}
                disabled={actionLoading === 'reset-password'}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {actionLoading === 'reset-password' ? 'Resetting...' : 'Reset Password'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 