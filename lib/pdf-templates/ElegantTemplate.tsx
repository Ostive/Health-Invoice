import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, UserProfile } from '@/types';

interface ElegantTemplateProps {
  invoice: Invoice;
  profile: Partial<UserProfile>;
  total: number;
  tva: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#334155',
    backgroundColor: '#fffef9',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  invoiceTitle: {
    fontSize: 32,
    fontFamily: 'Times-BoldItalic',
    color: '#1e293b',
    letterSpacing: 2,
    marginBottom: 8,
    borderBottom: '2 solid #d4af37',
    paddingBottom: 8,
  },
  headerSubtitle: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#a16207',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  profileSection: {
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.6,
    color: '#64748b',
  },
  profileName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#1e293b',
    marginBottom: 4,
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '1 solid #e2e8f0',
    gap: 25,
  },
  clientSection: {
    width: '50%',
  },
  clientLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#a16207',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Times-Italic',
    marginBottom: 4,
  },
  clientInfo: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#64748b',
    lineHeight: 1.4,
  },
  invoiceInfo: {
    width: '50%',
    textAlign: 'right',
    fontFamily: 'Helvetica',
  },
  infoRow: {
    marginBottom: 4,
  },
  infoLabel: {
    color: '#a16207',
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5c77e',
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #f1f5f9',
    paddingVertical: 10,
  },
  colDescription: {
    width: '50%',
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#475569',
  },
  colQty: {
    width: '15%',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#64748b',
  },
  colPrice: {
    width: '17.5%',
    textAlign: 'right',
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#64748b',
  },
  colTotal: {
    width: '17.5%',
    textAlign: 'right',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  headerText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTextItalic: {
    fontSize: 12,
    fontFamily: 'Times-Italic',
    color: '#a16207',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 50,
    fontFamily: 'Helvetica',
  },
  totalsBox: {
    width: 250,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    border: '1 solid #f1f5f9',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 9,
    color: '#64748b',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTop: '1 solid #e2e8f0',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Times-BoldItalic',
    color: '#a16207',
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 25,
    textAlign: 'center',
  },
  footerLine: {
    width: 48,
    height: 1,
    backgroundColor: '#d4af37',
    marginHorizontal: 'auto',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 8,
    fontFamily: 'Times-Italic',
    color: '#64748b',
  },
});

export const ElegantTemplate: React.FC<ElegantTemplateProps> = ({ invoice, profile, total, tva }) => {
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
          <Text style={styles.headerSubtitle}>Professionnel de Santé</Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.profileName}>{safeText(safeProfile.full_name, 'Nom du professionnel')}</Text>
          <Text>{safeText(safeProfile.specialty, 'Spécialité')}</Text>
          <Text>{safeText(safeProfile.address, 'Adresse')}</Text>
        </View>

        <View style={styles.middleSection}>
          <View style={styles.clientSection}>
            <Text style={styles.clientLabel}>Adressé à</Text>
            <Text style={styles.clientName}>{safeText(safeClient.name)}</Text>
            <Text style={styles.clientInfo}>{safeText(safeClient.address)}</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <View style={styles.infoRow}>
              <Text><Text style={styles.infoLabel}>Réf:</Text> {safeText(safeInvoice.number)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text><Text style={styles.infoLabel}>Date:</Text> {formatDate(safeInvoice.date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.headerTextItalic]}>Désignation</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qté</Text>
            <Text style={[styles.colPrice, styles.headerText]}>Prix</Text>
            <Text style={[styles.colTotal, styles.headerText]}>Montant</Text>
          </View>
          {safeItems.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{safeText(item.description)}</Text>
              <Text style={styles.colQty}>{safeText(item.quantity)}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice).replace(' €', '')}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.quantity * item.unitPrice).replace(' €', '')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Total HT</Text>
              <Text>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(total + tva)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>Merci de votre confiance.</Text>
        </View>
      </Page>
    </Document>
  );
};
