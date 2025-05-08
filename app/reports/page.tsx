"use client"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  Menu,
  PieChart,
  RefreshCw,
  Settings,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export default function ReportsPage() {
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
                <SidebarMenuButton isActive tooltip="Reports">
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
            <h1 className="text-center text-[24px] font-bold text-[#192229]">Reports</h1>
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
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Select>
                  <SelectTrigger className="h-10 w-[180px] border-[#DAD8E8] bg-white text-[12px]">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="h-10 w-[180px] border-[#DAD8E8] bg-white text-[12px]">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="h-10 w-10 border-[#DAD8E8] bg-white">
                  <Filter className="h-4 w-4 text-[#192229]" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-10 border-[#00B5E2] text-[#00B5E2]">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button className="h-10 bg-[#002C71] text-[12px] text-white hover:bg-[#002C71]/90">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-3 bg-[#DAD8E8]">
                <TabsTrigger value="summary" className="text-[12px]">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="detailed" className="text-[12px]">
                  Detailed Reports
                </TabsTrigger>
                <TabsTrigger value="custom" className="text-[12px]">
                  Custom Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="rounded-2xl shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[16px] font-semibold text-[#192229]">Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-[200px] items-center justify-center">
                        <PieChart className="h-32 w-32 text-[#002C71]" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[10px] text-[#636669]">Approved</div>
                          <div className="text-[16px] font-semibold text-[#002C71]">65%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#636669]">Pending</div>
                          <div className="text-[16px] font-semibold text-[#ECC710]">25%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#636669]">Rejected</div>
                          <div className="text-[16px] font-semibold text-[#BD3838]">10%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[16px] font-semibold text-[#192229]">Monthly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-[200px] items-center justify-center">
                        <BarChart3 className="h-32 w-32 text-[#00B5E2]" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[10px] text-[#636669]">Jan</div>
                          <div className="text-[16px] font-semibold text-[#00B5E2]">42</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#636669]">Feb</div>
                          <div className="text-[16px] font-semibold text-[#00B5E2]">38</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#636669]">Mar</div>
                          <div className="text-[16px] font-semibold text-[#00B5E2]">56</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[16px] font-semibold text-[#192229]">Department Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-[200px] items-center justify-center">
                        <PieChart className="h-32 w-32 text-[#BD3978]" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[10px] text-[#636669]">Finance</div>
                          <div className="text-[16px] font-semibold text-[#BD3978]">40%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#636669]">HR</div>
                          <div className="text-[16px] font-semibold text-[#BD3978]">35%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#636669]">Ops</div>
                          <div className="text-[16px] font-semibold text-[#BD3978]">25%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[16px] font-semibold text-[#192229]">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-4">
                      <div className="rounded-lg border border-[#DAD8E8] p-4 text-center">
                        <div className="text-[12px] font-medium text-[#636669]">Total Records</div>
                        <div className="text-[24px] font-bold text-[#002C71]">248</div>
                        <div className="text-[10px] text-[#636669]">+12% from last month</div>
                      </div>
                      <div className="rounded-lg border border-[#DAD8E8] p-4 text-center">
                        <div className="text-[12px] font-medium text-[#636669]">Active Users</div>
                        <div className="text-[24px] font-bold text-[#00B5E2]">32</div>
                        <div className="text-[10px] text-[#636669]">+5% from last month</div>
                      </div>
                      <div className="rounded-lg border border-[#DAD8E8] p-4 text-center">
                        <div className="text-[12px] font-medium text-[#636669]">Avg. Processing Time</div>
                        <div className="text-[24px] font-bold text-[#BD3978]">3.2d</div>
                        <div className="text-[10px] text-[#636669]">-0.5d from last month</div>
                      </div>
                      <div className="rounded-lg border border-[#DAD8E8] p-4 text-center">
                        <div className="text-[12px] font-medium text-[#636669]">Completion Rate</div>
                        <div className="text-[24px] font-bold text-[#6D2077]">87%</div>
                        <div className="text-[10px] text-[#636669]">+3% from last month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[16px] font-semibold text-[#192229]">Detailed Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-4">
                        <div>
                          <p className="text-[14px] font-medium">Q1 Financial Summary</p>
                          <p className="text-[10px] text-[#636669]">Generated on May 15, 2023</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px]">
                          <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-4">
                        <div>
                          <p className="text-[14px] font-medium">Department Budget Analysis</p>
                          <p className="text-[10px] text-[#636669]">Generated on April 30, 2023</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px]">
                          <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-4">
                        <div>
                          <p className="text-[14px] font-medium">Employee Performance Review</p>
                          <p className="text-[10px] text-[#636669]">Generated on April 15, 2023</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px]">
                          <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-[#DAD8E8] p-4">
                        <div>
                          <p className="text-[14px] font-medium">Operational Efficiency Report</p>
                          <p className="text-[10px] text-[#636669]">Generated on March 31, 2023</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px]">
                          <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom" className="space-y-6">
                <Card className="rounded-2xl shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[16px] font-semibold text-[#192229]">Custom Report Builder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[12px] font-semibold text-[#192229]">Report Name</label>
                          <input
                            type="text"
                            placeholder="Enter report name"
                            className="w-full rounded-md border border-[#DAD8E8] p-2 text-[12px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[12px] font-semibold text-[#192229]">Report Type</label>
                          <Select>
                            <SelectTrigger className="h-10 text-[12px]">
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="summary">Summary</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                              <SelectItem value="comparative">Comparative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-[#192229]">Data Source</label>
                        <Select>
                          <SelectTrigger className="h-10 text-[12px]">
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Budget_Data_2023.xlsx</SelectItem>
                            <SelectItem value="department">Department_Reports.xlsx</SelectItem>
                            <SelectItem value="employee">Employee_Records.xlsx</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-[#192229]">Date Range</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#636669]" />
                            <input
                              type="text"
                              placeholder="Start date"
                              className="w-full rounded-md border border-[#DAD8E8] p-2 pl-9 text-[12px]"
                            />
                          </div>
                          <span className="text-[12px] text-[#636669]">to</span>
                          <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#636669]" />
                            <input
                              type="text"
                              placeholder="End date"
                              className="w-full rounded-md border border-[#DAD8E8] p-2 pl-9 text-[12px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-[#192229]">Fields to Include</label>
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="field1" className="h-4 w-4 rounded border-[#DAD8E8]" />
                            <label htmlFor="field1" className="text-[12px]">
                              ID
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="field2" className="h-4 w-4 rounded border-[#DAD8E8]" checked />
                            <label htmlFor="field2" className="text-[12px]">
                              Name
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="field3" className="h-4 w-4 rounded border-[#DAD8E8]" checked />
                            <label htmlFor="field3" className="text-[12px]">
                              Status
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="field4" className="h-4 w-4 rounded border-[#DAD8E8]" checked />
                            <label htmlFor="field4" className="text-[12px]">
                              Date
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="field5" className="h-4 w-4 rounded border-[#DAD8E8]" />
                            <label htmlFor="field5" className="text-[12px]">
                              Department
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="field6" className="h-4 w-4 rounded border-[#DAD8E8]" />
                            <label htmlFor="field6" className="text-[12px]">
                              Created By
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-[#192229]">Visualization Type</label>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="flex flex-col items-center gap-2 rounded-lg border border-[#DAD8E8] p-4">
                            <BarChart3 className="h-8 w-8 text-[#002C71]" />
                            <span className="mt-2 text-[12px]">Bar Chart</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 rounded-lg border border-[#DAD8E8] p-4">
                            <PieChart className="h-8 w-8 text-[#BD3978]" />
                            <span className="mt-2 text-[12px]">Pie Chart</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 rounded-lg border border-[#DAD8E8] p-4">
                            <BarChart3 className="h-8 w-8 text-[#00B5E2]" />
                            <span className="mt-2 text-[12px]">Line Chart</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="border-[#00B5E2] text-[#00B5E2]">
                          Save Template
                        </Button>
                        <Button className="bg-[#002C71] text-white hover:bg-[#002C71]/90">Generate Report</Button>
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
