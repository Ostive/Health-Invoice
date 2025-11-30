import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, UserProfile } from '@/types';

interface CorporateTemplateProps {
  invoice: Invoice;
  profile: Partial<UserProfile>;
  total: number;
  tva: number;
}

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  topBanner: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  bannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bannerRight: {
    textAlign: 'right',
  },
  bannerClient: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  bannerYear: {
    fontSize: 9,
    color: '#94a3b8',
  },
  content: {
    padding: 40,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 50,
    marginBottom: 50,
  },
  infoColumn: {
    width: '45%',
  },
  columnHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    marginBottom: 8,
    borderBottom: '2 solid #1e293b',
    paddingBottom: 4,
  },
  columnName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  columnText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  smallText: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: '0.5 solid #f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  colDescription: {
    width: '48%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  colQty: {
    width: '14%',
    textAlign: 'right',
    fontSize: 10,
    color: '#64748b',
  },
  colPrice: {
    width: '19%',
    textAlign: 'right',
    fontSize: 10,
    color: '#64748b',
  },
  colTotal: {
    width: '19%',
    textAlign: 'right',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  headerText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: 12,
    marginTop: 8,
    borderRadius: 2,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8',
  },
});

export const CorporateTemplate: React.FC<CorporateTemplateProps> = ({ invoice, profile, total, tva }) => {
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
      return amount.toFixed(2) + ' €';
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
        <View style={styles.topBanner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>FACTURE</Text>
            <Text style={styles.bannerSubtitle}>N° {safeText(safeInvoice.number)}</Text>
          </View>
          <View style={styles.bannerRight}>
            <Text style={styles.bannerClient}>{safeText(safeClient.name)}</Text>
            <Text style={styles.bannerYear}>{new Date().getFullYear()}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.columnHeader}>Émetteur</Text>
              <Text style={styles.columnName}>{safeText(safeProfile.full_name, 'Nom du professionnel')}</Text>
              <Text style={styles.columnText}>{safeText(safeProfile.address, 'Adresse')}</Text>
              {safeProfile.siret && <Text style={styles.smallText}>SIRET: {safeText(safeProfile.siret)}</Text>}
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.columnHeader}>Adressé à</Text>
              <Text style={styles.columnName}>{safeText(safeClient.name)}</Text>
              <Text style={styles.columnText}>{safeText(safeClient.address)}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDescription, styles.headerText]}>Description</Text>
              <Text style={[styles.colQty, styles.headerText]}>Qté</Text>
              <Text style={[styles.colPrice, styles.headerText]}>Prix Unit.</Text>
              <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
            </View>
            {safeItems.map((item, idx) => (
              <View key={item.id || Math.random()} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={styles.colDescription}>{safeText(item.description)}</Text>
                <Text style={styles.colQty}>{safeText(item.quantity)}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.colTotal}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total HT</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Net à payer</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(total + tva)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>Facture générée électroniquement.</Text>
            <Text>Date d'échéance: {formatDate(safeInvoice.dueDate)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
