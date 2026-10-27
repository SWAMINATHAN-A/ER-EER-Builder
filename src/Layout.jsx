import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

export default function Layout() {
  return (
    <div
      id="app-layout"
      className="h-screen overflow-hidden bg-[#F5F5F7] text-zinc-900 dark:bg-[#000000] dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200"
    >
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
