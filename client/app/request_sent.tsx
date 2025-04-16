import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const RequestSent: React.FC = () => {
  const { moniteur, competence, date } = useLocalSearchParams();
  const router = useRouter();

  const progress = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      // Réinitialise et démarre l'animation à chaque fois que la page est affichée
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        router.push('/CommunityScreen');
      }, 10000);

      return () => clearTimeout(timer); // Nettoyage si on quitte avant les 20s
    }, [moniteur, competence, date])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Votre demande suivante a bien été effectuée{'\n'}
        moniteur : {moniteur}{'\n'}
        compétence : {competence}{'\n'}
        date : {date}
      </Text>

      <TouchableOpacity
        style={styles.button_retour}
        onPress={() => router.push('/CommunityScreen')}
      >
        <Text style={styles.text}>Retour</Text>
      </TouchableOpacity>

      <View style={styles.progressButtonContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

export default RequestSent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b2a2b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    padding: 20,
  },
  button_retour: {
    backgroundColor: '#d99945',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 200,
    marginTop: 40,
  },
  progressButtonContainer: {
    backgroundColor: '#d99945',
    height: 12,
    width: 200,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
});
