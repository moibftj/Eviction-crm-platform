"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, FileText, Home, Users, Briefcase, Building, Bell, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function DashboardNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Cases",
      href: "/cases",
      icon: <Briefcase className="mr-2 h-4 w-4" />,
    },
    {
      title: "Contacts",
      href: "/contacts",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Properties",
      href: "/properties",
      icon: <Building className="mr-2 h-4 w-4" />,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: <Bell className="mr-2 h-4 w-4" />,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: <Bell className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
