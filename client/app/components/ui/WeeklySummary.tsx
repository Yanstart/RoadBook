// components/WeeklySummary.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sessionApi } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const WeeklySummary = () => {
  const [totalDistance, setTotalDistance] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getStartOfWeek = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  useFocusEffect(
    useCallback(() => {
      const fetchWeeklyData = async () => {
        try {
          const roadbookId = 'a6222aae-f8aa-4aa9-9fb4-6b3be9385221';
          const sessions = await sessionApi.getUserSessions(roadbookId);
          const monday = getStartOfWeek();

          const thisWeekSessions = sessions.filter((s: any) => {
            const sessionDate = new Date(s.date);
            return sessionDate >= monday;
          });

          const total = thisWeekSessions.reduce(
            (acc: number, s: any) => acc + (s.distance || 0),
            0
          );

          setSessionCount(thisWeekSessions.length);
          setTotalDistance(total);
          setError(null);
        } catch (err) {
          console.error(err);
          setError('Erreur lors du chargement des données.');
        }
      };

      fetchWeeklyData();
    }, [])
  );

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.info}>Nombre de sessions : {sessionCount}</Text>
      <Text style={styles.info}>Distance totale : {totalDistance.toFixed(1)} km</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginVertical: 2,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
});

export default WeeklySummary;
