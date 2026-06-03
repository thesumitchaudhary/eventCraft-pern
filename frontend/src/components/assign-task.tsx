import { useState } from "react";
import { X } from "lucide-react";
import { Button, Select, TextInput } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4041/api";

type BookedEvent = {
  _id: string;
  eventName?: string;
  eventType?: string;
  theme?: string;
  eventDate?: string;
  venue?: string;
  guestCount?: number;
  totalAmount?: number;
};

type CustomerWithEvents = {
  events?: BookedEvent[];
};

type ShowBookedEventResponse = {
  customers?: CustomerWithEvents[];
};

type EmployeeUser = {
  _id: string;
  firstname?: string;
  lastname?: string;
};

type EmployeeResponse = {
  users?: EmployeeUser[];
};

type AssignTaskPayload = {
  eventId: string;
  taskTitle: string;
  taskDescription: string;
  assignTo: string;
  priority: "Low" | "Medium" | "High";
  selectDate: string;
};

type TaskPriority = "Low" | "Medium" | "High";

type AssignTaskModalProps = {
  open: boolean;
  closeTaskModal: () => void;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error("Invalid JSON response");
  }

  if (!res.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message?: string }).message || "Request failed")
        : "Request failed";
    throw new Error(message);
  }

  return body as T;
};

const assignTask = async (payload: AssignTaskPayload) => {
  const res = await fetch(`${API_BASE}/admin/createTask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = (await res.json().catch(() => ({}))) as { message?: string };

  if (!res.ok) {
    throw new Error(body?.message || "There was a problem assigning the task");
  }

  return body;
};

const AssignTaskModal = ({ open, closeTaskModal }: AssignTaskModalProps) => {
  const queryClient = useQueryClient();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignTo, setAssignTo] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority | null>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { data, isLoading } = useQuery<ShowBookedEventResponse>({
    queryKey: ["showbookings"],
    queryFn: () => fetcher<ShowBookedEventResponse>(`${API_BASE}/admin/showBookedEvent`),
    enabled: open,
  });

  const { data: empData, isLoading: isEmployeeLoading } = useQuery<EmployeeResponse>({
    queryKey: ["showemployee"],
    queryFn: () => fetcher<EmployeeResponse>(`${API_BASE}/employee/findEmployee`),
    enabled: open,
  });

  const eventOptions =
    data?.customers?.flatMap((customer) =>
      (customer?.events ?? []).map((eventData) => ({
        value: eventData._id,
        label: eventData.eventName || "Untitled event",
      })),
    ) ?? [];

  const employeeOptions =
    empData?.users?.map((employee) => ({
      value: String(employee?._id ?? ""),
      label: `${employee?.firstname ?? ""} ${employee?.lastname ?? ""}`.trim() ||
        "Unnamed employee",
    })) ?? [];

  const selectedEvent =
    data?.customers
      ?.flatMap((customer) => customer?.events ?? [])
      ?.find((eventData) => eventData?._id === selectedEventId) ?? null;

  const taskMutation = useMutation({
    mutationFn: () => {
      if (!selectedEventId || !assignTo || !dueDate) {
        throw new Error("Please complete all required fields");
      }

      return assignTask({
        eventId: selectedEventId,
        taskTitle: taskTitle.trim(),
        taskDescription: description.trim(),
        assignTo,
        priority: priority || "Medium",
        selectDate: new Date(dueDate).toISOString(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["allTaskDetails"] });
      await queryClient.invalidateQueries({ queryKey: ["showemployee"] });
      closeTaskModal();
      setSelectedEventId(null);
      setTaskTitle("");
      setDescription("");
      setAssignTo(null);
      setPriority("Medium");
      setDueDate("");
      setSubmitError("");
    },
    onError: (error) => {
      setSubmitError(error.message || "Failed to assign task");
    },
  });

  const handleAssignTask = () => {
    setSubmitError("");

    if (!selectedEventId || !taskTitle.trim() || !description.trim() || !assignTo || !dueDate) {
      setSubmitError("Event, title, description, employee, and due date are required");
      return;
    }

    taskMutation.mutate();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="z-10">
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={closeTaskModal}
      />

      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-task-dialog-title"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="assign-task-dialog-title" className="text-xl font-semibold">
              Assign New Task
            </h2>
            <p className="text-sm text-gray-500">
              Create and assign a task to an employee for an event.
            </p>
          </div>
          <button
            type="button"
            className="text-gray-500 transition hover:text-black"
            onClick={closeTaskModal}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <Select
            label="Related Event"
            placeholder={isLoading ? "Loading events..." : "Select event"}
            value={selectedEventId}
            onChange={(value) => setSelectedEventId(value ? String(value) : null)}
            data={eventOptions}
            searchable
            disabled={isLoading || eventOptions.length === 0}
          />

          {selectedEvent && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <h4 className="text-sm font-semibold text-blue-900">Event Details</h4>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{selectedEvent.eventName || "-"}</span>
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{selectedEvent.eventType || "-"}</span>
                <span className="text-gray-600">Theme:</span>
                <span className="font-medium">{selectedEvent.theme || "-"}</span>
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {selectedEvent.eventDate
                    ? new Date(selectedEvent.eventDate).toLocaleDateString()
                    : "-"}
                </span>
                <span className="text-gray-600">Venue:</span>
                <span className="font-medium">{selectedEvent.venue || "-"}</span>
                <span className="text-gray-600">Guests:</span>
                <span className="font-medium">{selectedEvent.guestCount ?? "-"}</span>
              </div>
            </div>
          )}

          <TextInput
            label="Task Title"
            placeholder="Setup venue decorations"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.currentTarget.value)}
          />

          <TextInput
            label="Description"
            placeholder="Describe task details"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />

          <Select
            label="Assign To"
            placeholder={isEmployeeLoading ? "Loading employees..." : "Select employee"}
            value={assignTo}
            onChange={(value) => setAssignTo(value ? String(value) : null)}
            data={employeeOptions}
            searchable
            disabled={isEmployeeLoading || employeeOptions.length === 0}
          />

          <Select
            label="Priority"
            placeholder="Select priority"
            value={priority}
            onChange={(value) =>
              setPriority(value ? (String(value) as TaskPriority) : null)
            }
            data={["Low", "Medium", "High"]}
          />

          <TextInput
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(event) => setDueDate(event.currentTarget.value)}
          />

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <Button
            fullWidth
            color="dark"
            onClick={handleAssignTask}
            loading={taskMutation.isPending}
          >
            {taskMutation.isPending ? "Assigning..." : "Assign Task"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;
