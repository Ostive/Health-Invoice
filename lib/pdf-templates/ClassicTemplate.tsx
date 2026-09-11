import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, UserProfile } from '@/types';

interface ClassicTemplateProps {
  invoice: Invoice;
  profile: Partial<UserProfile>;
  total: number;
  tva: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: '#1e293b',
  },
  header: {
    textAlign: 'center',
    borderBottom: '2 solid #1e293b',
    paddingBottom: 20,
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  headerInfo: {
    fontSize: 10,
  },
  headerName: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
    marginBottom: 4,
  },
  headerSpecialty: {
    fontFamily: 'Times-Italic',
    marginBottom: 2,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 30,
  },
  clientBox: {
    width: '45%',
    border: '1 solid #cbd5e1',
    padding: 15,
  },
  infoBox: {
    width: '45%',
    textAlign: 'right',
    paddingTop: 8,
  },
  clientBoxTitle: {
    fontFamily: 'Times-Bold',
    borderBottom: '1 solid #cbd5e1',
    paddingBottom: 4,
    marginBottom: 8,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  clientName: {
    fontFamily: 'Times-Bold',
    marginBottom: 4,
  },
  clientAddress: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  infoRow: {
    marginBottom: 4,
  },
  infoLabel: {
    fontFamily: 'Times-Bold',
  },
  table: {
    marginBottom: 30,
    border: '1 solid #1e293b',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottom: '1 solid #1e293b',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCellDesc: {
    width: '48%',
    borderRight: '1 solid #1e293b',
    padding: 8,
    fontSize: 10,
  },
  tableCellQty: {
    width: '14%',
    borderRight: '1 solid #1e293b',
    padding: 8,
    textAlign: 'center',
    fontSize: 10,
  },
  tableCellPrice: {
    width: '19%',
    borderRight: '1 solid #1e293b',
    padding: 8,
    textAlign: 'right',
    fontSize: 10,
  },
  tableCellTotal: {
    width: '19%',
    padding: 8,
    textAlign: 'right',
    fontSize: 10,
  },
  tableHeaderCell: {
    fontFamily: 'Times-Bold',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  tableBodyRow: {
    borderBottom: '1 solid #1e293b',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  totalsBox: {
    width: '45%',
    border: '1 solid #1e293b',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1 solid #1e293b',
    backgroundColor: '#f8fafc',
  },
  totalRowLabel: {
    fontFamily: 'Times-Bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#1e293b',
    color: '#ffffff',
  },
  grandTotalText: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Times-Italic',
    paddingTop: 15,
    borderTop: '1 solid #cbd5e1',
  },
  notes: {
    marginBottom: 8,
    fontFamily: 'Times-Roman',
  },
});

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ invoice, profile, total, tva }) => {
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
      if (typeof amount !== 'number' || isNaN(amount)) return '0.00 €';
      return amount.toFixed(2).replace('.', ',') + ' €';
    } catch (e) {
      return '0.00 €';
    }
  };

  const safeProfile = profile || {};
  const safeInvoice = invoice || { client: {}, items: [] };
  const safeClient = safeInvoice.client || {};
  const safeItems = Array.isArray(safeInvoice.items) ? safeInvoice.items : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.invoiceTitle}>Facture</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{safeText(safeProfile.full_name, 'Nom du professionnel')}</Text>
            <Text style={styles.headerSpecialty}>{safeText(safeProfile.specialty, 'Spécialité')}</Text>
            <Text>{safeText(safeProfile.address, 'Adresse')}</Text>
          </View>
        </View>

        <View style={styles.topSection}>
          <View style={styles.clientBox}>
            <Text style={styles.clientBoxTitle}>Client</Text>
            <Text style={styles.clientName}>{safeText(safeClient.name)}</Text>
            <Text style={styles.clientAddress}>{safeText(safeClient.address)}</Text>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text><Text style={styles.infoLabel}>Numéro:</Text> {safeText(safeInvoice.number)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text><Text style={styles.infoLabel}>Date:</Text> {formatDate(safeInvoice.date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellDesc, styles.tableHeaderCell]}>Description</Text>
            <Text style={[styles.tableCellQty, styles.tableHeaderCell]}>Qté</Text>
            <Text style={[styles.tableCellPrice, styles.tableHeaderCell]}>Prix U.</Text>
            <Text style={[styles.tableCellTotal, styles.tableHeaderCell]}>Total</Text>
          </View>
          {safeItems.map((item, index) => (
            <View key={item.id || index} style={styles.tableBodyRow}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellDesc}>{safeText(item.description)}</Text>
                <Text style={styles.tableCellQty}>{safeText(item.quantity)}</Text>
                <Text style={styles.tableCellPrice}>{formatCurrency(item.unitPrice).replace(' €', '')}</Text>
                <Text style={styles.tableCellTotal}>{formatCurrency(item.quantity * item.unitPrice).replace(' €', '')}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Total HT</Text>
              <Text>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalText}>Net à Payer</Text>
              <Text style={styles.grandTotalText}>{formatCurrency(total + tva)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {safeInvoice.notes && <Text style={styles.notes}>{safeText(safeInvoice.notes)}</Text>}
          <Text>
            Dispensé d'immatriculation au registre du commerce et des sociétés (RCS) et au répertoire des métiers (RM).
          </Text>
        </View>
      </Page>
    </Document>
  );
};
