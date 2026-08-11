import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e1b4b", // midnight-navy
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#f8fafc",
    padding: 6,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  col: {
    flex: 1,
  },
  label: {
    color: "#64748b",
  },
  value: {
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
  },
  colLeft: {
    flex: 2,
  },
  colRight: {
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#000",
    paddingTop: 5,
    marginTop: 5,
    fontWeight: "bold",
  },
  netSalaryBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  netSalaryLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  netSalaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e1b4b",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
});

interface PayslipPDFProps {
  payroll: any;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function PayslipPDF({ payroll }: PayslipPDFProps) {
  const company = payroll.user.company || { name: "Company Name", address: "Company Address" };
  const employee = payroll.user;
  const profile = payroll.user.employeeProfile || {};

  const totalEarnings = payroll.basicSalary + (payroll.hra || 0) + (payroll.da || 0) + (payroll.bonus || 0);
  const totalDeductions = (payroll.tax || 0) + (payroll.pf || 0) + (payroll.esi || 0) + (payroll.deductions || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{company.name}</Text>
            {company.address && <Text style={{ marginTop: 5, color: "#666" }}>{company.address}</Text>}
            {company.gst && <Text style={{ marginTop: 2, color: "#666" }}>GST: {company.gst}</Text>}
          </View>
          <View>
            <Text style={styles.title}>PAYSLIP</Text>
            <Text style={{ marginTop: 5, textAlign: "right" }}>
              For {months[payroll.month - 1]} {payroll.year}
            </Text>
            <Text style={{ marginTop: 2, textAlign: "right", color: "#666" }}>
              Generated: {new Date(payroll.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Employee Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Details</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{employee.firstName} {employee.lastName}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Employee ID:</Text>
              <Text style={styles.value}>{profile.employeeId || employee.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Designation:</Text>
              <Text style={styles.value}>{profile.designation || "Employee"}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>PAN Number:</Text>
              <Text style={styles.value}>{profile.panNumber || "N/A"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Bank Account:</Text>
              <Text style={styles.value}>{profile.bankAccount || "N/A"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Payment Mode:</Text>
              <Text style={styles.value}>{payroll.paymentMode || "Bank Transfer"}</Text>
            </View>
          </View>
        </View>

        {/* Salary Components */}
        <View style={{ flexDirection: "row", gap: 20 }}>
          {/* Earnings */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Earnings</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colLeft}>Component</Text>
              <Text style={styles.colRight}>Amount (Rs)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.colLeft}>Basic Salary</Text>
              <Text style={styles.colRight}>{payroll.basicSalary.toLocaleString()}</Text>
            </View>
            {payroll.hra > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>HRA</Text>
                <Text style={styles.colRight}>{payroll.hra.toLocaleString()}</Text>
              </View>
            )}
            {payroll.da > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>Dearness Allowance (DA)</Text>
                <Text style={styles.colRight}>{payroll.da.toLocaleString()}</Text>
              </View>
            )}
            {payroll.bonus > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>Bonus / Incentives</Text>
                <Text style={styles.colRight}>{payroll.bonus.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.colLeft}>Total Earnings</Text>
              <Text style={styles.colRight}>{totalEarnings.toLocaleString()}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Deductions</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colLeft}>Component</Text>
              <Text style={styles.colRight}>Amount (Rs)</Text>
            </View>
            {payroll.tax > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>TDS / Income Tax</Text>
                <Text style={styles.colRight}>{payroll.tax.toLocaleString()}</Text>
              </View>
            )}
            {payroll.pf > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>Provident Fund (PF)</Text>
                <Text style={styles.colRight}>{payroll.pf.toLocaleString()}</Text>
              </View>
            )}
            {payroll.esi > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>ESI</Text>
                <Text style={styles.colRight}>{payroll.esi.toLocaleString()}</Text>
              </View>
            )}
            {payroll.deductions > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>Other Deductions</Text>
                <Text style={styles.colRight}>{payroll.deductions.toLocaleString()}</Text>
              </View>
            )}
            {totalDeductions === 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.colLeft}>No Deductions</Text>
                <Text style={styles.colRight}>0</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.colLeft}>Total Deductions</Text>
              <Text style={styles.colRight}>{totalDeductions.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Net Salary */}
        <View style={styles.netSalaryBox}>
          <Text style={styles.netSalaryLabel}>Net Salary Payable</Text>
          <Text style={styles.netSalaryAmount}>Rs. {payroll.netSalary.toLocaleString()}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a computer-generated document. No signature is required.
        </Text>
      </Page>
    </Document>
  );
}
