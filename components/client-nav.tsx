"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Briefcase, FileText, Calendar, CreditCard, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function ClientNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/client/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "My Cases",
      href: "/client/cases",
      icon: <Briefcase className="mr-2 h-4 w-4" />,
    },
    {
      title: "Documents",
      href: "/client/documents",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Calendar",
      href: "/client/calendar",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: "Payments",
      href: "/client/payments",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/client/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
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
