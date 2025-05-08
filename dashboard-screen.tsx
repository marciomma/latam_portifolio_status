"use client"

import { useState } from "react"
import {
  BarChart3,
  CalendarIcon,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

// Sample data
const records = [
  { id: "REC-001", name: "Annual Budget Report", status: "Approved", date: "2023-05-15" },
  { id: "REC-002", name: "Q2 Sales Forecast", status: "Pending", date: "2023-06-01" },
  { id: "REC-003", name: "Marketing Campaign Results", status: "Approved", date: "2023-05-28" },
  { id: "REC-004", name: "Employee Satisfaction Survey", status: "Rejected", date: "2023-05-10" },
  { id: "REC-005", name: "Product Development Timeline", status: "Pending", date: "2023-06-15" },
  { id: "REC-006", name: "Customer Feedback Analysis", status: "Approved", date: "2023-05-22" },
  { id: "REC-007", name: "Vendor Contract Review", status: "Pending", date: "2023-06-05" },
  { id: "REC-008", name: "IT Infrastructure Audit", status: "Rejected", date: "2023-05-18" },
]

export default function DashboardScreen() {
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [date, setDate] = useState<Date>()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-[#002C71] bg-[#EBE8FA]"
      case "Pending":
        return "text-[#ECC710] bg-[#FDFAEB]"
      case "Rejected":
        return "text-[#BD3838] bg-[#FAEAEA]"
      default:
        return "text-[#636669] bg-[#F5F5F5]"
    }
  }

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
                <SidebarMenuButton isActive tooltip="Dashboard">
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
            <SidebarTrigger className="lg:hidden">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <h1 className="text-center text-[24px] font-bold text-[#192229]">Excel Data Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-6 w-6 text-[#192229]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <Card className="rounded-2xl shadow-md">
              <CardContent className="p-0">
                {/* Filter Bar */}
                <div className="border-b border-[#DAD8E8] bg-white p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-wrap gap-2">
                      <Select>
                        <SelectTrigger className="h-10 w-[180px] border-[#DAD8E8] bg-white text-[12px]">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-10 justify-start border-[#DAD8E8] bg-white text-[12px] text-[#192229]"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? date.toLocaleDateString() : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>

                      <Button variant="outline" size="icon" className="h-10 w-10 border-[#DAD8E8] bg-white">
                        <Filter className="h-4 w-4 text-[#192229]" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#636669]" />
                        <Input placeholder="Search records..." className="h-10 pl-9 text-[12px]" />
                      </div>
                      <Button className="h-10 bg-[#002C71] text-[12px] text-white hover:bg-[#002C71]/90">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#F5F5F5]">
                      <TableRow>
                        <TableHead className="text-[12px] font-semibold text-[#192229]">ID</TableHead>
                        <TableHead className="text-[12px] font-semibold text-[#192229]">Name</TableHead>
                        <TableHead className="text-[12px] font-semibold text-[#192229]">Status</TableHead>
                        <TableHead className="text-[12px] font-semibold text-[#192229]">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow
                          key={record.id}
                          className="cursor-pointer hover:bg-[#EBE8FA]"
                          onClick={() => {
                            setSelectedRecord(record)
                            setDetailOpen(true)
                          }}
                        >
                          <TableCell className="text-[12px] font-medium">{record.id}</TableCell>
                          <TableCell className="text-[12px]">{record.name}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getStatusColor(record.status)}`}
                            >
                              {record.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-[12px]">{new Date(record.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>

          {/* Footer */}
          <footer className="border-t border-[#DAD8E8] bg-white p-4">
            <div className="text-center text-[10px] text-[#636669]">
              © 2023 NUVA Corporation. All rights reserved. Version 1.2.3
            </div>
          </footer>
        </div>

        {/* Detail Side Panel */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            {selectedRecord && (
              <div className="flex h-full flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-[24px] font-bold text-[#192229]">Record Details</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-medium ${getStatusColor(selectedRecord.status)}`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-[16px] font-semibold text-[#192229]">Record Information</h3>
                    <Card className="rounded-2xl border-[#DAD8E8]">
                      <CardContent className="p-4">
                        <div className="grid gap-4">
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">ID</div>
                            <div className="text-[14px] font-medium">{selectedRecord.id}</div>
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">Name</div>
                            <div className="text-[14px]">{selectedRecord.name}</div>
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">Date</div>
                            <div className="text-[14px]">{new Date(selectedRecord.date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">Created By</div>
                            <div className="text-[14px]">John Smith</div>
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">Department</div>
                            <div className="text-[14px]">Finance</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[16px] font-semibold text-[#192229]">Additional Details</h3>
                    <Card className="rounded-2xl border-[#DAD8E8]">
                      <CardContent className="p-4">
                        <div className="grid gap-4">
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">Description</div>
                            <div className="text-[14px]">
                              This is a detailed description of the {selectedRecord.name.toLowerCase()} record. It
                              contains important information related to this specific entry.
                            </div>
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">Last Modified</div>
                            <div className="text-[14px]">May 30, 2023</div>
                          </div>
                          <div>
                            <div className="text-[12px] font-medium text-[#636669]">Version</div>
                            <div className="text-[14px]">2.1</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" className="border-[#00B5E2] text-[#00B5E2]">
                    Edit
                  </Button>
                  <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">Download</Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </SidebarProvider>
  )
}
