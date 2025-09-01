"use client";
import { usePathname } from "next/navigation";

interface MobileMenuButtonProps {
  navbarOpen: boolean;
  navbarToggleHandler: () => void;
  sticky: boolean;
}

export const MobileMenuButton = ({ 
  navbarOpen, 
  navbarToggleHandler, 
  sticky 
}: MobileMenuButtonProps) => {
  const pathUrl = usePathname();

  const getBarClasses = (extraClasses: string = "") => {
    return `relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${extraClasses} ${
      pathUrl !== "/" && "!bg-dark dark:!bg-white"
    } ${
      pathUrl === "/" && sticky
        ? "bg-dark dark:bg-white"
        : "bg-white"
    }`;
  };

  return (
    <button
      onClick={navbarToggleHandler}
      id="navbarToggler"
      aria-label="Mobile Menu"
      className="absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
    >
      <span
        className={getBarClasses(navbarOpen ? " top-[7px] rotate-45" : " ")}
      />
      <span
        className={getBarClasses(navbarOpen ? "opacity-0 " : " ")}
      />
      <span
        className={getBarClasses(navbarOpen ? " top-[-8px] -rotate-45" : " ")}
      />
    </button>
  );
};