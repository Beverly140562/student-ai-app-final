// StudentReportDocument.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f9fafb',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 12,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#e0e7ff',
    padding: 4,
  },
  tableCell: {
    flex: 1,
    padding: 4,
    borderBottom: '1px solid #d1d5db',
  },
  summary: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  listItem: {
    marginBottom: 2,
  },
  comment: {
    fontStyle: 'italic',
    marginTop: 2,
  },
});

const StudentReportDocument = ({ subject, stats, students, aiInsights }) => {
  const passedStudents = students.filter((s) => s.average >= 75);
  const failedStudents = students.filter((s) => s.average < 75);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Performance Report</Text>
          <Text style={styles.subtitle}>
            Subject: {subject.name} ({subject.code})
          </Text>
        </View>

        {/* Grades Table */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Student Grades</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Student ID</Text>
              <Text style={styles.tableCell}>Name</Text>
              <Text style={styles.tableCell}>Prelim</Text>
              <Text style={styles.tableCell}>Midterm</Text>
              <Text style={styles.tableCell}>Semifinal</Text>
              <Text style={styles.tableCell}>Final</Text>
              <Text style={styles.tableCell}>Average</Text>
              <Text style={styles.tableCell}>Comment</Text>
            </View>

            {students.map((student) => (
              <View key={student.student_id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{student.student_id}</Text>
                <Text style={styles.tableCell}>{student.name}</Text>
                <Text style={styles.tableCell}>{student.prelim}</Text>
                <Text style={styles.tableCell}>{student.midterm}</Text>
                <Text style={styles.tableCell}>{student.semifinal}</Text>
                <Text style={styles.tableCell}>{student.final}</Text>
                <Text style={styles.tableCell}>{student.average.toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.comment]}>{student.comment}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Class Summary</Text>
          <Text>Total Students: {stats.total}</Text>
          <Text>Passed: {stats.passed}</Text>
          <Text>Failed: {stats.failed}</Text>
          <Text>Class Average: {stats.classAvg}</Text>
          <Text>Highest: {stats.highest}</Text>
          <Text>Lowest: {stats.lowest}</Text>
          {aiInsights?.classComment && (
            <Text style={styles.comment}>AI Insight: {aiInsights.classComment}</Text>
          )}
        </View>

        {/* Passed Students */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Passed Students</Text>
          {passedStudents.length > 0 ? (
            passedStudents.map((s) => (
              <Text key={s.student_id} style={styles.listItem}>
                • {s.name} ({s.average.toFixed(2)}) — {s.comment}
              </Text>
            ))
          ) : (
            <Text>None</Text>
          )}
        </View>

        {/* Failed Students */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Failed Students</Text>
          {failedStudents.length > 0 ? (
            failedStudents.map((s) => (
              <Text key={s.student_id} style={styles.listItem}>
                • {s.name} ({s.average.toFixed(2)}) — {s.comment}
              </Text>
            ))
          ) : (
            <Text>None</Text>
          )}
        </View>

        {/* Overall AI Comment */}
        {aiInsights?.summary && (
          <View style={styles.section}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>AI Summary</Text>
            <Text style={styles.comment}>{aiInsights.summary}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default StudentReportDocument;
