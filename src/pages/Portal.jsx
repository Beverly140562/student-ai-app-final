import React, { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import {
  GraduationCap,
  BookOpen,
  Award,
  LogOut,
  User,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function Portal() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [studentInfo, setStudentInfo] = useState(null);
  const [grades, setGrades] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/signup", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.user_metadata?.role === "ADMIN")
      navigate("/students", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchStudentData();
  }, [user]);

  async function fetchStudentData() {
    setDataLoading(true);
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, first_name, last_name, year_level, email")
        .eq("email", user.email)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) {
        console.warn("⚠️ No student record found for:", user.email);
        setStudentInfo(null);
        setGrades([]);
        setDataLoading(false);
        return;
      }

      const fullName = `${studentData.first_name || ""} ${
        studentData.last_name || ""
      }`.trim();
      setStudentInfo({ ...studentData, name: fullName });

      const { data: gradeData, error: gradeError} = await supabase
        .from("grades")
        .select(
          `
          id,
          prelim,
          midterm,
          semifinal,
          final,
          subjects:subject_id (
            subject_name,
            subject_code
          )
        `
        )
        .eq("student_id", studentData.id);

      if (gradeError) throw gradeError;
      setGrades(gradeData || []);
    } catch (err) {
      console.error("❌ Error fetching data:", err.message);
    } finally {
      setDataLoading(false);
    }
  }

  const computeAverage = (g) => {
    if (
      g.prelim == null ||
      g.midterm == null ||
      g.semifinal == null ||
      g.final == null
    )
      return null;
    return ((g.prelim + g.midterm + g.semifinal + g.final) / 4).toFixed(2);
  };

  const getRemarks = (g) => {
    const avg = computeAverage(g);
    if (avg === null) return "Incomplete";
    return parseFloat(avg) >= 75 ? "Passed" : "Failed";
  };

  const calculateGPA = () => {
    if (grades.length === 0) return "N/A";
    const validGrades = grades.filter((g) => computeAverage(g) !== null);
    if (validGrades.length === 0) return "N/A";
    const total = validGrades.reduce(
      (sum, g) => sum + parseFloat(computeAverage(g)),
      0
    );
    return (total / validGrades.length).toFixed(2);
  };

  const getPassedCount = () => {
    return grades.filter((g) => getRemarks(g) === "Passed").length;
  };

  const getAverageColor = (avg) => {
    if (avg === null) return "text-gray-400";
    const score = parseFloat(avg);
    if (score >= 90) return "text-emerald-600 font-bold";
    if (score >= 85) return "text-green-600 font-semibold";
    if (score >= 80) return "text-blue-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600 font-semibold";
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute w-20 h-20 border-4 border-violet-200 rounded-full"></div>
            <div className="absolute w-20 h-20 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg mt-6 font-medium">
            Loading your academic journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Floating Header with Glass Effect */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white border-opacity-40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400 to-fuchsia-400 opacity-20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400 to-blue-400 opacity-20 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {studentInfo?.name || "Student"}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{user?.email}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-500 font-medium">
                    Active Student
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all shadow-lg font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Animated Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 opacity-80" />
              <div className="w-12 h-12 bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">
                  {studentInfo?.year_level || "?"}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Year Level</p>
            <p className="text-xs opacity-75 mt-1">Current academic year</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-8 h-8 opacity-80" />
              <div className="w-12 h-12  bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{grades.length}</span>
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Total Subjects</p>
            <p className="text-xs opacity-75 mt-1">Enrolled this semester</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-8 h-8 opacity-80" />
              <div className="w-12 h-12  bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{calculateGPA()}</span>
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Overall GPA</p>
            <p className="text-xs opacity-75 mt-1">Average performance</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="w-12 h-12  bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">
                  {getPassedCount()}/{grades.length}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Passed Subjects</p>
            <p className="text-xs opacity-75 mt-1">Success rate tracking</p>
          </div>
        </div>

        {/* Modern Grades Table */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white border-opacity-40">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Academic Performance
              </h2>
              <p className="text-sm text-gray-500">
                Detailed breakdown of your grades
              </p>
            </div>
          </div>

          {grades.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                      <th className="p-4 text-left font-semibold">Code</th>
                      <th className="p-4 text-left font-semibold">Subject Name</th>
                      <th className="p-4 text-center font-semibold">Prelim</th>
                      <th className="p-4 text-center font-semibold">Midterm</th>
                      <th className="p-4 text-center font-semibold">Semifinal</th>
                      <th className="p-4 text-center font-semibold">Final</th>
                      <th className="p-4 text-center font-semibold">Average</th>
                      <th className="p-4 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {grades.map((g, idx) => {
                      const avg = computeAverage(g);
                      const remarks = getRemarks(g);
                      return (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 transition-colors"
                        >
                          <td className="p-4 font-mono text-sm font-semibold text-violet-600">
                            {g.subjects?.subject_code || "N/A"}
                          </td>
                          <td className="p-4 font-medium text-gray-800">
                            {g.subjects?.subject_name || "Unknown"}
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {g.prelim ?? "—"}
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {g.midterm ?? "—"}
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {g.semifinal ?? "—"}
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {g.final ?? "—"}
                          </td>
                          <td className={`p-4 text-center text-lg ${getAverageColor(avg)}`}>
                            {avg ?? "—"}
                          </td>
                          <td className="p-4 text-center">
                            {remarks === "Passed" ? (
                              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                <CheckCircle className="w-4 h-4" />
                                Passed
                              </div>
                            ) : remarks === "Failed" ? (
                              <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                <XCircle className="w-4 h-4" />
                                Failed
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                                Incomplete
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-violet-400" />
              </div>
              <p className="text-gray-600 text-xl font-semibold mb-2">
                No grades recorded yet
              </p>
              <p className="text-gray-400">
                Your academic records will appear here once grades are posted
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}