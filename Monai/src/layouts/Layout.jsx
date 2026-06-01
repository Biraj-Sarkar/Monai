import Navbar from "../home/Navbar";
import Footer from "../home/Footer";
import { Outlet } from "react-router";
import ScrollToTop from "../common/ScrollToTop";

export default function Layout() {
  return (
    <div 
      className="app-page-bg relative min-h-screen overflow-hidden 
        text-slate-950 
        before:pointer-events-none before:fixed 
        before:-right-32 before:-top-32 before:-z-10 before:h-128 before:w-lg 
        before:rounded-full before:bg-violet-500/20 before:blur-3xl 
        after:pointer-events-none after:fixed 
        after:-bottom-32 after:-left-32 after:-z-10 after:h-128 after:w-lg 
        after:rounded-full after:bg-cyan-400/20 after:blur-3xl"
    >
      <Navbar />
      <ScrollToTop />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}