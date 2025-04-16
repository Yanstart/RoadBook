import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { addRequest } from './my_request';


// Fonction pour formater la date en jj-mm-yy
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0'); // Ajoute un 0 si le jour est inférieur à 10
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois commence à 0, donc on ajoute +1
    const year = date.getFullYear().toString().slice(2); // Récupère les deux derniers chiffres de l'année
    return `${day}-${month}-${year}`;
  };


const NewRequest: React.FC = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State pour le dropdown Moniteur
  const [showMoniteurList, setShowMoniteurList] = useState(false);
  const [selectedMoniteur, setSelectedMoniteur] = useState<string | null>(null);
  const moniteurs = ['Jean Dupont', 'Sarah Leroy', 'Karim Meziane'];

  const toggleMoniteur = () => setShowMoniteurList(!showMoniteurList);
  const handleMoniteurSelect = (name: string) => {
    setSelectedMoniteur(name);
    setShowMoniteurList(false);
  };

  // State pour le dropdown compétence
  const [showSkillList, setShowSkillList] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const skills = ['conduire sur autoroute', 'démarrage en côte', 'les feux'];

  const toggleSkill = () => setShowSkillList(!showSkillList);
  const handleSkillSelect = (name: string) => {
    setSelectedSkill(name);
    setShowSkillList(false);
  };

  // State pour afficher le calendrier et la date sélectionnée
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // État pour la date sélectionnée
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  // Calcul de la date d'aujourd'hui
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // Format yyyy-mm-dd (ex : 2025-04-15)


  return (
    <View style={styles.container}>
      {/* Bouton Moniteur */}
      <TouchableOpacity
        style={styles.button_moniteur}
        onPress={toggleMoniteur}
      >
        <Text style={styles.buttonText}>
          {selectedMoniteur ? `Moniteur : ${selectedMoniteur}` : 'Choisir un moniteur'}
        </Text>
      </TouchableOpacity>

      {/* Liste déroulante Moniteur */}
      {showMoniteurList && (
        <View style={styles.dropdown}>
          {moniteurs.map((moniteur, index) => (
            <TouchableOpacity key={index} onPress={() => handleMoniteurSelect(moniteur)}>
              <Text style={styles.dropdownItem}>{moniteur}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bouton compétence */}
      <TouchableOpacity
        style={styles.button_competence}
        onPress={toggleSkill}
      >
        <Text style={styles.buttonText}>
          {selectedSkill ? `Compétence : ${selectedSkill}` : 'Choisir une compétence'}
        </Text>
      </TouchableOpacity>

      {/* Liste déroulante compétence */}
      {showSkillList && (
        <View style={styles.dropdown}>
          {skills.map((skill, index) => (
            <TouchableOpacity key={index} onPress={() => handleSkillSelect(skill)}>
              <Text style={styles.dropdownItem}>{skill}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bouton Date */}
      <TouchableOpacity
        style={styles.button_date}
        onPress={toggleCalendar} // Clique pour afficher/masquer le calendrier
      >
        <Text style={styles.buttonText}>
          {selectedDate ? `Date : ${formatDate(selectedDate)}` : 'Choisir une date'} {/* Affiche la date sélectionnée */}
        </Text>
      </TouchableOpacity>

      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString); // Met à jour la date sélectionnée
              console.log('Jour sélectionné :', day);
              setShowCalendar(false); // Ferme le calendrier après la sélection
            }}
            markedDates={{
              [selectedDate || '2025-04-15']: { selected: true, marked: true, selectedColor: 'blue' },
            }}
            theme={{
              selectedDayBackgroundColor: 'blue',
              selectedDayTextColor: 'white',
            }}
            minDate={todayString}
          />
        </View>
      )}

        {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
        )}

      <TouchableOpacity
        style={styles.button_soumettre}
        onPress={() => {
          if (!selectedMoniteur || !selectedSkill || !selectedDate) {
            setErrorMessage('Veuillez sélectionner un moniteur, une compétence et une date.');
          } else {
            setErrorMessage(null);
        
            // Ajout dans la liste temporaire
            addRequest({
              moniteur: selectedMoniteur,
              competence: selectedSkill,
              date: formatDate(selectedDate),
            });
        
            // Navigation
            router.push({
              pathname: 'request_sent',
              params: {
                moniteur: selectedMoniteur,
                competence: selectedSkill,
                date: selectedDate,
              },
            });
        
            // Reset
            setSelectedMoniteur(null);
            setSelectedSkill(null);
            setSelectedDate(null);
          }
        }}
        
      >
        <Text style={styles.buttonText}>Soumettre</Text>
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
  button_moniteur: {
    backgroundColor: '#d95145',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 400,
  },
  dropdown: {
    backgroundColor: '#3d3d3d',
    width: 400,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 15,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  button_competence: {
    backgroundColor: '#d99945',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 400,
    marginTop: 20,
  },
  button_date: {
    backgroundColor: '#4cd945',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 400,
    marginTop: 20,
  },
  button_soumettre: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    width: 200,
    marginTop: 40,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 15,
  },

  errorText: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
});

export default NewRequest;
