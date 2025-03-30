import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import de l'icône
import Header from '../components/layout/Header';

export default function BlackBackgroundPage() {
  return (
    <View style={styles.container}>
      <Header title="RoadBook Tracker" />
      
      <View style={styles.centeredIconContainer}>
        <FontAwesome name="play" color = "#7CA7D8" size={96} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5F5F5F',
  },
  centeredIconContainer: {
    flex: 1,
    justifyContent: 'center',  // Centrer l'icône verticalement
    alignItems: 'center',      // Centrer l'icône horizontalement
  },
});