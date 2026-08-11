import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  header: { fontSize: 24, marginBottom: 20, textAlign: "center", fontWeight: "bold" },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { fontSize: 12, color: "#666" },
  value: { fontSize: 12, fontWeight: "bold" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingTop: 10, borderTop: "1pt solid #ccc" },
  totalLabel: { fontSize: 14, fontWeight: "bold" },
  totalValue: { fontSize: 14, fontWeight: "bold", color: "#10b981" },
});

export const PayslipPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>PAYSLIP</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Employee Name:</Text>
          <Text style={styles.value}>{data.employeeName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Department:</Text>
          <Text style={styles.value}>{data.department}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{data.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Base Salary:</Text>
          <Text style={styles.value}>${data.baseSalary}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bonus:</Text>
          <Text style={styles.value}>+${data.bonus}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Deductions:</Text>
          <Text style={styles.value}>-${data.deductions}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Net Pay:</Text>
          <Text style={styles.totalValue}>${data.netPay}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
