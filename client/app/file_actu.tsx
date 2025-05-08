import React from 'react';
import { Image, View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

// Définition du type des props
type PublicationProps = {
  pseudo: string;
  pdp: string;
  bio: string;
  texte: string;
  imageUri: string[]; // Tableau d'images
};

const Publication: React.FC<PublicationProps> = ({ pseudo, pdp, bio, texte, imageUri }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.publicationContainer}>
      <TouchableOpacity 
        style={styles.container_profile} 
        onPress={() => navigation.navigate('profile_user', { pseudo, bio, pdp })}
      >
        {/* Affichage de l'image de profil ou d'un icône si pdp est vide */}
        {pdp ? (
          <Image source={{ uri: pdp }} style={styles.pdp} />
        ) : (
          <Icon name="account-circle" size={50} color="#FFF" />
        )}

        <Text style={styles.pseudo}>@{pseudo}</Text>
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.publication}>{texte}</Text>
      </View>

      {/* Affichage des images supplémentaires s'il y en a */}
      {imageUri.length > 0 && imageUri.map((uri, index) => (
        <Image key={index} source={{ uri }} style={styles.image} />
      ))}
    </View>
  );
};

const FileActu: React.FC = () => {
  const publications = [
    {
      pseudo: 'sam_elsey',
      bio: 'passioné de voiture ! je connais quasi tous les modele qui existe',
      pdp: 'https://dragonball.guru/wp-content/uploads/2021/01/goku-dragon-ball-guru.jpg',
      texte: 'Une bouteille de vinaigre blanc suffit pour nettoyer 90% de ton van.',
      imageUri: ['https://www.maison-travaux.fr/wp-content/uploads/sites/8/2021/08/shutterstock_1979227064.jpg'],
    },
    {
      pseudo: 'vanlife_lover',
      bio: 'Cette bio a ete ecrite par une persionne qui a peu d imagination pour le moment',
      pdp: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkc6GUnmOBBP45tJ8G3nWpd4YUuUrhJcrxYQ&s', // L'image de profil est vide
      texte: 'Pense à bien aérer ton van tous les matins !',
      imageUri: ['https://www.vanlifemag.fr/wp-content/uploads/2021/07/hymer-ayers-rock-toit-010.jpg'],
    },
    {
      pseudo: 'ivr_74',
      pdp: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiMHCDMtqM_45FAek0yHA1bNk79rzvO1C1Pg&s', // L'image de profil est vide
      bio: 'J aime découvrir de nouveau spot ! donc voila je suis a cours d inspiration j espere que ma bio n est pas trop longue',
      texte: 'Le Lac de Serre-Ponçon est un bon spot à connaître en voiture, ça en vaut le détour !',
      imageUri: [
        'https://europe.huttopia.com/uploads/2024/01/huttopia-lac-de-serre-poncon-1440x718-1.jpg',
        'https://lamisoleil.com/images/news/randonnee-serre-poncon-idee-bon-plan-rando-1.jpg'
      ],
    },
    {
      pseudo: 'duizmoyt',
      pdp: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuNhTZJTtkR6b-ADMhmzPvVwaLuLdz273wvQ&s', // L'image de profil est vide
      bio: 'si jamais vous eternuez ayez le reflexe d eternuez dans votre coude car ce code a ete ecrit par une personne qui a eternué dans sur son coude',
      texte: 'Le Lac de Serre-Ponçon est un bon spot à connaître en voiture, ça en vaut le détour !',
      imageUri: [], // Pas d'images dans cette publication
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {publications.map((publi, index) => (
        <Publication
          key={index}
          pseudo={publi.pseudo}
          bio={publi.bio}
          pdp={publi.pdp} // La prop `pdp` est bien passée maintenant
          texte={publi.texte}
          imageUri={publi.imageUri}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },

  publicationContainer: {
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#363535',
    borderRadius: 15,
    margin: 10,
    padding: 5,
  },

  container_profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pdp: {
    width: 50,
    height: 50,
    borderRadius: 25, // Pour l'image de profil ronde
  },

  pseudo: {
    fontSize: 18,
    color: '#FFF',
    marginLeft: 10,
  },

  textContainer: {
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },

  publication: {
    color: '#FFF',
    marginTop: 10,
  },

  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default FileActu;
