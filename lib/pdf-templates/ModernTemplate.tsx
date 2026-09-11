import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Invoice, UserProfile } from '@/types';

interface ModernTemplateProps {
  invoice: Invoice;
  profile: Partial<UserProfile>;
  total: number;
  tva: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 20,
    marginBottom: 20,
  },
  headerLeft: {
    width: '50%',
  },
  headerRight: {
    width: '50%',
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'light',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  smallText: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  clientSection: {
    marginBottom: 30,
    paddingLeft: 15,
    borderLeft: '4 solid #dbeafe',
  },
  clientLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  clientInfo: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 2,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #cbd5e1',
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
    color: '#334155',
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
    color: '#1e293b',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  totalsBox: {
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '0.5 solid #f1f5f9',
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1 solid #e2e8f0',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 2,
  },
  notes: {
    fontSize: 9,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  statusBadge: {
    marginTop: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-end',
  },
});

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ invoice, profile, total, tva }) => {
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

  const getStatusStyle = () => {
    switch (invoice?.status) {
      case 'Payée':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'En retard':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  // Ensure objects exist
  const safeProfile = profile || {};
  const safeInvoice = invoice || { client: {}, items: [] };
  const safeClient = safeInvoice.client || {};
  const safeItems = Array.isArray(safeInvoice.items) ? safeInvoice.items : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>FACTURIER SOIGNANT</Text>
            <Text style={styles.subtitle}>{safeText(safeProfile.full_name, 'Nom du professionnel')}</Text>
            <Text style={styles.text}>{safeText(safeProfile.specialty, 'Spécialité')}</Text>
            <Text style={styles.text}>{safeText(safeProfile.address, 'Adresse')}</Text>
            {safeProfile.adeli ? <Text style={styles.text}>N° ADELI: {safeText(safeProfile.adeli)}</Text> : null}
            {safeProfile.siret ? <Text style={styles.smallText}>SIRET: {safeText(safeProfile.siret)}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.text}>N° {safeText(safeInvoice.number)}</Text>
            <Text style={styles.text}>Date: {formatDate(safeInvoice.date)}</Text>
            <View style={[styles.statusBadge, getStatusStyle()]}>
              <Text>{safeText(safeInvoice.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>Facturer à</Text>
          <Text style={styles.clientName}>{safeText(safeClient.name)}</Text>
          <Text style={styles.clientInfo}>{safeText(safeClient.address)}</Text>
          {safeClient.email ? <Text style={styles.clientInfo}>{safeText(safeClient.email)}</Text> : null}
          {safeClient.ssn ? <Text style={styles.clientInfo}>N° Sécu: {safeText(safeClient.ssn)}</Text> : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.headerText]}>Description</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qté</Text>
            <Text style={[styles.colPrice, styles.headerText]}>Prix Unit.</Text>
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
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
            {safeProfile.is_vat_applicable && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA (20%)</Text>
                <Text style={styles.totalValue}>{formatCurrency(tva)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total à payer</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(total + (safeProfile.is_vat_applicable ? tva : 0))}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {safeInvoice.notes ? <Text style={styles.notes}>{safeText(safeInvoice.notes)}</Text> : null}
          {safeProfile.is_vat_applicable ? (
            <Text style={styles.footerText}>Montants exprimés en Euros. TVA applicable.</Text>
          ) : (
            <Text style={styles.footerText}>
              TVA non applicable, art. 293 B du CGI ou soins exonérés art. 261 du CGI.
            </Text>
          )}
          {!safeProfile.is_pro ? <Text style={styles.footerText}>Généré par Facturier Soignant AI</Text> : null}
        </View>
      </Page>
    </Document>
  );
};
