"use client"

const ReportsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      {/* Custom Report Builder */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Custom Report Builder</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Input Fields */}
          <div>
            <input
              type="text"
              placeholder="Enter report name"
              className="w-full rounded-md border border-[#DAD8E8] p-2 text-[12px]"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Start date"
              className="w-full rounded-md border border-[#DAD8E8] p-2 pl-9 text-[12px]"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="End date"
              className="w-full rounded-md border border-[#DAD8E8] p-2 pl-9 text-[12px]"
            />
          </div>
        </div>
      </div>

      {/* Report Fields Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Select Report Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Checkboxes */}
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" id="field1" className="h-4 w-4 rounded border-[#DAD8E8]" />
              <span>Field 1</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" id="field2" className="h-4 w-4 rounded border-[#DAD8E8]" defaultChecked />
              <span>Field 2</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" id="field3" className="h-4 w-4 rounded border-[#DAD8E8]" defaultChecked />
              <span>Field 3</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" id="field4" className="h-4 w-4 rounded border-[#DAD8E8]" defaultChecked />
              <span>Field 4</span>
            </label>
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Generate Report
        </button>
      </div>
    </div>
  )
}

export default ReportsPage
