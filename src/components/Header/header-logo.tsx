"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderLogoProps {
  sticky: boolean;
}

export const HeaderLogo = ({ sticky }: HeaderLogoProps) => {
  const pathUrl = usePathname();

  return (
    <div className="w-60 max-w-full px-4">
      <Link
        href="/"
        className={`navbar-logo block w-full ${
          sticky ? "py-2" : "py-5"
        } `}
      >
        {pathUrl !== "/" ? (
          <>
            <Image
              src={`/images/logo/logo.svg`}
              alt="logo"
              width={240}
              height={30}
              className="header-logo w-full dark:hidden"
            />
            <Image
              src={`/images/logo/logo-white.svg`}
              alt="logo"
              width={240}
              height={30}
              className="header-logo hidden w-full dark:block"
            />
          </>
        ) : (
          <>
            <Image
              src={`${
                sticky
                  ? "/images/logo/logo.svg"
                  : "/images/logo/logo-white.svg"
              }`}
              alt="logo"
              width={140}
              height={30}
              className="header-logo w-full dark:hidden"
            />
            <Image
              src={"/images/logo/logo-white.svg"}
              alt="logo"
              width={140}
              height={30}
              className="header-logo hidden w-full dark:block"
            />
          </>
        )}
      </Link>
    </div>
  );
};