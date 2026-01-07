// import { Sidebar } from "@/components/dashboard/sidebar"
// import { Topbar } from "@/components/dashboard/topbar"

// export const metadata = {
//   title: "Dashboard | superadmin_dashbaord Fintech",
//   description: "Dashboard overview and controls",
// }

// export default function DashboardLayout({ children }) {
//   return (
//     <div className="min-h-screen bg-white">
//       {/* SIDEBAR (FIXED) */}
//       <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-40">
//         <Sidebar />
//       </aside>

//       {/* CONTENT AREA */}
//       <div className="lg:ml-64 flex min-h-screen flex-col">
//         {/* TOPBAR (STICKY) */}
//         <div className="sticky top-0 z-30">
//           <Topbar />
//         </div>

//         {/* PAGE CONTENT (SCROLLS) */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="container-app py-4">
//             <div className="surface p-6">{children}</div>
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }
"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar />
      </aside>
      <div className="lg:ml-64 flex min-h-screen flex-col">
        <div className="sticky top-0 z-30">
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="container-app py-4">
            <div className="surface p-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
