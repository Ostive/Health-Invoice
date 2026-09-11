import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, UserProfile } from '@/types';

interface MinimalistTemplateProps {
  invoice: Invoice;
  profile: Partial<UserProfile>;
  total: number;
  tva: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 60,
  },
  invoiceTitle: {
    fontSize: 40,
    fontWeight: 'light',
    letterSpacing: -1,
  },
  invoiceInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#64748b',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#1e293b',
    marginBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 50,
    marginBottom: 60,
  },
  infoColumn: {
    width: '45%',
  },
  columnLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  columnName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  columnText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #000000',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #f1f5f9',
    paddingVertical: 10,
  },
  colDescription: {
    width: '50%',
    fontSize: 10,
  },
  colQty: {
    width: '15%',
    textAlign: 'right',
    fontSize: 10,
    color: '#64748b',
  },
  colPrice: {
    width: '17.5%',
    textAlign: 'right',
    fontSize: 10,
    color: '#64748b',
  },
  colTotal: {
    width: '17.5%',
    textAlign: 'right',
    fontSize: 10,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 50,
  },
  totalsBox: {
    textAlign: 'right',
  },
  totalsLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  totalsValue: {
    fontSize: 32,
    fontWeight: 'light',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 15,
  },
  footerLine: {
    width: 48,
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 8,
  },
  footerNotes: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
});

export const MinimalistTemplate: React.FC<MinimalistTemplateProps> = ({ invoice, profile, total, tva }) => {
  const safeText = (text: any, fallback: string = '') => {
    try {
      if (text === null || text === undefined) return fallback;
      if (typeof text === 'object') return fallback;
      return String(text);
    } catch (e) {
      return fallback;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (e) {
      return '';
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
      return amount.toFixed(2).replace('.', ',');
    } catch (e) {
      return '0.00';
    }
  };

  const safeProfile = profile || {};
  const safeInvoice = invoice || { client: {}, items: [] };
  const safeClient = safeInvoice.client || {};
  const safeItems = Array.isArray(safeInvoice.items) ? safeInvoice.items : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topHeader}>
          <Text style={styles.invoiceTitle}>Facture.</Text>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{safeText(safeInvoice.number)}</Text>
            <Text>{formatDate(safeInvoice.date)}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.columnLabel}>Émetteur</Text>
            <Text style={styles.columnName}>{safeText(safeProfile.full_name, 'Nom du professionnel')}</Text>
            <Text style={styles.columnText}>{safeText(safeProfile.address, 'Adresse')}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.columnLabel}>Destinataire</Text>
            <Text style={styles.columnName}>{safeText(safeClient.name)}</Text>
            <Text style={styles.columnText}>{safeText(safeClient.address)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.headerText]}>Description</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qté</Text>
            <Text style={[styles.colPrice, styles.headerText]}>Prix</Text>
            <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
          </View>
          {safeItems.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{safeText(item.description)}</Text>
              <Text style={styles.colQty}>{safeText(item.quantity)}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <Text style={styles.totalsLabel}>Total (EUR)</Text>
            <Text style={styles.totalsValue}>{formatCurrency(total + tva)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          {safeInvoice.notes ? <Text style={styles.footerNotes}>{safeText(safeInvoice.notes)}</Text> : null}
          <View style={styles.footerLine} />
          {!safeProfile.is_pro ? <Text style={styles.footerText}>Facturier Soignant</Text> : null}
        </View>
      </Page>
    </Document>
  );
};
