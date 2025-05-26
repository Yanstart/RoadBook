import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { sessionApi } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const getPeriodDates = (filter: string): string[] => {
  const now = new Date();
  const dates: string[] = [];

  if (filter === 'week') {
    const monday = new Date(now);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Lundi = 1, Dimanche = 0
    monday.setDate(monday.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toLocaleDateString('fr-FR', { weekday: 'short' }));
    }
  }

  if (filter === 'year') {
    for (let i = 0; i < 12; i++) {
      dates.push(
        new Date(now.getFullYear(), i, 1).toLocaleDateString('fr-FR', {
          month: 'short',
        })
      );
    }
  }

  return dates;
};

const DistanceCharts = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [filter, setFilter] = useState<'week' | 'year'>('week');

  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });

  const loadChartData = useCallback((data: any[], filter: string) => {
    const labels = getPeriodDates(filter);
    const aggregated: Record<string, number> = {};

    data.forEach((session: any) => {
      const date = new Date(session.date);
      let key: string;

      if (filter === 'year') {
        key = date.toLocaleDateString('fr-FR', { month: 'short' });
      } else if (filter === 'week') {
        key = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      } else {
        key = date.toLocaleDateString('fr-FR');
      }

      aggregated[key] = (aggregated[key] || 0) + (session.distance || 0);
    });

    setChartData({
      labels,
      datasets: [
        {
          data: labels.map(label => aggregated[label] || 0),
          strokeWidth: 2,
        },
      ],
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchSessions = async () => {
        try {
          const roadbookId = 'a6222aae-f8aa-4aa9-9fb4-6b3be9385221';
          const result = await sessionApi.getUserSessions(roadbookId);
          setSessions(result);
          setError(null);
          loadChartData(result, filter);
        } catch (err) {
          console.error(err);
          setError('Impossible de charger les données.');
        }
      };

      fetchSessions();
    }, [filter])
  );

  const handleFilterChange = (value: 'week' | 'year') => {
    setFilter(value);
    loadChartData(sessions, value);
  };

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!chartData) {
    return <Text style={styles.loadingText}>Chargement des données...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distance parcourue ({filter})</Text>

      <View style={styles.buttonGroup}>
        {['week', 'year'].map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.button,
              filter === option && styles.activeButton,
            ]}
            onPress={() => handleFilterChange(option as 'week' | 'year')}
          >
            <Text
              style={[
                styles.buttonText,
                filter === option && styles.activeButtonText,
              ]}
            >
              {option === 'week' ? 'Semaine' : 'Année'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <LineChart
        data={chartData}
        width={screenWidth - 100}
        height={220}
        yAxisSuffix=" km"
        chartConfig={{
          backgroundColor: '#e8f0fe',
          backgroundGradientFrom: '#e8f0fe',
          backgroundGradientTo: '#cfd8dc',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: () => '#000',
        }}
        style={styles.chart}
        bezier={false}
        onDataPointClick={(data) => {
          let isSamePoint = tooltipPos.x === data.x && tooltipPos.y === data.y;
          setTooltipPos({
            x: data.x,
            y: data.y,
            value: data.value,
            visible: !isSamePoint || !tooltipPos.visible,
          });
        }}
      />

      {tooltipPos.visible && (
        <View style={{
          position: 'absolute',
          top: tooltipPos.y + 60,
          left: tooltipPos.x + 30,
          backgroundColor: 'white',
          padding: 6,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#2196f3',
        }}>
          <Text style={{ color: '#000' }}>{tooltipPos.value.toFixed(1)} km</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0.3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    margin: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
  },
  activeButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
  },
  activeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DistanceCharts;
