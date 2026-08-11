import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  headerLeft: { flexDirection: 'column' },
  headerRight: { flexDirection: 'column', alignItems: 'flex-end' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4F46E5', marginBottom: 8 },
  companyName: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  text: { fontSize: 10, color: '#4b5563', lineHeight: 1.5 },
  invoiceBox: { marginTop: 20, backgroundColor: '#f3f4f6', padding: 15, borderRadius: 8 },
  billTo: { marginTop: 30, marginBottom: 20 },
  billToTitle: { fontSize: 12, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  
  table: { width: '100%', marginTop: 20 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8 },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  colHeader: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  colText: { fontSize: 10, color: '#4b5563' },
  
  totals: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5, width: '40%' },
  totalLabel: { fontSize: 10, color: '#4b5563', width: '60%', textAlign: 'right', paddingRight: 15 },
  totalValue: { fontSize: 10, color: '#1f2937', width: '40%', textAlign: 'right', fontWeight: 'bold' },
  grandTotal: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 },
  grandTotalValue: { fontSize: 14, color: '#4F46E5', width: '40%', textAlign: 'right', fontWeight: 'bold' },
  
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 20 },
  footerText: { fontSize: 9, color: '#9ca3af' }
});

export const InvoiceDocument = ({ invoice, company, client }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.text}>Invoice #: {invoice.invoiceNumber}</Text>
          <Text style={styles.text}>Date: {new Date(invoice.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.text}>Due Date: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon receipt'}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.text}>{company.address || 'Company Address'}</Text>
          <Text style={styles.text}>{company.email || 'contact@company.com'}</Text>
          <Text style={styles.text}>{company.gst ? \`GSTIN: \${company.gst}\` : ''}</Text>
        </View>
      </View>

      {/* Bill To */}
      <View style={styles.billTo}>
        <Text style={styles.billToTitle}>BILL TO:</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1f2937' }}>{client?.companyName || client?.name}</Text>
        <Text style={styles.text}>{client?.name}</Text>
        <Text style={styles.text}>{client?.address}</Text>
        <Text style={styles.text}>{client?.email}</Text>
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.col1}><Text style={styles.colHeader}>Description</Text></View>
          <View style={styles.col2}><Text style={styles.colHeader}>Rate</Text></View>
          <View style={styles.col3}><Text style={styles.colHeader}>Qty</Text></View>
          <View style={styles.col4}><Text style={styles.colHeader}>Amount</Text></View>
        </View>
        
        {/* We assume invoice has items, if not we just show one line for the total amount */}
        <View style={styles.tableRow}>
          <View style={styles.col1}><Text style={styles.colText}>{invoice.notes || 'Professional Services rendered'}</Text></View>
          <View style={styles.col2}><Text style={styles.colText}>₹{invoice.amount.toLocaleString()}</Text></View>
          <View style={styles.col3}><Text style={styles.colText}>1</Text></View>
          <View style={styles.col4}><Text style={styles.colText}>₹{invoice.amount.toLocaleString()}</Text></View>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>₹{invoice.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax (GST):</Text>
          <Text style={styles.totalValue}>₹{invoice.tax.toLocaleString()}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.totalLabel}>Total Due:</Text>
          <Text style={styles.grandTotalValue}>₹{invoice.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Please make all cheques payable to {company.name}.</Text>
        <Text style={styles.footerText}>Thank you for your business!</Text>
      </View>
      
    </Page>
  </Document>
);
