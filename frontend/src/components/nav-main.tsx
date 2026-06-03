import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

function renderIcon(icon?: LucideIcon | React.ReactNode) {
  if (!icon) {
    return null
  }

  if (React.isValidElement(icon)) {
    return icon
  }

  return React.createElement(icon as React.ElementType)
}

export function NavMain({
  items,
  onNavigate,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon | React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  onNavigate?: () => void
}) {
  const location = useLocation()

  const normalizePath = (path: string) => {
    if (path === "/") return "/"
    return path.replace(/\/+$/, "")
  }

  const isItemActive = (itemUrl: string) => {
    const currentPath = normalizePath(location.pathname)
    const targetPath = normalizePath(itemUrl)

    return currentPath === targetPath
  }

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          const active = isItemActive(item.url)

          return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive ?? active}
            className="group/collapsible"
          > 
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
                  <Link to={item.url} onClick={onNavigate}>
                    {renderIcon(item.icon)}
                    <span>{item.title}</span>
                    {/* <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> */}
                  </Link>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {/* <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub> */}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
