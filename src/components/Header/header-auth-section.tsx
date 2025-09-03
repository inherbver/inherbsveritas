"use client";
import { useSupabase } from '@/lib/supabase/hooks/use-supabase';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface HeaderAuthSectionProps {
  user: any | null;
  sticky: boolean;
}

export const HeaderAuthSection = ({ user, sticky }: HeaderAuthSectionProps) => {
  const { signOut } = useSupabase();
  const pathUrl = usePathname();
  const { theme, setTheme } = useTheme();

  const renderThemeToggle = () => (
    <button
      aria-label="theme toggler"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`absolute right-17 mr-3 flex h-8 w-8 cursor-pointer items-center justify-center text-body-color duration-300 dark:text-white ${
        pathUrl !== "/" ? "lg:static" : "lg:absolute"
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        className="absolute h-[16px] w-[16px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        fill="currentColor"
      >
        <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className="h-[16px] w-[16px] scale-100 transition-all dark:-rotate-90 dark:scale-0"
        fill="currentColor"
      >
        <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
      </svg>
    </button>
  );

  const renderAuthButtons = () => {
    if (user) {
      return (
        <>
          <p className="text-base font-medium text-body-color dark:text-white">
            Bonjour, {user.user_metadata?.firstName || user.email}
          </p>
          <button
            onClick={() => signOut()}
            className={`signUpBtn rounded-lg px-6 py-3 text-base font-medium duration-300 ease-in-out ${
              pathUrl !== "/" || sticky
                ? "bg-primary bg-opacity-100 text-white hover:bg-opacity-20 hover:text-dark"
                : "bg-white bg-opacity-20 text-white hover:bg-opacity-100 hover:text-dark"
            }`}
          >
            Se déconnecter
          </button>
        </>
      );
    }

    if (pathUrl !== "/") {
      return (
        <>
          <Link
            href="/login"
            className="px-7 py-3 text-base font-medium text-dark hover:opacity-70 dark:text-white"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white duration-300 ease-in-out hover:bg-primary/90 dark:bg-white/10 dark:hover:bg-white/20"
          >
            S&apos;inscrire
          </Link>
        </>
      );
    }

    return (
      <>
        <Link
          href="/login"
          className={`px-7 py-3 text-base font-medium hover:opacity-70 ${
            sticky ? "text-dark dark:text-white" : "text-white"
          }`}
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className={`rounded-lg px-6 py-3 text-base font-medium text-white duration-300 ease-in-out ${
            sticky
              ? "bg-primary hover:bg-primary/90 dark:bg-white/10 dark:hover:bg-white/20"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          S&apos;inscrire
        </Link>
      </>
    );
  };

  return (
    <div className="flex w-full items-center justify-between px-4">
      <div className="flex items-center justify-end pr-16 lg:pr-0">
        {renderThemeToggle()}
        <div className="hidden items-center justify-end pl-4 sm:flex lg:pl-0">
          {renderAuthButtons()}
        </div>
      </div>
    </div>
  );
};