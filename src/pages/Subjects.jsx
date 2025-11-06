import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Edit2, Trash2, Search, X, Menu, Users } from "lucide-react";
import { supabase } from "../lib/supabase"; // Make sure supabase client is initialized

function Subjects() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentSubject, setCurrentSubject] = useState({
    id: null,
    subject_code: "",
    subject_name: "",
    instructor: "",
  });

  // Fetch subjects and students on mount
  useEffect(() => {
    fetchSubjects();
    fetchAllStudents();
  }, []);

  // Fetch all subjects
  async function fetchSubjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error("Error fetching subjects:", error.message);
    else setSubjects(data || []);
    setLoading(false);
  }

  // Fetch all students
  async function fetchAllStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("id, first_name, last_name");
    if (error) console.error("Error fetching students:", error.message);
    else setStudents(data || []);
  }

  // Fetch enrolled students for a subject
  async function fetchEnrolledStudents(subjectId) {
    if (!subjectId) return;
    const { data, error } = await supabase
      .from("subject_students")
      .select("student_id, students(id, first_name, last_name)")
      .eq("subject_id", subjectId);
    if (error) console.error("Error fetching enrolled students:", error.message);
    else setEnrolledStudents(data.map(row => row.students).filter(Boolean));
  }

  // Save or update subject
  async function handleSave() {
    if (!currentSubject.subject_code || !currentSubject.subject_name) {
      alert("Please fill in all required fields");
      return;
    }

    if (isEditing) {
      const { error } = await supabase
        .from("subjects")
        .update({
          subject_code: currentSubject.subject_code,
          subject_name: currentSubject.subject_name,
          instructor: currentSubject.instructor,
        })
        .eq("id", currentSubject.id);

      if (error) return alert("Failed to update subject: " + error.message);
      alert("Subject updated successfully!");
    } else {
      const { data: newSubject, error: insertError } = await supabase
        .from("subjects")
        .insert([{
          subject_code: currentSubject.subject_code,
          subject_name: currentSubject.subject_name,
          instructor: currentSubject.instructor,
        }])
        .select()
        .single();

      if (insertError) return alert("Failed to add subject: " + insertError.message);

      // Optionally enroll all students automatically
      if (students.length > 0) {
        const enrollments = students.map(s => ({
          subject_id: newSubject.id,
          student_id: s.id
        }));
        const { error: enrollError } = await supabase.from("subject_students").insert(enrollments);
        if (enrollError) console.error("Error enrolling students:", enrollError.message);
      }

      alert("New subject added!");
    }

    setIsModalOpen(false);
    setCurrentSubject({ subject_code: "", subject_name: "", instructor: "" });
    setIsEditing(false);
    fetchSubjects();
  }

  const handleEditSubject = (subject) => {
    setIsEditing(true);
    setCurrentSubject(subject);
    setIsModalOpen(true);
  };

  const handleAddSubject = () => {
    setIsEditing(false);
    setCurrentSubject({ subject_code: "", subject_name: "", instructor: "" });
    setIsModalOpen(true);
  };

  const handleDeleteSubject = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this subject?")) {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) alert("Failed to delete subject: " + error.message);
      else fetchSubjects();
    }
  };

  const handleViewStudents = async (subject) => {
    setSelectedSubject(subject);
    await fetchEnrolledStudents(subject.id);
    setShowStudentsModal(true);
  };

  const handleAddStudentToSubject = async (studentId) => {
    if (!selectedSubject?.id) return;
    const { error } = await supabase.from("subject_students").insert([{
      subject_id: selectedSubject.id,
      student_id: studentId
    }]);
    if (error) alert("Failed to add student: " + error.message);
    else fetchEnrolledStudents(selectedSubject.id);
  };

  const handleRemoveStudentFromSubject = async (studentId) => {
    if (!selectedSubject?.id) return;
    const { error } = await supabase
      .from("subject_students")
      .delete()
      .eq("subject_id", selectedSubject.id)
      .eq("student_id", studentId);
    if (error) alert(error.message);
    else fetchEnrolledStudents(selectedSubject.id);
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio
          </span>
          <div className="hidden md:flex space-x-6 text-gray-300">
            <a href="/" className="hover:text-purple-400">Home</a>
            <a href="/students" className="hover:text-purple-400">Students</a>
            <a href="/subjects" className="text-purple-400">Subjects</a>
            <a href="/grades" className="hover:text-purple-400">Grades</a>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300 hover:text-purple-400">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-purple-400" size={40} />
          <h1 className="text-4xl font-bold text-white">Subjects Management</h1>
        </div>

        {/* Search + Add */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleAddSubject}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus size={20} /> Add Subject
          </button>
        </div>

        {/* Subjects Table */}
        <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading subjects...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No subjects found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-900/50 text-purple-400">
                <tr>
                  <th className="px-6 py-4 text-left">Code</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Instructor</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-3 text-white">{subject.subject_code}</td>
                    <td className="px-6 py-3 text-white">{subject.subject_name}</td>
                    <td className="px-6 py-3 text-gray-400">{subject.instructor}</td>
                    <td className="px-6 py-3 text-center space-x-2">
                      <button onClick={() => handleViewStudents(subject)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                        <Users size={16} />
                      </button>
                      <button onClick={() => handleEditSubject(subject)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteSubject(subject.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setIsModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-purple-500/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Edit Subject" : "Add New Subject"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-purple-400 mb-2">Subject Code *</label>
                <input
                  type="text"
                  value={currentSubject.subject_code}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, subject_code: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., CS101"
                />
              </div>

              <div>
                <label className="block text-purple-400 mb-2">Subject Name *</label>
                <input
                  type="text"
                  value={currentSubject.subject_name}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, subject_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Introduction to Programming"
                />
              </div>

              <div>
                <label className="block text-purple-400 mb-2">Instructor</label>
                <input
                  type="text"
                  value={currentSubject.instructor}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, instructor: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Dr. Smith"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600"
                >
                  {isEditing ? "Update" : "Add"} Subject
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowStudentsModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-slate-800 p-6 rounded-lg w-full max-w-3xl border border-purple-500/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Students in {selectedSubject?.subject_name}
              </h2>
              <button onClick={() => setShowStudentsModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-white">
              <div>
                <h3 className="text-purple-400 mb-2">Enrolled Students</h3>
                <ul className="bg-slate-700 rounded-lg p-3 max-h-80 overflow-y-auto">
                  {enrolledStudents.length > 0 ? (
                    enrolledStudents.map((s) => (
                      <li key={s.id} className="flex justify-between items-center py-1">
                        {s.first_name} {s.last_name}
                        <button
                          onClick={() => handleRemoveStudentFromSubject(s.id)}
                          className="text-red-400 hover:text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No students enrolled yet.</p>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-pink-400 mb-2">All Students</h3>
                <ul className="bg-slate-700 rounded-lg p-3 max-h-80 overflow-y-auto">
                  {students.map((s) => (
                    <li key={s.id} className="flex justify-between items-center py-1">
                      {s.first_name} {s.last_name}
                      <button
                        onClick={() => handleAddStudentToSubject(s.id)}
                        className="text-green-400 hover:text-green-500 text-sm"
                        disabled={enrolledStudents.find(es => es.id === s.id)}
                      >
                        {enrolledStudents.find(es => es.id === s.id) ? "Enrolled" : "Add"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjects;