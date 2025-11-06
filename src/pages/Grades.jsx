import React, { useState, useEffect } from "react";
import { Award, Save, Sparkles, Menu, X } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import StudentReportDocument from "../pdfTemplates/StudentReportDocument";
import { studentsAnalyzer } from "../lib/ai";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";

function Grades() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Fetch all subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("subject_name", { ascending: true });
      if (error) console.error("Error loading subjects:", error);
      else setSubjects(data || []);
    };
    fetchSubjects();
  }, []);

  // Fetch enrolled students for a subject
  const fetchEnrolledStudents = async (subjectId) => {
    if (!subjectId) return [];
    const { data, error } = await supabase
      .from("subject_students")
      .select(`
        student_id,
        students(student_id, first_name, last_name)
      `)
      .eq("subject_id", subjectId);

    if (error) {
      console.error("Error fetching enrolled students:", error);
      return [];
    }

    return data
      .map((s) => ({
        student_id: s.students?.student_id,
        name: `${s.students?.first_name || ""} ${s.students?.last_name || ""}`.trim(),
      }))
      .filter((s) => s.student_id);
  };

  // Fetch grades for a subject
  const fetchGrades = async (subjectId) => {
    if (!subjectId) return [];
    const { data, error } = await supabase
      .from("grades")
      .select(`
        id,
        subject_id,
        student_id,
        prelim,
        midterm,
        semifinal,
        final,
        students(student_id, first_name, last_name)
      `)
      .eq("subject_id", subjectId);

    if (error) {
      console.error("Error loading grades:", error);
      return [];
    }

    return data.map((g) => ({
      id: g.id,
      student_id: g.students?.student_id,
      name: `${g.students?.first_name || ""} ${g.students?.last_name || ""}`.trim(),
      prelim: g.prelim ?? 0,
      midterm: g.midterm ?? 0,
      semifinal: g.semifinal ?? 0,
      final: g.final ?? 0,
    }));
  };

  // Load students + grades when subject changes
  useEffect(() => {
    if (!selectedSubject) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const enrolled = await fetchEnrolledStudents(selectedSubject);
        const grades = await fetchGrades(selectedSubject);

        const merged = enrolled.map((student) => {
          const existing = grades.find((g) => g.student_id === student.student_id);
          return existing || {
            id: null,
            student_id: student.student_id,
            name: student.name,
            prelim: 0,
            midterm: 0,
            semifinal: 0,
            final: 0,
          };
        });

        setStudents(merged);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSubject]);

  // Handle grade input changes
  const handleGradeChange = (studentId, term, value) => {
    const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, [term]: numValue } : s))
    );
  };

  // Save grades
  const handleSaveGrades = async () => {
    if (!selectedSubject) return;
    setSaving(true);

    try {
      const updates = students.filter((s) => s.id);
      const inserts = students.filter((s) => !s.id);

      // Update existing grades
      for (const s of updates) {
        const { error } = await supabase
          .from("grades")
          .update({
            prelim: s.prelim,
            midterm: s.midterm,
            semifinal: s.semifinal,
            final: s.final,
          })
          .eq("id", s.id);

        if (error) throw error;
      }

      // Insert new grades
      if (inserts.length) {
        const insertPayload = inserts.map((s) => ({
          subject_id: selectedSubject,
          student_id: s.student_id,
          prelim: s.prelim,
          midterm: s.midterm,
          semifinal: s.semifinal,
          final: s.final,
        }));

        const { error } = await supabase.from("grades").insert(insertPayload);
        if (error) throw error;
      }

      alert("✅ Grades saved successfully!");
      const refreshed = await fetchGrades(selectedSubject);
      setStudents(refreshed);
    } catch (err) {
      console.error("Error saving grades:", err);
      alert("❌ Failed to save grades. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  // Average & status
  const calculateAverage = ({ prelim, midterm, semifinal, final }) =>
    ((prelim + midterm + semifinal + final) / 4).toFixed(2);

  const getGradeStatus = (avg) => {
    if (avg >= 90) return { label: "Excellent", color: "text-green-400 bg-green-500/20" };
    if (avg >= 80) return { label: "Good", color: "text-blue-400 bg-blue-500/20" };
    if (avg >= 75) return { label: "Passed", color: "text-yellow-400 bg-yellow-500/20" };
    return { label: "Failed", color: "text-red-400 bg-red-500/20" };
  };

  // AI report
const generateAIReport = async () => {
  if (!selectedSubject) return alert("Please select a subject first!");
  if (!students.length) return alert("No students found for this subject.");
  setIsAnalyzing(true);
  try {
    const report = await studentsAnalyzer(selectedSubject, students);
    setAiReport(report); // report.stats will be used in PDF
  } catch (err) {
    console.error("AI Analysis failed:", err);
  } finally {
    setIsAnalyzing(false);
  }
};

  // Class stats
  const stats = students.length
    ? (() => {
        const averages = students.map((s) => parseFloat(calculateAverage(s)));
        const classAvg = (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2);
        const highest = Math.max(...averages).toFixed(2);
        const lowest = Math.min(...averages).toFixed(2);
        const passed = averages.filter((a) => a >= 75).length;
        return { classAvg, highest, lowest, passed, total: averages.length };
      })()
    : null;

  const selectedSubjectName =
    subjects.find((s) => s.id === selectedSubject)?.subject_name || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio
          </span>
          <div className="hidden md:flex gap-6 text-gray-300">
            <a href="/landing" className="hover:text-purple-400">Home</a>
            <a href="/students" className="hover:text-purple-400">Students</a>
            <a href="/subjects" className="hover:text-purple-400">Subjects</a>
            <a href="/grades" className="text-purple-400">Grades</a>
          </div>
          <button className="md:hidden text-gray-300 hover:text-purple-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-6 flex items-center gap-3">
          <Award className="text-purple-400" /> Grades Management
        </h1>

        {/* Subject dropdown */}
        <div className="mb-6 bg-slate-800/50 p-6 rounded-xl border border-purple-500/20">
          <label className="block mb-2 text-gray-300">Select Subject</label>
          <div className="flex gap-4 items-center">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 rounded-lg border border-purple-500/20 text-white"
            >
              <option value="">-- Choose a subject --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
            <button
              onClick={generateAIReport}
              disabled={!selectedSubject || !students.length}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : <><Sparkles size={20}/> AI Analysis</>}
            </button>
          </div>
        </div>

        {/* Grades Table */}
        {loading ? (
          <p className="text-center text-gray-400">Loading students...</p>
        ) : selectedSubject && students.length > 0 ? (
          <>
            <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 text-purple-400">
                  <tr>
                    <th className="px-6 py-4 text-left">Student ID</th>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-center">Prelim</th>
                    <th className="px-6 py-4 text-center">Midterm</th>
                    <th className="px-6 py-4 text-center">Semifinal</th>
                    <th className="px-6 py-4 text-center">Final</th>
                    <th className="px-6 py-4 text-center">Average</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const avg = calculateAverage(s);
                    const status = getGradeStatus(parseFloat(avg));
                    return (
                      <tr key={s.student_id} className="hover:bg-slate-700/30">
                        <td className="px-6 py-3">{s.student_id}</td>
                        <td className="px-6 py-3">{s.name}</td>
                        {["prelim", "midterm", "semifinal", "final"].map((term) => (
                          <td key={term} className="px-6 py-3 text-center">
                            <input
                              type="number"
                              value={s[term]}
                              onChange={(e) =>
                                handleGradeChange(s.student_id, term, e.target.value)
                              }
                              className="w-20 px-2 py-1 bg-slate-700 text-center border border-purple-500/20 rounded text-white"
                            />
                          </td>
                        ))}
                        <td className="px-6 py-3 text-center text-purple-400 font-semibold">{avg}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full ${status.color}`}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleSaveGrades}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                <Save size={20}/> {saving ? "Saving..." : "Save Grades"}
              </button>

              {aiReport && (
                <PDFDownloadLink
  document={
    <StudentReportDocument
      subject={{
        name: selectedSubjectName || "Unknown Subject",
        code: subjects.find((s) => s.id === selectedSubject)?.subject_code || "N/A",
      }}
      stats={aiReport?.stats}
      students={aiReport?.students || students}
      aiInsights={aiReport?.insights}
    />
  }
  fileName={`Grades_Report_${selectedSubjectName || selectedSubject}.pdf`}
>

                  {({ loading }) => (
                    <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold">
                      {loading ? "Generating PDF..." : "Download PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 py-10">
            Please select a subject to view enrolled students.
          </p>
        )}
      </div>
    </div>
  );
}

export default Grades;
