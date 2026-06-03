import { useContext, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";

import { Context } from "@/context/Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserShape = {
  _id?: string;
  firstName?: string;
  firstname?: string;
  lastName?: string;
  lastname?: string;
  email?: string;
  profileImageUrl?: string;
  profileImage?: string;
};

type CustomerShape = {
  userId?: UserShape;
  phone?: string;
  address?: string;
};

type CustomerMeResponse = {
  customer?: CustomerShape;
};

type UpdatePayload = {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  address: string;
  profileImage?: string;
};

type ProfileEditorProps = {
  onSaved?: () => void;
};

const API_URL = import.meta.env.VITE_BACKEND_URL as string;
const CUSTOMER_API_URL =
  (import.meta.env.VITE_CUSTOMER_BACKEND_URL as string) || API_URL;

const fetchMe = async (): Promise<CustomerMeResponse> => {
  const res = await fetch(`${API_URL}/customer/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.status}`);
  }

  return res.json();
};

const updateUser = async ({
  id,
  firstname,
  lastname,
  phone,
  address,
  profileImage,
}: UpdatePayload) => {
  const res = await fetch(`${CUSTOMER_API_URL}/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      firstname,
      lastname,
      phone,
      address,
      profileImage,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    message?: string;
    user?: UserShape;
  };

  if (!res.ok) {
    throw new Error(body.message || "Failed to update profile");
  }

  return body;
};

export function ProfileEditor({ onSaved }: ProfileEditorProps) {
  const {
    firstname,
    setFirstname,
    lastname,
    setLastname,
    email,
    setEmail,
    phone,
    setPhone,
    address,
    setAddress,
  } = useContext(Context);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imageDraft, setImageDraft] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isVideoReady, setIsVideoReady] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchMe,
  });

  console.log(data?.result?.firstName);

  useEffect(() => {
    if (!data?.customer?.userId) return;

    const user = data.customer.userId;
    const customer = data.customer;

    setFirstname(user.firstName ?? user.firstname ?? "");
    setLastname(user.lastName ?? user.lastname ?? "");
    setEmail(user.email ?? "");
    setPhone(customer.phone ?? "");
    setAddress(customer.address ?? "");
  }, [data, setAddress, setEmail, setFirstname, setLastname, setPhone]);

  useEffect(() => {
    if (!error) return;
    console.error("Failed to load profile", error);
  }, [error]);

  useEffect(() => {
    if (!isCameraOpen || !stream || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = stream;
    video.play().catch(() => null);
  }, [isCameraOpen, stream]);

  useEffect(() => {
    return () => {
      if (!stream) return;
      stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setIsVideoReady(false);
  };

  const startCamera = async () => {
    setCameraError("");
    setIsVideoReady(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }

    if (
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setCameraError("Camera requires HTTPS or localhost.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      const cameraErr = err as { name?: string };

      if (cameraErr?.name === "NotAllowedError") {
        setCameraError("Camera permission blocked. Allow camera access in browser settings.");
        return;
      }

      if (cameraErr?.name === "NotFoundError") {
        setCameraError("No camera device was found on this system.");
        return;
      }

      if (cameraErr?.name === "NotReadableError") {
        setCameraError("Camera is already in use by another app. Close it and try again.");
        return;
      }

      setCameraError("Unable to start camera. Please try again.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCameraError("Camera preview is not ready yet.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError("Wait a second for camera to initialize, then capture.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Unable to capture photo. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setImageDraft(dataUrl);

    stopCamera();
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageDraft(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: (payload: UpdatePayload) => updateUser(payload),
    onSuccess: (result) => {
      const nextImage = result.user?.profileImageUrl ?? result.user?.profileImage;
      if (nextImage) setImageDraft(nextImage);
      refetch();
      if (onSaved) onSaved();
    },
    onError: (err) => {
      console.error("Update failed", err);
    },
  });

  const userId = data?.customer?.userId?._id;
  const serverImage =
    data?.customer?.userId?.profileImageUrl ??
    data?.customer?.userId?.profileImage ??
    null;
  const imagePreview = imageDraft ?? serverImage;

  const submitUpdate = () => {
    if (!userId) return;

    mutation.mutate({
      id: userId,
      firstname,
      lastname,
      phone,
      address,
      profileImage: imageDraft?.startsWith("data:image/") ? imageDraft : undefined,
    });
  };

  return (
    <div className="mt-4 flex-1 space-y-4 overflow-y-auto px-4 pb-6">
      <div className="rounded-xl border p-4">
        <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-100">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={() => setImageDraft(null)}
            />
          ) : isCameraOpen ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => setIsVideoReady(true)}
              onCanPlay={() => setIsVideoReady(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-center text-xs text-gray-400">No image</span>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {cameraError && <p className="mt-2 text-xs text-red-600">{cameraError}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {!isCameraOpen && !imagePreview && (
            <>
              <label className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
              <Button type="button" onClick={startCamera} className="gap-2">
                <Camera className="h-4 w-4" /> Camera
              </Button>
            </>
          )}

          {isCameraOpen && (
            <>
              <Button type="button" onClick={capturePhoto} disabled={!isVideoReady}>
                Capture
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </>
          )}

          {imagePreview && (
            <>
              <Button type="button" variant="outline" onClick={() => setImageDraft("")}>
                Retake
              </Button>
              <Button
                type="button"
                onClick={submitUpdate}
                disabled={mutation.isPending || !imageDraft?.startsWith("data:image/")}
              >
                {mutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">First Name</p>
          <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Last Name</p>
          <Input value={lastname} onChange={(e) => setLastname(e.target.value)} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Phone</p>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Address</p>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Email (Read-only)</p>
          <Input value={email} disabled onChange={(e) => setEmail(e.target.value)} />
        </div>

        <Button type="button" onClick={submitUpdate} disabled={mutation.isPending || !userId}>
          {mutation.isPending ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </div>
  );
}
