"use client";
import { useSupabase } from '@/lib/supabase/hooks/use-supabase';

import { HeaderLogo } from "./header-logo";
import { MobileMenuButton } from "./mobile-menu-button";
import { NavigationMenu } from "./navigation-menu";
import { HeaderAuthSection } from "./header-auth-section";
import { useHeaderState } from "./use-header-state";
import menuData from "./menuData";

const Header = () => {
  const { user } = useSupabase();
  const {
    navbarOpen,
    sticky,
    openIndex,
    navbarToggleHandler,
    handleSubmenu,
  } = useHeaderState();

  return (
    <header
      role="banner"
      className={`ud-header left-0 top-0 z-40 flex w-full items-center ${
        sticky
          ? "shadow-nav fixed z-[999] border-b border-stroke bg-white/80 backdrop-blur-[5px] dark:border-dark-3/20 dark:bg-dark/10"
          : "absolute bg-transparent"
      }`}
    >
      <div className="container">
        <div className="relative -mx-4 flex items-center justify-between">
          <HeaderLogo sticky={sticky} />
          
          <div className="flex w-full items-center justify-between px-4">
            <div>
              <MobileMenuButton
                navbarOpen={navbarOpen}
                navbarToggleHandler={navbarToggleHandler}
                sticky={sticky}
              />
              
              <NavigationMenu
                menuData={menuData}
                navbarOpen={navbarOpen}
                navbarToggleHandler={navbarToggleHandler}
                sticky={sticky}
                openIndex={openIndex}
                handleSubmenu={handleSubmenu}
              />
            </div>
            
            <HeaderAuthSection user={user} sticky={sticky} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;