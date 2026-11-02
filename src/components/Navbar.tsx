"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("emerald");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("booknook-theme") || "emerald";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "emerald" ? "night" : "emerald";
    setTheme(newTheme);
    localStorage.setItem("booknook-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push("/");
  };

  const user = session?.user;

  const navLinks = (
    <>
      <li>
        <Link href="/" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
          Home
        </Link>
      </li>
      <li>
        <Link href="/books" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
          All Books
        </Link>
      </li>
      {user && (
        <>
          <li>
            <Link href="/add-book" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
              Add Book
            </Link>
          </li>
          <li>
            <Link href="/my-books" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
              My Books
            </Link>
          </li>
          <li>
            <Link href="/my-borrows" className="hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
              My Borrows
            </Link>
          </li>
        </>
      )}
    </>
  );

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4 lg:px-8"
    >
      {/* Logo */}
      <div className="navbar-start">
        <div className="dropdown lg:hidden">
          <button
            className="btn btn-ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg"
              >
                {navLinks}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <Link href="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-2xl font-bold text-primary">BookNook</span>
        </Link>
      </div>

      {/* Center Links */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">{navLinks}</ul>
      </div>

      {/* Right Side */}
      <div className="navbar-end gap-2">
        {/* Theme Toggle */}
        <button className="btn btn-ghost btn-circle" onClick={toggleTheme} title="Toggle theme">
          {theme === "emerald" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        {isPending ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              className="btn btn-ghost btn-circle avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  alt={user.name || "User"}
                  src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=10b981&color=fff`}
                />
              </div>
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-base-100 rounded-xl shadow-xl border border-base-300 p-3 z-50"
                >
                  <div className="px-2 py-2 border-b border-base-300 mb-2">
                    <p className="font-semibold text-base-content">{user.name}</p>
                    <p className="text-sm text-base-content/60">{user.email}</p>
                  </div>
                  <ul className="menu menu-sm">
                    <li>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
            <Link href="/register" className="btn btn-outline btn-primary btn-sm hidden sm:flex">
              Register
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
