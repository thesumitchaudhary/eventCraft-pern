import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { Select, TextInput } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4041/api";

const statusMap: Record<string, string> = {
  Pending: "pending",
  "In Progress": "in-progress",
  Completed: "completed",
};

const fileToBase64 = (inputFile: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const payload = result.includes(",") ? result.split(",")[1] : result;
      resolve(payload);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(inputFile);
  });

type TaskRef = {
  _id: string;
  taskTitle?: string;
  assignTo?: string | { _id?: string };
  employeeId?: string | { _id?: string };
};

type UpdateTaskModalProps = {
  closeUpdateModal: () => void;
  task: TaskRef;
};

const UpdateTaskModal = ({ closeUpdateModal, task }: UpdateTaskModalProps) => {
  const [status, setStatus] = useState<string>("");
  const [workUpdate, setWorkUpdate] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  const [focusedStatus, setFocusedStatus] = useState(false);
  const [focusedWorkUpdate, setFocusedWorkUpdate] = useState(false);
  const [focusedFile, setFocusedFile] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const floatingFile = focusedFile || !!file;

  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  const updateProgress = (clientX: number) => {
    if (!barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    let value = ((clientX - rect.left) / rect.width) * 100;

    if (value <= 0) value = 0;
    if (value >= 100) value = 100;

    setProgress(value);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    updateProgress(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateProgress(e.clientX);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const getEmployeeId = () => {
    if (!task) return "";

    if (typeof task.assignTo === "string") return task.assignTo;
    if (task.assignTo && typeof task.assignTo === "object") {
      return task.assignTo._id || "";
    }

    if (typeof task.employeeId === "string") return task.employeeId;
    if (task.employeeId && typeof task.employeeId === "object") {
      return task.employeeId._id || "";
    }

    return "";
  };

  const createWorkUpdateMutation = useMutation({
    mutationFn: async () => {
      const taskId = task?._id;
      const employeeId = getEmployeeId();
      const normalizedStatus = statusMap[status] || "pending";
      const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

      if (!taskId) {
        throw new Error("Task ID is missing");
      }

      if (!employeeId) {
        throw new Error("Employee ID is missing for this task");
      }

      let key = "";
      let fileName = "";
      let contentType = "";

      if (file) {
        fileName = file.name;
        contentType = file.type || "application/octet-stream";

        try {
          const uploadUrlRes = await fetch(`${API_BASE}/employee/work-updates/upload-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ fileName, contentType }),
          });

          const uploadUrlData = await uploadUrlRes.json().catch(() => ({}));
          if (!uploadUrlRes.ok) {
            throw new Error(uploadUrlData?.error || "Failed to generate upload URL");
          }

          key = uploadUrlData?.key || "";

          const s3UploadRes = await fetch(uploadUrlData.uploadURL, {
            method: "PUT",
            headers: { "Content-Type": contentType },
            body: file,
          });

          if (!s3UploadRes.ok) {
            throw new Error("Failed to upload file to S3");
          }
        } catch (uploadErr) {
          const fileBase64 = await fileToBase64(file);

          const proxyRes = await fetch(`${API_BASE}/employee/work-updates/upload-file`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              fileName,
              contentType,
              fileBase64,
            }),
          });

          const proxyData = await proxyRes.json().catch(() => ({}));
          if (!proxyRes.ok) {
            throw new Error(proxyData?.error || (uploadErr as Error)?.message || "File upload failed");
          }

          key = proxyData?.key || key;
          fileName = proxyData?.fileName || fileName;
          contentType = proxyData?.contentType || contentType;
        }
      }

      const createRes = await fetch(`${API_BASE}/employee/work-updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          taskId,
          employeeId,
          status: normalizedStatus,
          progress: roundedProgress,
          note: workUpdate,
          key,
          fileName,
          contentType,
        }),
      });

      const created = await createRes.json().catch(() => ({}));
      if (!createRes.ok) {
        throw new Error(created?.error || "Failed to create work update");
      }

      return created;
    },
    onSuccess: () => {
      closeUpdateModal();
    },
    onError: (err) => {
      const message = err?.message || "Failed to submit update";
      setSubmitError(
        message === "Failed to fetch"
          ? "Upload blocked by network/CORS. Please retry."
          : message,
      );
    },
  });

  const handleSubmit = () => {
    setSubmitError("");
    createWorkUpdateMutation.mutate();
  };

  return (
    <div className="z-10">
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={closeUpdateModal}
      />

      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-dialog-title"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 id="task-dialog-title" className="text-lg font-semibold text-gray-800">
              Update Task Status
            </h3>
            <p className="text-sm text-gray-500">{task?.taskTitle || "Update assigned task"}</p>
          </div>

          <button
            onClick={closeUpdateModal}
            className="text-gray-500 transition hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <Select
            value={status}
            onChange={(value) => setStatus(value || "")}
            label="Select Status"
            placeholder={focusedStatus ? "Select Status" : ""}
            data={["Pending", "In Progress", "Completed"]}
            onFocus={() => setFocusedStatus(true)}
            onBlur={() => setFocusedStatus(false)}
            classNames={{
              root: "relative",
              input:
                "!rounded-none !border-0 !border-b-2 !border-gray-300 bg-transparent px-0 pb-2 pt-5 focus:!border-gray-900 focus:outline-none",
              label: "mb-1 block text-sm font-medium text-gray-500",
            }}
          />

          <TextInput
            label="Work Update"
            placeholder={
              focusedWorkUpdate
                ? "Floral arrangements ordered. Setting up stage decorations."
                : ""
            }
            value={workUpdate}
            onChange={(e) => setWorkUpdate(e.currentTarget.value)}
            onFocus={() => setFocusedWorkUpdate(true)}
            onBlur={() => setFocusedWorkUpdate(false)}
            classNames={{
              root: "relative",
              input:
                "!rounded-none !border-0 !border-b-2 !border-gray-300 bg-transparent px-0 pb-2 pt-5 focus:!border-gray-900 focus:outline-none",
              label: "mb-1 block text-sm font-medium text-gray-500",
            }}
          />

          <div>
            <div className="mb-1 flex justify-between text-sm text-gray-600">
              <span>Event Progress</span>
              <span className="font-medium">{Math.floor(progress)}%</span>
            </div>

            <div
              ref={barRef}
              className="relative h-3 w-full cursor-pointer rounded-full bg-gray-200"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="relative h-3 rounded-full bg-black transition-all"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border border-black bg-white shadow-sm" />
              </div>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              onFocus={() => setFocusedFile(true)}
              onBlur={() => setFocusedFile(false)}
              className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 pb-2 pt-5 focus:border-black focus:outline-none"
            />

            <label
              className={`absolute left-0 top-2 text-sm text-gray-400 transition-all ${
                floatingFile ? "-translate-y-7 text-xs text-gray-900" : ""
              }`}
            >
              Upload Work Evidence
            </label>
          </div>
        </div>

        {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={createWorkUpdateMutation.isPending}
            className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-900 disabled:opacity-70"
          >
            {createWorkUpdateMutation.isPending ? "Uploading..." : "Update Work"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTaskModal;