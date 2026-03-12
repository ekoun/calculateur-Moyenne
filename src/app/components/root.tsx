import * as React from "react";
import { Outlet, Link, useLocation, useNavigation } from "react-router";
import { Moon, Sun, Calculator, BookOpen, GraduationCap, History } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import logo from "../../imports/Group_135.svg";
import logoMC from "../../imports/Group 169.svg";
import { LoadingPage } from "./loading-page";

const navItems = [
  { path: "/", label: "ECUE", icon: Calculator },
  { path: "/ue", label: "UE", icon: BookOpen },
  { path: "/semestre", label: "Semestre", icon: GraduationCap },
  { path: "/historique", label: "Historique", icon: History },
];

export function Root() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navigation = useNavigation();
  // Test forcé : montrez toujours le loading pendant 500ms lors d'une navigation
  const [showLoadingTest, setShowLoadingTest] = React.useState(false);
  
  React.useEffect(() => {
    if (navigation.state === "loading" || navigation.state === "submitting") {
      setShowLoadingTest(true);
    } else {
      const timer = setTimeout(() => setShowLoadingTest(false), 500);
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  const isNavLoading = showLoadingTest;

  return (
    <>
      {isNavLoading && <LoadingPage />}
      <div className="flex min-h-screen bg-background">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex fixed top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex-col shadow-xl z-50">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoMC} alt="CM" className="h-12 w-12" />
            <img src={logo} alt="REATD" className="h-12 w-auto" />
          </Link>
          <div className="mt-3 flex flex-col">
            <span className="text-2xl font-bold text-primary">CM - REATD</span>
            <span className="text-xs text-muted-foreground tracking-wide">Calculateur de Moyennes</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div key={item.path} whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 relative overflow-hidden ${
                    active
                      ? "text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="desktopActiveNav"
                      className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/25"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="h-5 w-5 relative z-10 shrink-0" />
                  <span className="font-medium relative z-10">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-sidebar-border">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <Sun className="h-5 w-5 shrink-0" />
                  <span className="font-medium">Mode Clair</span>
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <Moon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">Mode Sombre</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">© 2026 REATD – UVCI</p>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-card/80 backdrop-blur-xl border-b border-border z-50 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoMC} alt="CM" className="h-8 w-8" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-primary">CM - REATD</span>
              <span className="text-[10px] text-muted-foreground">Calculateur de Moyennes</span>
            </div>
          </Link>

          <motion.button
            whileTap={{ scale: 0.88, rotate: 15 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl hover:bg-muted transition-colors"
            aria-label="Changer de thème"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64">
        <div className="min-h-screen pt-[60px] lg:pt-0 pb-24 lg:pb-0 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/85 backdrop-blur-xl border-t border-border z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch justify-around px-2 pt-1 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 relative min-w-0"
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute top-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className={`p-2 rounded-xl transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span
                  className={`text-[10px] font-semibold transition-colors truncate ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── End of Main Content ── */}
    </div>
    </>
  );
}
