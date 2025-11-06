import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { UserPlus, Edit2, Trash2, Search, X, Users, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/AuthProvider"; // ✅ import your auth context

function Students() {
  const { user, loading } = useAuth(); // get current user
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStudent, setCurrentStudent] = useState({
    id: null,
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    year_level: "1st Year",
    course: "BSIT",
  });

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const courses = ["BSIT", "BSCS", "BSIS", "BSEMC"];

  // ✅ Fetch all students from Supabase
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error("Error fetching students:", error);
    else setStudents(data || []);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Redirect based on auth & role
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/signup"); // not logged in
      } else if (user.user_metadata?.role?.toLowerCase() === "user") {
        navigate("/portal"); // regular user
      }
      // admins stay on /students
    }
  }, [user, loading, navigate]);

  // ✅ Add/Update student
  const handleSave = async () => {
    const { student_id, first_name, last_name, email, phone, year_level, course } = currentStudent;
    if (!student_id || !first_name || !last_name || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isEditing) {
      const { error } = await supabase
        .from("students")
        .update({ student_id, first_name, last_name, email, phone, year_level, course })
        .eq("id", currentStudent.id);
      if (error) console.error("Error updating student:", error);
    } else {
      const { error } = await supabase
        .from("students")
        .insert([{ student_id, first_name, last_name, email, phone, year_level, course }]);
      if (error) console.error("Error adding student:", error);
    }

    setIsModalOpen(false);
    fetchStudents();
  };

  // ✅ Delete student
  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) console.error("Error deleting student:", error);
    fetchStudents();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    setIsEditing(false);
    setCurrentStudent({
      id: null,
      student_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      year_level: "1st Year",
      course: "BSIT",
    });
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setIsEditing(true);
    setCurrentStudent(student);
    setIsModalOpen(true);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio
          </span>
          <div className="hidden md:flex space-x-6">
            <a href="/landing" className="text-gray-300 hover:text-purple-400">Home</a>
            <a href="/students" className="text-gray-300 hover:text-purple-400">Students</a>
            <a href="/subjects" className="text-gray-300 hover:text-purple-400">Subjects</a>
            <a href="/grades" className="text-gray-300 hover:text-purple-400">Grades</a>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-white font-bold flex items-center gap-3">
            <Users className="text-purple-400" /> Students Management
          </h1>
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            <UserPlus size={18} /> Add Student
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-purple-500/20">
          <table className="w-full text-gray-300">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-purple-400">Student ID</th>
                <th className="px-6 py-3 text-left text-purple-400">Name</th>
                <th className="px-6 py-3 text-left text-purple-400">Email</th>
                <th className="px-6 py-3 text-left text-purple-400">Phone</th>
                <th className="px-6 py-3 text-left text-purple-400">Year Level</th>
                <th className="px-6 py-3 text-left text-purple-400">Course</th>
                <th className="px-6 py-3 text-center text-purple-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-3">{student.student_id}</td>
                  <td className="px-6 py-3 text-white">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-6 py-3">{student.email}</td>
                  <td className="px-6 py-3">{student.phone}</td>
                  <td className="px-6 py-3">{student.year_level}</td>
                  <td className="px-6 py-3">{student.course}</td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => handleEditStudent(student)} className="text-blue-400 mx-2">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-400 mx-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-10 text-gray-400">No students found</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-purple-500/20">
            <div className="flex justify-between mb-4">
              <h2 className="text-white font-bold text-xl">
                {isEditing ? "Edit Student" : "Add Student"}
              </h2>
              <X className="text-gray-400 cursor-pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            <div className="space-y-3">
              {["student_id", "first_name", "last_name", "email", "phone"].map((field) => (
                <input
                  key={field}
                  type="text"
                  value={currentStudent[field]}
                  onChange={(e) => setCurrentStudent({ ...currentStudent, [field]: e.target.value })}
                  placeholder={field.replace("_", " ").toUpperCase()}
                  className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white"
                />
              ))}
              <select
                value={currentStudent.year_level}
                onChange={(e) => setCurrentStudent({ ...currentStudent, year_level: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white"
              >
                {yearLevels.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <select
                value={currentStudent.course}
                onChange={(e) => setCurrentStudent({ ...currentStudent, course: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white"
              >
                {courses.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleSave}
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
              >
                {isEditing ? "Update Student" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
