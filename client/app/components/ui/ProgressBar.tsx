import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, ThemeColors } from '../../constants/theme';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { sessionApi } from '../../services/api';

const HoursProgressBar = () => {
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [goalHours, setGoalHours] = useState<number | null>(null);
  const [totalHoursDone, setTotalHoursDone] = useState<number>(0);
  const [goalKm, setGoalKm] = useState<string | null>(null);

  const [deadline, setDeadline] = useState<Date | null>(null);

  const distanceProgress = useMemo(() => {
    const numericGoalKm = goalKm ? parseFloat(goalKm) : 0;
    if (!numericGoalKm || numericGoalKm === 0) return 0;
    return Math.min((totalDistance / numericGoalKm) * 100, 100);
  }, [goalKm, totalDistance]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const roadbookId = 'a6222aae-f8aa-4aa9-9fb4-6b3be9385221';
          const sessions = await sessionApi.getUserSessions(roadbookId);

          const total = sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0);
          const totalDist = sessions.reduce((sum: number, session: any) => sum + (session.distance || 0), 0);

          setTotalHoursDone(total);
          setTotalDistance(totalDist);

          const storedGoalHours = await AsyncStorage.getItem('goalHours');
          if (storedGoalHours) setGoalHours(Number(storedGoalHours));

          const storedGoalKm = await AsyncStorage.getItem('goalKm');
          if (storedGoalKm) setGoalKm(storedGoalKm);

          const storedGoalDate = await AsyncStorage.getItem('goalDate'); 
          if (storedGoalDate) setDeadline(new Date(storedGoalDate));

        } catch (error) {
          console.error('Erreur lors du chargement des sessions ou objectifs:', error);
        }
      };

      fetchData();
    }, [])
  );

  const progress = useMemo(() => {
    if (!goalHours || goalHours === 0) return 0;
    return Math.min((totalHoursDone / goalHours) * 100, 100);
  }, [goalHours, totalHoursDone]);

  return (
    <TouchableOpacity onPress={() => router.push('/objectives')} activeOpacity={0.8}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progression</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${distanceProgress}%` }]} />
          </View>
          <View style={styles.percentageBubble}>
            <Text style={styles.percentageText}>{Math.round(distanceProgress)}%</Text>
          </View>
        </View>

        <Text style={styles.distanceText}>
          🚗 Distance parcourue : {(totalDistance || 0).toFixed(1)} km / {goalKm} km
        </Text>
        <Text style={styles.distanceText}>
          {totalHoursDone} h effectuées {goalHours ? `/ ${goalHours} h` : ''}
        </Text>

        {goalHours && <Text style={styles.goalText}>🎯 Objectif : {goalHours} heures</Text>}

        {deadline && (
          <Text style={styles.deadlineText}>📅 Date limite : {deadline.toLocaleDateString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 15,
      margin: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      color: colors.primaryText,
      fontWeight: '500',
      marginBottom: 15,
      textAlign: 'center',
    },
    progressContainer: {
      alignItems: 'center',
    },
    progressBackground: {
      width: '100%',
      height: 20,
      backgroundColor: colors.secondary,
      borderRadius: 10,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#2B86EE',
      borderRadius: 10,
    },
    percentageBubble: {
      backgroundColor: colors.primaryDarker,
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 5,
      position: 'absolute',
      bottom: -18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    percentageText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    distanceText: {
      marginTop: 25,
      textAlign: 'center',
      fontSize: 14,
      color: colors.primaryText,
    },
    goalText: {
      marginTop: 5,
      textAlign: 'center',
      fontSize: 14,
      color: colors.primaryText,
    },
    deadlineText: {
      marginTop: 10,
      textAlign: 'center',
      fontSize: 13,
      color: colors.primaryText,
      fontStyle: 'italic',
    },
  });

export default HoursProgressBar;
