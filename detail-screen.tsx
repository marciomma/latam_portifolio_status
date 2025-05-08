"use client"

import {
  ArrowLeft,
  BarChart3,
  Check,
  Download,
  Edit2,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  Save,
  Settings,
  Trash2,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function DetailScreen() {
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
                <SidebarMenuButton isActive tooltip="Records">
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
                <SidebarMenuButton tooltip="Settings">
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
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 lg:hidden">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <Button variant="ghost" className="flex items-center gap-1 text-[#192229]">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-[12px]">Back to List</span>
              </Button>
            </div>
            <h1 className="text-center text-[24px] font-bold text-[#192229]">Record Details</h1>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-6 w-6 text-[#192229]" />
            </Button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-[#192229]">Annual Budget Report</h2>
                <p className="text-[12px] text-[#636669]">ID: REC-001 • Created: May 15, 2023</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-[#00B5E2] text-[#00B5E2]">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-3 bg-[#DAD8E8]">
                <TabsTrigger value="details" className="text-[12px]">
                  Details
                </TabsTrigger>
                <TabsTrigger value="history" className="text-[12px]">
                  History
                </TabsTrigger>
                <TabsTrigger value="related" className="text-[12px]">
                  Related Records
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#636669]">Record ID</Label>
                          <Input defaultValue="REC-001" readOnly className="mt-1 h-10 bg-[#F5F5F5] text-[12px]" />
                        </div>

                        <div>
                          <Label className="text-[12px] font-semibold text-[#636669]">Record Name</Label>
                          <Input defaultValue="Annual Budget Report" className="mt-1 h-10 text-[12px]" />
                        </div>

                        <div>
                          <Label className="text-[12px] font-semibold text-[#636669]">Status</Label>
                          <Select defaultValue="approved">
                            <SelectTrigger className="mt-1 h-10 text-[12px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-[12px] font-semibold text-[#636669]">Department</Label>
                          <Select defaultValue="finance">
                            <SelectTrigger className="mt-1 h-10 text-[12px]">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="operations">Operations</SelectItem>
                              <SelectItem value="hr">Human Resources</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-[12px] font-semibold text-[#636669]">Created By</Label>
                          <Input defaultValue="John Smith" readOnly className="mt-1 h-10 bg-[#F5F5F5] text-[12px]" />
                        </div>

                        <div>
                          <Label className="text-[12px] font-semibold text-[#636669]">Date</Label>
                          <Input type="date" defaultValue="2023-05-15" className="mt-1 h-10 text-[12px]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label className="text-[12px] font-semibold text-[#636669]">Description</Label>
                      <Textarea
                        className="mt-1 min-h-[120px] text-[12px]"
                        defaultValue="This annual budget report provides a comprehensive overview of the financial planning and allocation for the fiscal year 2023. It includes departmental breakdowns, quarterly projections, and variance analysis compared to the previous year."
                      />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="outline" className="border-[#BD3838] text-[#BD3838]">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                      <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-[16px] font-semibold text-[#192229]">Approval Status</h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                          <Check className="h-4 w-4 text-[#002C71]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium">Submitted by John Smith</p>
                          <p className="text-[10px] text-[#636669]">May 12, 2023 at 10:23 AM</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                          <Check className="h-4 w-4 text-[#002C71]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium">Reviewed by Sarah Johnson</p>
                          <p className="text-[10px] text-[#636669]">May 14, 2023 at 2:45 PM</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                          <Check className="h-4 w-4 text-[#002C71]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium">Approved by Michael Chen</p>
                          <p className="text-[10px] text-[#636669]">May 15, 2023 at 9:30 AM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-[16px] font-semibold text-[#192229]">Version History</h3>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between rounded-lg border border-[#DAD8E8] p-3">
                        <div>
                          <p className="text-[12px] font-medium">Version 2.1 (Current)</p>
                          <p className="text-[10px] text-[#636669]">Updated by John Smith on May 15, 2023</p>
                          <p className="mt-2 text-[12px]">
                            Final approved version with executive comments incorporated.
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px]">
                          View
                        </Button>
                      </div>

                      <div className="flex items-start justify-between rounded-lg border border-[#DAD8E8] p-3">
                        <div>
                          <p className="text-[12px] font-medium">Version 2.0</p>
                          <p className="text-[10px] text-[#636669]">Updated by Sarah Johnson on May 14, 2023</p>
                          <p className="mt-2 text-[12px]">Revised version after department review.</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px]">
                          View
                        </Button>
                      </div>

                      <div className="flex items-start justify-between rounded-lg border border-[#DAD8E8] p-3">
                        <div>
                          <p className="text-[12px] font-medium">Version 1.0</p>
                          <p className="text-[10px] text-[#636669]">Created by John Smith on May 12, 2023</p>
                          <p className="mt-2 text-[12px]">Initial draft submission.</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px]">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-[16px] font-semibold text-[#192229]">Activity Log</h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                          <Check className="h-4 w-4 text-[#002C71]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium">Status changed to Approved</p>
                          <p className="text-[10px] text-[#636669]">May 15, 2023 at 9:30 AM by Michael Chen</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                          <Edit2 className="h-4 w-4 text-[#00B5E2]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium">Record edited</p>
                          <p className="text-[10px] text-[#636669]">May 14, 2023 at 2:45 PM by Sarah Johnson</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE8FA]">
                          <FileSpreadsheet className="h-4 w-4 text-[#BD3978]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium">Record created</p>
                          <p className="text-[10px] text-[#636669]">May 12, 2023 at 10:23 AM by John Smith</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="related" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-[16px] font-semibold text-[#192229]">Related Records</h3>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between rounded-lg border border-[#DAD8E8] p-3">
                        <div>
                          <p className="text-[12px] font-medium">Q1 Financial Summary</p>
                          <p className="text-[10px] text-[#636669]">ID: REC-045 • Created: Feb 10, 2023</p>
                          <div className="mt-1">
                            <span className="inline-flex rounded-full bg-[#EBE8FA] px-2 py-0.5 text-[10px] font-medium text-[#002C71]">
                              Approved
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px]">
                          View
                        </Button>
                      </div>

                      <div className="flex items-start justify-between rounded-lg border border-[#DAD8E8] p-3">
                        <div>
                          <p className="text-[12px] font-medium">Department Budget Requests</p>
                          <p className="text-[10px] text-[#636669]">ID: REC-032 • Created: Jan 15, 2023</p>
                          <div className="mt-1">
                            <span className="inline-flex rounded-full bg-[#EBE8FA] px-2 py-0.5 text-[10px] font-medium text-[#002C71]">
                              Approved
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px]">
                          View
                        </Button>
                      </div>

                      <div className="flex items-start justify-between rounded-lg border border-[#DAD8E8] p-3">
                        <div>
                          <p className="text-[12px] font-medium">Previous Year Budget Analysis</p>
                          <p className="text-[10px] text-[#636669]">ID: REC-012 • Created: Dec 5, 2022</p>
                          <div className="mt-1">
                            <span className="inline-flex rounded-full bg-[#EBE8FA] px-2 py-0.5 text-[10px] font-medium text-[#002C71]">
                              Approved
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px]">
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" className="text-[10px]">
                        Link New Record
                      </Button>
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
