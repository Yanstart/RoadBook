import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

type Request = {
  moniteur: string;
  competence: string;
  date: string;
  statut?: string;
};

// ✅ Variable globale (définie une seule fois)
export const requestList: Request[] = [];

export const addRequest = (request: Request) => {
  requestList.push({ ...request, statut: 'En cours de traitement' });
};

const MyRequest: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes demandes</Text>

      {/* en tête du tableau */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Moniteur</Text>
        <Text style={styles.headerText}>Compétence</Text>
        <Text style={styles.headerText}>Date</Text>
        <Text style={styles.headerText}>Statut</Text>
      </View>

      {/* lignes dynamiques */}
      {requestList.map((req, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.rowText}>{req.moniteur}</Text>
          <Text style={styles.rowText}>{req.competence}</Text>
          <Text style={styles.rowText}>{req.date}</Text>
          <Text style={styles.rowText}>{req.statut}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b2a2b',
    padding: 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: 'white',
    paddingBottom: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
  },
  headerText: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
  },
});

export default MyRequest;
