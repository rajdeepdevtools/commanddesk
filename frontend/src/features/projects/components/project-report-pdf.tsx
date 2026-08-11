import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { borderBottomWidth: 2, borderBottomColor: '#4F46E5', paddingBottom: 15, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 5 },
  
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5', marginBottom: 10, textTransform: 'uppercase' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  gridItem: { width: '50%', marginBottom: 10 },
  label: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase' },
  value: { fontSize: 12, color: '#1f2937', fontWeight: 'bold', marginTop: 2 },
  
  table: { width: '100%', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderRadius: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 8 },
  col1: { width: '40%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  colText: { fontSize: 10, color: '#4b5563' },
  colHeader: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 },
  footerText: { fontSize: 8, color: '#9ca3af' }
});

export const ProjectReportDocument = ({ project }: any) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return '#10b981';
      case 'ACTIVE': return '#3b82f6';
      case 'ON_HOLD': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{project.name}</Text>
          <Text style={styles.subtitle}>Project Executive Summary Report</Text>
        </View>

        {/* Overview Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: getStatusColor(project.status) }]}>{project.status}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Project Lead</Text>
              <Text style={styles.value}>{project.lead?.firstName} {project.lead?.lastName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Start Date</Text>
              <Text style={styles.value}>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Deadline</Text>
              <Text style={styles.value}>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</Text>
            </View>
          </View>
          
          <Text style={styles.label}>Description</Text>
          <Text style={[styles.value, { fontSize: 11, fontWeight: 'normal', marginTop: 4, lineHeight: 1.4 }]}>
            {project.description || 'No description provided.'}
          </Text>
        </View>

        {/* Financials & Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget & Hours</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Allocated Budget</Text>
              <Text style={styles.value}>₹{project.budget?.toLocaleString() || '0'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Estimated Hours</Text>
              <Text style={styles.value}>{project.estimatedHours || '0'} hrs</Text>
            </View>
          </View>
        </View>

        {/* Tasks Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.col1}><Text style={styles.colHeader}>Task Name</Text></View>
              <View style={styles.col2}><Text style={styles.colHeader}>Assignee</Text></View>
              <View style={styles.col3}><Text style={styles.colHeader}>Priority</Text></View>
              <View style={styles.col4}><Text style={styles.colHeader}>Status</Text></View>
            </View>
            
            {project.tasks?.length > 0 ? project.tasks.map((task: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.col1}><Text style={styles.colText}>{task.title}</Text></View>
                <View style={styles.col2}><Text style={styles.colText}>{task.assignee?.firstName || 'Unassigned'}</Text></View>
                <View style={styles.col3}><Text style={styles.colText}>{task.priority}</Text></View>
                <View style={styles.col4}><Text style={styles.colText}>{task.status}</Text></View>
              </View>
            )) : (
              <View style={{ padding: 10 }}><Text style={styles.colText}>No tasks found for this project.</Text></View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by CommandDesk on {new Date().toLocaleString()}</Text>
        </View>
        
      </Page>
    </Document>
  );
};
