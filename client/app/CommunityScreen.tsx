import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router'; // 🔸 import correct

const CommunityScreen: React.FC = () => {
  const router = useRouter(); // 🔸 utilisation de useRouter()

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button_introduire_demande}
        onPress={() => router.push('/new_request')} // 🔸 navigation correcte
      >
        <Text style={styles.buttonText}>Introduire une demande</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button_mes_demandes}
        onPress={() => {
          router.push('/my_request')
        }}
      >
        <Text style={styles.buttonText}>mes demandes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b2a2b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button_introduire_demande: {
    backgroundColor: '#4596d9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 400,
  },
  button_mes_demandes: {
    top: 30,
    backgroundColor: '#d99945',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 400,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 30,
    textAlign: 'center',
  },
});

export default CommunityScreen;
