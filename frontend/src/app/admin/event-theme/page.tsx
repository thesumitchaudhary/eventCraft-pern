import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IndianRupee, Palette } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const API_URL = import.meta.env.VITE_BACKEND_URL;

type Theme = {
  _id: string;
  themeName: string;
  themeType: string;
  themePrice: number | string;
};

type ThemePayload = {
  themeName: string;
  themeType: string;
  themePrice: number;
};

type UpdateThemePayload = ThemePayload & {
  id: string;
};

type DeleteThemeResponse = {
  message: string;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, {
    credentials: "include",
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body as T;
};

const createTheme = async (payload: ThemePayload): Promise<Theme> => {
  const res = await fetch(`${API_URL}/admin/addEventTheme`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Failed to create theme");
  }

  return body as Theme;
};

const deleteTheme = async (id: string): Promise<DeleteThemeResponse> => {
  const res = await fetch(`${API_URL}/admin/deleteEventTheme/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Failed to delete theme");
  }

  return body as DeleteThemeResponse;
};

const updateTheme = async ({
  id,
  themeName,
  themeType,
  themePrice,
}: UpdateThemePayload): Promise<Theme> => {
  const res = await fetch(`${API_URL}/admin/updateEventTheme/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      themeName,
      themeType,
      themePrice,
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Failed to update theme");
  }

  return (body?.data ?? body) as Theme;
};

export default function AdminThemePage() {
  const queryClient = useQueryClient();
  const [isAddThemeDialogOpen, setIsAddThemeDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<Theme | null>(null);
  const [newTheme, setNewTheme] = useState({
    themeName: "",
    themeType: "",
    themePrice: "",
  });

  const { data = [], isLoading } = useQuery<Theme[]>({
    queryKey: ["eventThemes"],
    queryFn: () => fetcher<Theme[]>(`${API_URL}/admin/getAllEventTheme`),
  });

  // Normalize response shape: backend returns { result: Theme[] }.
  const themes: Theme[] = (data as any)?.result
    ? (data as any).result
    : Array.isArray(data)
      ? (data as Theme[])
      : [];

  // console.log(themes.map((theme) => theme?.themeName));

  const themeDeleteMutation = useMutation({
    mutationFn: (id: string) => deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventThemes"] });
      if (editRow) {
        setEditRow(null);
      }
    },
  });

  const themeUpdateMutation = useMutation({
    mutationFn: (payload: UpdateThemePayload) => updateTheme(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventThemes"] });
      setEditRow(null);
    },
  });

  const themeCreateMutation = useMutation({
    mutationFn: (payload: ThemePayload) => createTheme(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventThemes"] });
      setIsAddThemeDialogOpen(false);
      setNewTheme({ themeName: "", themeType: "", themePrice: "" });
    },
  });

  const handleSaveTheme = () => {
    const themeName = newTheme.themeName.trim();
    const themeType = newTheme.themeType.trim();
    const themePrice = Number(newTheme.themePrice);

    if (!themeName || !themeType || Number.isNaN(themePrice)) {
      return;
    }

    themeCreateMutation.mutate({
      themeName,
      themeType,
      themePrice,
    });
  };

  const getPriceAsNumber = (price: number | string) =>
    Number(String(price).trim());

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Admin dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Theme Catalog</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between rounded-xl bg-muted/50 p-4">
            <div>
              <h2 className="text-lg font-semibold">Theme Management</h2>
              <p className="text-sm text-muted-foreground">
                Total themes: {data?.result?.map((theme) => theme).length}
              </p>
            </div>
            <div>
              <Button
                className="flex bg-black text-white"
                onClick={() => setIsAddThemeDialogOpen(true)}
              >
                <Palette /> Add Theme
              </Button>
            </div>
          </div>

          <div className="flex justify-between rounded-xl bg-[#fefdfe] p-4">
            <table className="min-w-full">
              <thead className="sticky top-0">
                <tr className="border-b-2 border-black text-left">
                  <th className="border-b px-4 py-3 text-left font-semibold">
                    Theme Name
                  </th>
                  <th className="border-b px-4 py-3 text-left font-semibold">
                    Theme Type
                  </th>
                  <th className="border-b px-4 py-3 text-left font-semibold">
                    Theme Price
                  </th>
                  <th className="border-b px-4 py-3 text-center font-semibold">
                    Update
                  </th>
                  <th className="border-b px-4 py-3 text-center font-semibold">
                    Delete
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Loading themes...
                    </td>
                  </tr>
                )}

                {!isLoading && themes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No themes found
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  themes.map((theme) => (
                    <tr key={theme._id}>
                      <td className="border-b border-black px-4 py-3">
                        <input
                          type="text"
                          value={
                            editRow && editRow._id === theme._id
                              ? (editRow.themeName ?? "")
                              : (theme?.themeName ?? "")
                          }
                          onFocus={() => theme && setEditRow(theme)}
                          onChange={(e) =>
                            setEditRow((prev) => ({
                              ...(prev && prev._id === theme._id
                                ? prev
                                : theme),
                              themeName: e.target.value,
                            }))
                          }
                        />
                      </td>

                      <td className="border-b px-4 py-3">
                        <input
                          type="text"
                          value={
                            editRow && editRow._id === theme._id
                              ? (editRow.themeType ?? "")
                              : (theme?.themeType ?? "")
                          }
                          onFocus={() => theme && setEditRow(theme)}
                          onChange={(e) =>
                            setEditRow((prev) => ({
                              ...(prev && prev._id === theme._id
                                ? prev
                                : theme),
                              themeType: e.target.value,
                            }))
                          }
                        />
                      </td>

                      <td className="border-b px-4 py-3 font-medium">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-5 w-5" />
                          <input
                            type="text"
                            className="w-full bg-transparent outline-none"
                            inputMode="decimal"
                            value={String(
                              editRow && editRow._id === theme._id
                                ? (editRow.themePrice ?? "")
                                : (theme?.themePrice ?? ""),
                            )}
                            onFocus={() => theme && setEditRow(theme)}
                            onChange={(e) =>
                              setEditRow((prev) => ({
                                ...(prev && prev._id === theme._id
                                  ? prev
                                  : theme),
                                themePrice: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </td>

                      <td className="border-b px-4 py-3 text-center">
                        <button
                          disabled={editRow?._id !== theme._id}
                          className="rounded-lg bg-yellow-400 px-4 py-1 text-black hover:bg-yellow-500 disabled:opacity-50"
                          onClick={() => {
                            if (!editRow || editRow._id !== theme._id) {
                              return;
                            }

                            const parsedPrice = getPriceAsNumber(
                              editRow.themePrice,
                            );

                            if (Number.isNaN(parsedPrice)) {
                              return;
                            }

                            themeUpdateMutation.mutate({
                              id: editRow._id,
                              themeName: editRow.themeName,
                              themeType: editRow.themeType,
                              themePrice: parsedPrice,
                            });
                          }}
                        >
                          Update
                        </button>
                      </td>

                      <td className="border-b px-4 py-3 text-center">
                        <button
                          onClick={() => themeDeleteMutation.mutate(theme._id)}
                          className="rounded-lg bg-red-600 px-4 py-1 text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {isAddThemeDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                <h3 className="text-lg font-semibold">Add New Theme</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in theme details to add it to the catalog.
                </p>

                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Theme name"
                    value={newTheme.themeName}
                    onChange={(e) =>
                      setNewTheme((prev) => ({
                        ...prev,
                        themeName: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={newTheme.themeType}
                    onChange={(e) =>
                      setNewTheme((prev) => ({
                        ...prev,
                        themeType: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newTheme.themePrice}
                    onChange={(e) =>
                      setNewTheme((prev) => ({
                        ...prev,
                        themePrice: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddThemeDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTheme}
                    disabled={themeCreateMutation.isPending}
                  >
                    {themeCreateMutation.isPending ? "Saving..." : "Save Theme"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
