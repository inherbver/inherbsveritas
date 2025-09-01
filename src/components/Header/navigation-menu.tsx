"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationMenuProps {
  menuData: any[];
  navbarOpen: boolean;
  navbarToggleHandler: () => void;
  sticky: boolean;
  openIndex: number;
  handleSubmenu: (index: number) => void;
}

export const NavigationMenu = ({
  menuData,
  navbarOpen,
  navbarToggleHandler,
  sticky,
  openIndex,
  handleSubmenu,
}: NavigationMenuProps) => {
  const pathUrl = usePathname();

  const renderDropdownIcon = () => (
    <span className="pl-1">
      <svg
        className={`duration-300 lg:group-hover:rotate-180`}
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.00039 11.9C7.85039 11.9 7.72539 11.85 7.60039 11.75L1.85039 6.10005C1.62539 5.87505 1.62539 5.52505 1.85039 5.30005C2.07539 5.07505 2.42539 5.07505 2.65039 5.30005L8.00039 10.525L13.3504 5.25005C13.5754 5.02505 13.9254 5.02505 14.1504 5.25005C14.3754 5.47505 14.3754 5.82505 14.1504 6.05005L8.40039 11.7C8.27539 11.825 8.15039 11.9 8.00039 11.9Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );

  const getMenuLinkClasses = (isHomePage: boolean) => {
    if (isHomePage) {
      return `ud-menu-scroll flex py-2 text-base lg:inline-flex lg:px-0 lg:py-6 ${
        sticky
          ? "text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary"
          : "text-body-color dark:text-white lg:text-white"
      }`;
    }
    return "ud-menu-scroll flex py-2 text-base text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6";
  };

  const getSubmenuButtonClasses = (isHomePage: boolean) => {
    if (isHomePage) {
      return `ud-menu-scroll flex items-center justify-between py-2 text-base lg:inline-flex lg:px-0 lg:py-6 ${
        sticky
          ? "text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary"
          : "text-white"
      }`;
    }
    return "ud-menu-scroll flex items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6";
  };

  return (
    <nav
      role="navigation"
      aria-label="Navigation principale"
      id="navbarCollapse"
      className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-dark-2 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 lg:dark:bg-transparent ${
        navbarOpen
          ? "visibility top-full opacity-100"
          : "invisible top-[120%] opacity-0"
      }`}
    >
      <ul className="block lg:ml-8 lg:flex lg:gap-x-8 xl:ml-14 xl:gap-x-12">
        {menuData.map((menuItem, index) =>
          menuItem.path ? (
            <li key={index} className="group relative">
              <Link
                onClick={navbarToggleHandler}
                scroll={false}
                href={menuItem.path}
                className={`${getMenuLinkClasses(pathUrl === "/")} ${
                  pathUrl === menuItem?.path && (pathUrl !== "/" || sticky) && "!text-primary"
                }`}
              >
                {menuItem.title}
              </Link>
            </li>
          ) : (
            <li className="submenu-item group relative" key={index}>
              <button
                onClick={() => handleSubmenu(index)}
                className={getSubmenuButtonClasses(pathUrl === "/")}
              >
                {menuItem.title}
                {renderDropdownIcon()}
              </button>

              <div
                className={`submenu relative left-0 top-full w-[250px] rounded-sm bg-white p-4 transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark-2 lg:invisible lg:absolute lg:top-[110%] lg:block lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                  openIndex === index ? "!-left-[25px]" : "hidden"
                }`}
              >
                {menuItem?.submenu?.map((submenuItem: any, i: number) => (
                  <Link
                    href={submenuItem.path}
                    key={i}
                    className={`block rounded px-4 py-[10px] text-sm ${
                      pathUrl === submenuItem.path
                        ? "text-primary"
                        : "text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary"
                    }`}
                  >
                    {submenuItem.title}
                  </Link>
                ))}
              </div>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
};