import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'; 
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const pseudo = route.params?.pseudo ?? 'Utilisateur inconnu';
    const bio = route.params?.bio ?? 'bio inconnue';
    const pdp = route.params?.pdp ?? 'pdp pas trouvé';

    return (
        <View style={styles.container}>
            {/* Fond d'écran */}
            <View style={styles.header}>
                <Image source={{ uri: 'https://source.unsplash.com/random/800x600' }} style={styles.backgroundImage} />
            </View>

            {/* Profile Section */}
            <View style={styles.profile}>
                {pdp && pdp !== 'pdp pas trouvé' ? (
                    <Image source={{ uri: pdp }} style={styles.pdp} />
                ) : (
                    <Icon name="account-circle" size={80} color="#FFF" />
                )}
                <View>
                    <Text style={styles.pseudo}>@{pseudo}</Text>
                    <Text style={styles.name}>{pseudo}</Text>
                </View>
            </View>

            {/* Bio Section */}
            <View style={styles.bio_container}>
                <Text style={styles.bio}>{bio}</Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity style={styles.editButton}>
                <Icon name="edit" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Modifier le profil</Text>
            </TouchableOpacity>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
                <Text style={styles.stats}>follower(s): 120</Text>
                <Text style={styles.stats}>Publications: 50</Text>
            </View>

            {/* Chat Button */}
            <TouchableOpacity style={styles.chatButton} 
                onPress={() => navigation.navigate('ConversationScreen', { 
                    contactName : pseudo,
                    contactMessages : [] })}
            >
                <Icon name="chat" size={50} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212121',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    header: {
        height: 200,
        width: '100%',
        backgroundColor: '#333',
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.4,
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#363535',
    },
    pdp: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    pseudo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 10,
        marginLeft : 10,
    },
    name: {
        fontSize: 18,
        color: '#888',
        marginLeft : 10,
    },
    bio_container: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#363535',
        borderWidth: 1,
        borderColor: '#FFF',
        marginBottom: 20,
    },
    bio: {
        color: '#FFF',
        fontSize: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF5722',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 25,
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFF',
        marginLeft: 10,
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    stats: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 8,
    },
    chatButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#FF5722',
        borderRadius: 50,
        padding: 20,
    },
});

export default ProfileScreen;
