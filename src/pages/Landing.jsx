import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // ✅ Add this
import { Menu, X, Code, BookOpen, Award, Users, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import image from "../assets/image.jpg";

function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    students: 0,
    subjects: 0,
    grades: 0,
  });
  const navigate = useNavigate(); // ✅ Initialize navigate

  // ✅ Fetch data from Supabase
  useEffect(() => {
    async function fetchCounts() {
      try {
        const [
          { count: studentCount },
          { count: subjectCount },
          { count: gradeCount },
        ] = await Promise.all([
          supabase.from("students").select("*", { count: "exact", head: true }),
          supabase.from("subjects").select("*", { count: "exact", head: true }),
          supabase.from("grades").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          students: studentCount || 0,
          subjects: subjectCount || 0,
          grades: gradeCount || 0,
        });
      } catch (err) {
        console.error("❌ Error fetching data:", err.message);
      }
    }

    fetchCounts();
  }, []);

  // ✅ Logout handler
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ Logout failed:", error.message);
      return;
    }
    navigate("/signup"); // ✅ Redirect to login page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Portfolio
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/landing"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </a>
              <a
                href="/students"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Students
              </a>
              <a
                href="/subjects"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Subjects
              </a>
              <a
                href="/grades"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Grades
              </a>

              {/* ✅ Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-300 hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-purple-400"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="/landing"
                className="text-gray-300 hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </a>
              <a
                href="/students"
                className="text-gray-300 hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium"
              >
                Students
              </a>
              <a
                href="/subjects"
                className="text-gray-300 hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium"
              >
                Subjects
              </a>
              <a
                href="/grades"
                className="text-gray-300 hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium"
              >
                Grades
              </a>

              {/* ✅ Mobile Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 text-red-400 px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800 transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="relative">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1 shadow-2xl shadow-purple-500/50">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={image} alt="Profile" />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Beverly Salde
              </h1>
              <p className="text-2xl md:text-3xl text-purple-400 mb-6">
                IT Student & Developer
              </p>
              <p className="text-lg text-gray-300 max-w-2xl">
                Passionate about technology, problem-solving, and creating
                innovative solutions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Current Overview
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500 transition">
              <Users size={48} className="text-purple-400 mx-auto mb-3" />
              <h3 className="text-3xl text-white font-bold">
                {stats.students}
              </h3>
              <p className="text-gray-400">Total Students</p>
            </div>

            <div className="bg-slate-800/60 p-8 rounded-2xl border border-pink-500/20 hover:border-pink-500 transition">
              <BookOpen size={48} className="text-pink-400 mx-auto mb-3" />
              <h3 className="text-3xl text-white font-bold">
                {stats.subjects}
              </h3>
              <p className="text-gray-400">Total Subjects</p>
            </div>

            <div className="bg-slate-800/60 p-8 rounded-2xl border border-blue-500/20 hover:border-blue-500 transition">
              <Award size={48} className="text-blue-400 mx-auto mb-3" />
              <h3 className="text-3xl text-white font-bold">{stats.grades}</h3>
              <p className="text-gray-400">Total Grades Recorded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2025 Beverly Salde. Built with React & Supabase</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
