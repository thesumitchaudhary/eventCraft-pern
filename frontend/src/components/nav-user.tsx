import { useState } from "react"
import type { ComponentType } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { BadgeCheckIcon, ChevronsUpDownIcon, LogOutIcon } from "lucide-react"
import { ProfileEditor } from "@/components/profile-editor"
import { useLogout } from "@/utils/logoutUtils"

export function NavUser({
  user,
  onLogout,
  AccountEditor = ProfileEditor,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  onLogout?: () => void
  AccountEditor?: ComponentType<{ onSaved?: () => void }>
}) {
  const { isMobile } = useSidebar()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const handleLogout = useLogout()
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  const hasEmail = Boolean(user.email?.trim())

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* <DropdownMenuItem>
                 <SparklesIcon
                /> 
                 Upgrade to Pro 
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  setIsAccountOpen(true)
                }}
              >
                <BadgeCheckIcon className="size-4" />
                Account
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCardIcon
                />
                Billing
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem>
                <BellIcon
                />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                if (onLogout) {
                  onLogout()
                  return
                }

                handleLogout()
              }}
            >
              <LogOutIcon />
              <span className="ml-2">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Sheet open={isAccountOpen} onOpenChange={setIsAccountOpen}>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className="flex h-full max-h-screen flex-col overflow-hidden sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>Account</SheetTitle>
              <SheetDescription>
                Manage your account details.
              </SheetDescription>
              <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-left">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </div>
                  {hasEmail && (
                    <div className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            </SheetHeader>
            <AccountEditor onSaved={() => setIsAccountOpen(false)} />
          </SheetContent>
        </Sheet>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
