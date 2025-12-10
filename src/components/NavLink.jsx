import { Link } from "react-router-dom";

export default function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-gray-100 hover:text-blue-400 transition-colors font-light text-base sm:text-2xl tracking-wide relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full focus:outline-none focus:text-blue-400 focus:after:w-full rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      {children}
    </Link>
  );
}
