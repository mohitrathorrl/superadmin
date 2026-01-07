"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Webhook,
  CircleGauge ,
  ParkingMeter ,
  Cog , 
  SquareActivity ,
  SlidersHorizontal ,
  LayoutDashboard,
  Wrench,
  TrendingUpDown ,
  Database,
 Shapes ,
  Building2,
  Landmark,
  UserCog,
} from "lucide-react"

// ===============================
// MENU CONFIG
// ===============================
const menuItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Admin Tools",
    icon: Wrench,
    submenu: [
      {
        label: "Manage API",
        href: "/dashboard/admin/api-mapping",
        icon: Webhook ,
      },
      {
        label: "Manage WebsiteConfig",
        href: "/dashboard/admin/website-config",
        icon: Cog ,
      },
      {
        label: "Manage Users",
        href: "/dashboard/admin/user-config",
        icon: UserCog,
      },
      {
        label: "Manage CreditLimit",
        href: "/dashboard/admin/CreditLimit",
        icon: SlidersHorizontal ,
      },
        {
        label: "Manage CreditScore",
        href: "/dashboard/admin/creditScoreSetting",
        icon: CircleGauge  ,

      },
       {
        label: "Manage Collection DPD ",
        href: "/dashboard/admin/collection-dpd-mapping",
        icon: Shapes ,

      },
    ],
  },
  {
    label: "DB Tools",
    icon: Database,
    submenu: [
      {
        label: "Manage FOIR",
        href: "/dashboard/db-tools/foir",
        icon: ParkingMeter  ,
      },
      {
        label: "Manage NBFC",
        href: "/dashboard/db-tools/nbfc",
        icon: Building2,
      },
      {
        label: "Manage Loan DPD",
        href: "/dashboard/db-tools/dpd",
        icon: SquareActivity ,
      },
      {
        label: "Manage Leads",
        href: "/dashboard/db-tools/leads",
        icon: TrendingUpDown ,
      },
       {
        label: "Manage IFSC Codes",
        href: "/dashboard/users/ifsc-codes",
        icon: Landmark,
      },
    ],
  },
  // {
  //   label: "Users",
  //   icon: Users,
  //   submenu: [
      
  //   ],
  // },
]
// ===============================
// NAV ITEM COMPONENT
// ===============================
function NavItem({ item, pathname, isOpen, onToggle }) {
  const hasSubmenu = item.submenu?.length > 0
  const isActive =
    item.href === pathname ||
    item.submenu?.some((sub) => sub.href === pathname)

  // -------- SUBMENU ITEM --------
  if (hasSubmenu) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => onToggle(item.label)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition",
            isActive
              ? "bg-green-100 text-orange-700"
              : "text-zinc-700 hover:bg-green-50 hover:text-orange-800"
          )}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            {item.label}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-3 space-y-1">
            {item.submenu.map((sub) => {
              const subActive = pathname === sub.href

              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    subActive
                      ? "bg-green-200 text-orange-700 font-medium"
                      : "text-zinc-600 hover:bg-green-50 hover:text-orange-800"
                  )}
                >
                  <sub.icon className="h-4 w-4" />
                  {sub.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        isActive
          ? "bg-green-100 text-orange-700"
          : "text-zinc-700 hover:bg-green-50 hover:text-orange-800"
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  )
}

// ===============================
// SIDEBAR ROOT
// ===============================
export function Sidebar({ className = "" }) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState({})

 
  useEffect(() => {
    const initialOpen = {}
    menuItems.forEach((item) => {
      if (item.submenu?.some((sub) => sub.href === pathname)) {
        initialOpen[item.label] = true
      }
    })
    setOpenMenus(initialOpen)
  }, []) 

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label], 
    }))
  }

  return (
    <aside
      className={cn(
        "surface2 p-4 h-[calc(100vh-2rem)] overflow-y-auto",
        className
      )}
    >
      <div className="mb-6 border-b border-gray-300 pb-4 px-2">
        <Link href="/dashboard">
          <Image
            src="https://fincloud-tech.s3.ap-south-1.amazonaws.com/finclouds_logo.png"
            alt="superadmin_dashboard Fintech"
            width={150}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            pathname={pathname}
            isOpen={openMenus[item.label]}
            onToggle={toggleMenu}
          />
        ))}
      </nav>
    </aside>
  )
}
