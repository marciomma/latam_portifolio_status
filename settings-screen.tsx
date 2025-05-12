"use client"

import { useState } from "react"
import {
  BarChart3,
  Bell,
  Check,
  Database,
  FileSpreadsheet,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Lock,
  Menu,
  Save,
  Settings,
  User,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function SettingsScreen() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState("light")

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#EBE8FA]">
        {/* Left Sidebar */}
        <Sidebar className="border-r border-[#DAD8E8]">
          <SidebarHeader className="flex h-16 items-center border-b border-[#DAD8E8] bg-white px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-[#002C71]"></div>
              <span className="text-lg font-bold text-[#002C71]">NUVA</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-white">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard">
                  <Link href="/" className="flex items-center gap-2 w-full">
                    <LayoutDashboard className="h-6 w-6 text-[#192229]" />
                    <span className="text-[12px]">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Records">
                  <Link href="/records" className="flex items-center gap-2 w-full">
                    <FileSpreadsheet className="h-6 w-6 text-[#192229]" />
                    <span className="text-[12px]">Records</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Reports">
                  <Link href="/reports" className="flex items-center gap-2 w-full">
                    <BarChart3 className="h-6 w-6 text-[#192229]" />
                    <span className="text-[12px]">Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Settings">
                  <Link href="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-6 w-6 text-[#192229]" />
                    <span className="text-[12px]">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-[#DAD8E8] bg-white p-4">
            <div className="text-[10px] text-[#636669]">© 2023 NUVA Corp. v1.2.3</div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Navigation */}
          <header className="flex h-16 items-center justify-between border-b border-[#DAD8E8] bg-white px-4">
            <SidebarTrigger className="lg:hidden">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <h1 className="text-center text-[24px] font-bold text-[#192229]">Settings</h1>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-6 w-6 text-[#192229]" />
            </Button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-5 bg-[#DAD8E8]">
                <TabsTrigger value="general" className="text-[12px]">
                  General
                </TabsTrigger>
                <TabsTrigger value="data" className="text-[12px]">
                  Data Sources
                </TabsTrigger>
                <TabsTrigger value="users" className="text-[12px]">
                  Users
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-[12px]">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="text-[12px]">
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Application Settings</h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#192229]">Auto-refresh Data</Label>
                          <p className="text-[10px] text-[#636669]">Automatically refresh data every 5 minutes</p>
                        </div>
                        <Switch
                          checked={autoRefresh}
                          onCheckedChange={setAutoRefresh}
                          className="data-[state=checked]:bg-[#002C71]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Default View</Label>
                        <Select defaultValue="table">
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select default view" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="table">Table View</SelectItem>
                            <SelectItem value="card">Card View</SelectItem>
                            <SelectItem value="gallery">Gallery View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Records Per Page</Label>
                        <Select defaultValue="10">
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select records per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 records</SelectItem>
                            <SelectItem value="10">10 records</SelectItem>
                            <SelectItem value="25">25 records</SelectItem>
                            <SelectItem value="50">50 records</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Theme</Label>
                        <RadioGroup defaultValue="light" value={theme} onValueChange={setTheme} className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="light" id="light" className="border-[#002C71] text-[#002C71]" />
                            <Label htmlFor="light" className="text-[12px]">
                              Light
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dark" id="dark" className="border-[#002C71] text-[#002C71]" />
                            <Label htmlFor="dark" className="text-[12px]">
                              Dark
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="system" id="system" className="border-[#002C71] text-[#002C71]" />
                            <Label htmlFor="system" className="text-[12px]">
                              System Default
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Application Information</h3>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-[12px] font-semibold text-[#636669]">Application Name</Label>
                        <p className="text-[12px]">NUVA Excel Data Viewer</p>
                      </div>

                      <div>
                        <Label className="text-[12px] font-semibold text-[#636669]">Version</Label>
                        <p className="text-[12px]">1.2.3</p>
                      </div>

                      <div>
                        <Label className="text-[12px] font-semibold text-[#636669]">Last Updated</Label>
                        <p className="text-[12px]">May 20, 2023</p>
                      </div>

                      <div>
                        <Label className="text-[12px] font-semibold text-[#636669]">Support Contact</Label>
                        <p className="text-[12px]">support@nuvacorp.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Excel Data Sources</h3>

                    <div className="space-y-4">
                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <FileSpreadsheet className="h-4 w-4 text-[#002C71]" />
                            </div>
                            <div>
                              <p className="text-[12px] font-medium">Budget_Data_2023.xlsx</p>
                              <p className="text-[10px] text-[#636669]">Last synced: May 20, 2023 at 9:30 AM</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              Sync Now
                            </Button>
                          </div>
                        </div>
                        <div className="ml-10 space-y-1">
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-[#002C71]" />
                            <p className="text-[10px]">Connected to SharePoint</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-[#002C71]" />
                            <p className="text-[10px]">Auto-sync enabled (Every 6 hours)</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <FileSpreadsheet className="h-4 w-4 text-[#002C71]" />
                            </div>
                            <div>
                              <p className="text-[12px] font-medium">Department_Reports.xlsx</p>
                              <p className="text-[10px] text-[#636669]">Last synced: May 19, 2023 at 2:15 PM</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              Sync Now
                            </Button>
                          </div>
                        </div>
                        <div className="ml-10 space-y-1">
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-[#002C71]" />
                            <p className="text-[10px]">Connected to SharePoint</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-[#002C71]" />
                            <p className="text-[10px]">Auto-sync enabled (Every 12 hours)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">Add New Data Source</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Connection Settings</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">SharePoint Site URL</Label>
                        <Input
                          defaultValue="https://nuvacorp.sharepoint.com/sites/finance"
                          className="h-10 text-[12px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Connection Method</Label>
                        <Select defaultValue="delegated">
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select connection method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delegated">Delegated (User's Identity)</SelectItem>
                            <SelectItem value="app">App-Only (Service Principal)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#192229]">Cache Data Locally</Label>
                          <p className="text-[10px] text-[#636669]">Store data locally for offline access</p>
                        </div>
                        <Switch defaultChecked={true} className="data-[state=checked]:bg-[#002C71]" />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Connection Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-[16px] font-semibold text-[#192229]">User Management</h3>
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">Add User</Button>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <User className="h-5 w-5 text-[#002C71]" />
                            </div>
                            <div>
                              <p className="text-[12px] font-medium">John Smith</p>
                              <p className="text-[10px] text-[#636669]">john.smith@nuvacorp.com</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#EBE8FA] px-2 py-1 text-[10px] font-medium text-[#002C71]">
                              Admin
                            </span>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <User className="h-5 w-5 text-[#002C71]" />
                            </div>
                            <div>
                              <p className="text-[12px] font-medium">Sarah Johnson</p>
                              <p className="text-[10px] text-[#636669]">sarah.johnson@nuvacorp.com</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#EBE8FA] px-2 py-1 text-[10px] font-medium text-[#002C71]">
                              Editor
                            </span>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <User className="h-5 w-5 text-[#002C71]" />
                            </div>
                            <div>
                              <p className="text-[12px] font-medium">Michael Chen</p>
                              <p className="text-[10px] text-[#636669]">michael.chen@nuvacorp.com</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#EBE8FA] px-2 py-1 text-[10px] font-medium text-[#002C71]">
                              Viewer
                            </span>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Role Management</h3>

                    <div className="space-y-4">
                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <Users className="h-4 w-4 text-[#002C71]" />
                            </div>
                            <p className="text-[12px] font-medium">Admin</p>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 text-[10px]">
                            Edit Permissions
                          </Button>
                        </div>
                        <div className="ml-10">
                          <p className="text-[10px] text-[#636669]">Full access to all features and settings</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <Users className="h-4 w-4 text-[#002C71]" />
                            </div>
                            <p className="text-[12px] font-medium">Editor</p>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 text-[10px]">
                            Edit Permissions
                          </Button>
                        </div>
                        <div className="ml-10">
                          <p className="text-[10px] text-[#636669]">
                            Can view and edit records, but cannot change settings
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#DAD8E8] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                              <Users className="h-4 w-4 text-[#002C71]" />
                            </div>
                            <p className="text-[12px] font-medium">Viewer</p>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 text-[10px]">
                            Edit Permissions
                          </Button>
                        </div>
                        <div className="ml-10">
                          <p className="text-[10px] text-[#636669]">Read-only access to records</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">Create New Role</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Notification Settings</h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#192229]">Enable Notifications</Label>
                          <p className="text-[10px] text-[#636669]">Receive notifications for important events</p>
                        </div>
                        <Switch
                          checked={notifications}
                          onCheckedChange={setNotifications}
                          className="data-[state=checked]:bg-[#002C71]"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[12px] font-semibold text-[#192229]">Notification Types</Label>

                        <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-3">
                          <div>
                            <p className="text-[12px] font-medium">Record Updates</p>
                            <p className="text-[10px] text-[#636669]">When records are created or modified</p>
                          </div>
                          <Switch defaultChecked className="data-[state=checked]:bg-[#002C71]" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-3">
                          <div>
                            <p className="text-[12px] font-medium">Data Sync Completion</p>
                            <p className="text-[10px] text-[#636669]">When Excel data is synchronized</p>
                          </div>
                          <Switch defaultChecked className="data-[state=checked]:bg-[#002C71]" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-3">
                          <div>
                            <p className="text-[12px] font-medium">System Alerts</p>
                            <p className="text-[10px] text-[#636669]">Important system messages and alerts</p>
                          </div>
                          <Switch defaultChecked className="data-[state=checked]:bg-[#002C71]" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-3">
                          <div>
                            <p className="text-[12px] font-medium">User Activity</p>
                            <p className="text-[10px] text-[#636669]">When other users make significant changes</p>
                          </div>
                          <Switch className="data-[state=checked]:bg-[#002C71]" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Notification Method</Label>
                        <Select defaultValue="inapp">
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select notification method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inapp">In-App Only</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="both">Both In-App and Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Email Address</Label>
                        <Input defaultValue="john.smith@nuvacorp.com" className="h-10 text-[12px]" />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Notification Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Recent Notifications</h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-3">
                        <Bell className="mt-0.5 h-4 w-4 text-[#002C71]" />
                        <div>
                          <p className="text-[12px] font-medium">Data Sync Completed</p>
                          <p className="text-[10px] text-[#636669]">
                            Budget_Data_2023.xlsx was successfully synchronized
                          </p>
                          <p className="text-[10px] text-[#636669]">Today at 9:30 AM</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-3">
                        <Bell className="mt-0.5 h-4 w-4 text-[#002C71]" />
                        <div>
                          <p className="text-[12px] font-medium">Record Updated</p>
                          <p className="text-[10px] text-[#636669]">Sarah Johnson updated "Annual Budget Report"</p>
                          <p className="text-[10px] text-[#636669]">Yesterday at 2:45 PM</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-3">
                        <Bell className="mt-0.5 h-4 w-4 text-[#BD3978]" />
                        <div>
                          <p className="text-[12px] font-medium">System Alert</p>
                          <p className="text-[10px] text-[#636669]">Application updated to version 1.2.3</p>
                          <p className="text-[10px] text-[#636669]">May 20, 2023 at 8:00 AM</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Button variant="link" className="text-[#002C71] hover:text-[#002C71]/80">
                        View All Notifications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Security Settings</h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#192229]">Two-Factor Authentication</Label>
                          <p className="text-[10px] text-[#636669]">Require 2FA for all users</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#002C71]" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#192229]">Session Timeout</Label>
                          <p className="text-[10px] text-[#636669]">Automatically log out inactive users</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#002C71]" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Session Timeout Duration</Label>
                        <Select defaultValue="30">
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select timeout duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[12px] font-semibold text-[#192229]">Password Policy</Label>
                        <Select defaultValue="strong">
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select password policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                            <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                            <SelectItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#192229]">Data Encryption</Label>
                          <p className="text-[10px] text-[#636669]">Encrypt sensitive data</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#002C71]" />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Security Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Access Logs</h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-3">
                        <Lock className="mt-0.5 h-4 w-4 text-[#002C71]" />
                        <div>
                          <p className="text-[12px] font-medium">John Smith logged in</p>
                          <p className="text-[10px] text-[#636669]">IP: 192.168.1.105</p>
                          <p className="text-[10px] text-[#636669]">Today at 9:15 AM</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-3">
                        <Database className="mt-0.5 h-4 w-4 text-[#00B5E2]" />
                        <div>
                          <p className="text-[12px] font-medium">Data access: Budget_Data_2023.xlsx</p>
                          <p className="text-[10px] text-[#636669]">User: Sarah Johnson</p>
                          <p className="text-[10px] text-[#636669]">Yesterday at 3:30 PM</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-3">
                        <Settings className="mt-0.5 h-4 w-4 text-[#BD3978]" />
                        <div>
                          <p className="text-[12px] font-medium">Settings changed: Notification preferences</p>
                          <p className="text-[10px] text-[#636669]">User: John Smith</p>
                          <p className="text-[10px] text-[#636669]">May 20, 2023 at 11:45 AM</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Button variant="link" className="text-[#002C71] hover:text-[#002C71]/80">
                        View Full Access Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-[16px] font-semibold text-[#192229]">Help & Support</h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-4">
                        <HelpCircle className="mt-0.5 h-5 w-5 text-[#002C71]" />
                        <div>
                          <p className="text-[12px] font-medium">Security Documentation</p>
                          <p className="text-[10px] text-[#636669]">
                            Learn about our security features and best practices
                          </p>
                          <Button variant="link" className="h-6 p-0 text-[10px] text-[#002C71]">
                            View Documentation
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-4">
                        <Globe className="mt-0.5 h-5 w-5 text-[#002C71]" />
                        <div>
                          <p className="text-[12px] font-medium">Security Portal</p>
                          <p className="text-[10px] text-[#636669]">Access our security portal for advanced settings</p>
                          <Button variant="link" className="h-6 p-0 text-[10px] text-[#002C71]">
                            Open Security Portal
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border border-[#DAD8E8] p-4">
                        <HelpCircle className="mt-0.5 h-5 w-5 text-[#002C71]" />
                        <div>
                          <p className="text-[12px] font-medium">Report Security Issue</p>
                          <p className="text-[10px] text-[#636669]">Report a security vulnerability or concern</p>
                          <Button variant="link" className="h-6 p-0 text-[10px] text-[#002C71]">
                            Contact Security Team
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>

          {/* Footer */}
          <footer className="border-t border-[#DAD8E8] bg-white p-4">
            <div className="text-center text-[10px] text-[#636669]">
              © 2023 NUVA Corporation. All rights reserved. Version 1.2.3
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
