import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { X } from "lucide-react";

import SignupForm from "./SignupForm";
import SigninForm from "./SigninForm";

type AuthMode = "signin" | "signup";

interface AuthModalProps {
  setOpen?: (value: boolean) => void;
  defaultMode?: AuthMode;
}

const AuthModal = ({ setOpen, defaultMode = "signin" }: AuthModalProps) => {
  const [mode, setMode] = useState(defaultMode);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const safeSetOpen = typeof setOpen === "function" ? setOpen : () => {};

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // OPEN animation
  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      {
        y: 24,
        opacity: 0,
        scale: 0.95,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
      },
    );
  }, []);

  // CLOSE animation (outside click)
  const closeModal = () => {
    gsap.to(modalRef.current, {
      y: -24,
      opacity: 0,
      scale: 0.95,
      duration: 0.25,
      ease: "power3.in",
      onComplete: () => safeSetOpen(false),
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="w-full max-w-[450px] rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl"
        >
          <div>
            <div className="flex justify-between">
              <div>
                <h1 className="font-semibold">Welcome to Eventify</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to your account or create a new one
                </p>
              </div>
              <button
                onClick={() => safeSetOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X />
              </button>
            </div>
            <div className="mb-4 flex justify-between gap-4 rounded-xl bg-muted p-2">
              <button
                className={`flex-1 rounded-lg py-1 transition-colors ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>

              <button
                className={`flex-1 rounded-lg py-1 transition-colors ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMode("signin")}
              >
                Sign In
              </button>
            </div>
          </div>

          {mode === "signup" ? <SignupForm /> : <SigninForm />}
          {mode === "signup" ? (
            <div>
              If you have an account{" "}
              <a className="text-blue-600"  href="#" onClick={() => setMode("signin")}>signin</a>{" "}
            </div>
          ) : (
            <div>
              If you don't have an account{" "}
              <a className="text-blue-600" href="#" onClick={() => setMode("signup")}>signup</a>{" "}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
