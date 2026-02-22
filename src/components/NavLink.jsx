import { Link, useLocation } from "react-router-dom";

export default function NavLink({ to, icon, children }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col sm:flex-row items-center sm:gap-1.5 transition-colors font-semibold text-xs sm:text-2xl tracking-wide relative pb-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-blue-400 after:transition-all after:duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        isActive
          ? "text-blue-400 bg-blue-500/15 after:w-full"
          : "text-white hover:text-blue-400 after:w-0 hover:after:w-full focus:text-blue-400 focus:after:w-full"
      }`}
    >
      {icon && <span className="w-8 h-8 sm:w-5 sm:h-5">{icon}</span>}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}
