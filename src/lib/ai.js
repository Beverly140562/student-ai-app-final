import { GoogleGenAI } from "@google/genai";

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
export const genAI = new GoogleGenAI({ apiKey: geminiKey });

// lib/ai.js
export const studentsAnalyzer = async (subjectId, students = []) => {
  if (!students || !students.length) {
    return { message: "No students to analyze", stats: null, insights: [] };
  }

  // Compute averages and assign statuses
  const analyzedStudents = students.map((s) => {
    const average = ((s.prelim + s.midterm + s.semifinal + s.final) / 4).toFixed(2);
    let status = "Failed";
    if (average >= 90) status = "Excellent";
    else if (average >= 80) status = "Good";
    else if (average >= 75) status = "Passed";

    // Generate AI-style comment
    let comment = "";
    if (status === "Excellent") comment = "Outstanding performance! Keep up the great work.";
    else if (status === "Good") comment = "Good performance. With a bit more effort, you can excel!";
    else if (status === "Passed") comment = "You passed. Focus on improving weaker areas.";
    else comment = "Needs improvement. Consider extra practice and guidance.";

    return {
      ...s,
      average: parseFloat(average),
      status,
      comment,
    };
  });

  const averages = analyzedStudents.map((s) => s.average);
  const classAvg = (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2);
  const highest = Math.max(...averages).toFixed(2);
  const lowest = Math.min(...averages).toFixed(2);
  const passed = analyzedStudents.filter((s) => s.average >= 75).length;
  const failed = analyzedStudents.filter((s) => s.average < 75).length;

  // Class-level AI insight
  let classComment = "";
  if (classAvg >= 90) classComment = "The class performed exceptionally well overall!";
  else if (classAvg >= 80) classComment = "The class performance is good, with room for improvement.";
  else if (classAvg >= 75) classComment = "The class passed, but some students may need extra attention.";
  else classComment = "Class performance is below average; additional support recommended.";

  return {
    subjectId,
    stats: {
      total: students.length,
      classAvg,
      highest,
      lowest,
      passed,
      failed,
    },
    students: analyzedStudents,
    insights: {
      classComment,
    },
    message: `AI analysis complete for ${students.length} students.`,
  };
};
