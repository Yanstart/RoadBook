// client/app/auth/register.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateNationalRegisterNumber,
} from '../utils/validation';
import { UserRole } from '../types/auth.types';
import apiClient from '../services/api/client';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();

  // Champs obligatoires - pré-remplis pour faciliter les tests
  const [email, setEmail] = useState('new_test@example.com');
  const [password, setPassword] = useState('Password123!');
  const [confirmPassword, setConfirmPassword] = useState('Password123!');
  const [displayName, setDisplayName] = useState('New Test User');

  // Champs optionnels
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalRegisterNumber, setNationalRegisterNumber] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.APPRENTICE);

  // États UI
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isGuide, setIsGuide] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>(
    'unknown'
  );

  // Vérifie la connectivité au démarrage
  useEffect(() => {
    testConnection();
  }, []);

  // Test de connexion avec le serveur
  const testConnection = async () => {
    try {
      setConnectionStatus('unknown');
      console.log('Testing connection to server...');
      const response = await apiClient.get('/health');
      console.log('Connection successful:', response.data);
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      Alert.alert(
        'Problème de connexion',
        'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
        [{ text: 'Réessayer', onPress: testConnection }]
      );
      return false;
    }
  };

  // Mise à jour du rôle quand le switch change
  useEffect(() => {
    setRole(isGuide ? UserRole.GUIDE : UserRole.APPRENTICE);
  }, [isGuide]);

  // Réinitialisation des erreurs quand les champs changent
  useEffect(() => {
    if (email || password || displayName || confirmPassword) {
      clearError();
      setValidationErrors({});
    }
  }, [email, password, displayName, confirmPassword]);

  // Validation du formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) errors.displayName = displayNameError;

    // Validation des champs optionnels s'ils sont remplis
    if (showOptionalFields) {
      const nrnError = validateNationalRegisterNumber(nationalRegisterNumber);
      if (nrnError) errors.nationalRegisterNumber = nrnError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleRegister = async () => {
    try {
      // Vérifier d'abord la connexion
      const isConnected = await testConnection();
      if (!isConnected) {
        Alert.alert(
          'Problème de connexion',
          'Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.'
        );
        return;
      }

      // Valider le formulaire
      if (!validateForm()) {
        Alert.alert(
          'Formulaire incomplet',
          'Veuillez corriger les erreurs dans le formulaire avant de continuer.'
        );
        return;
      }

      console.log('==== FORM SUBMISSION ====');
      console.log('Preparing registration data:');

      // Données d'inscription complètes
      const registerData = {
        email: email.trim(),
        password: password.trim(),
        displayName: displayName.trim(),
        role: role,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        nationalRegisterNumber: nationalRegisterNumber.trim() || undefined,
      };

      console.log('Registration data prepared:', {
        ...registerData,
        password: '***HIDDEN***',
      });

      console.log('Calling register API...');
      const response = await register(registerData);
      console.log('Register API response received');
      return response;

      // La redirection est gérée dans la fonction register d'AuthContext
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      Alert.alert(
        "Erreur d'inscription",
        err.message || "L'inscription a échoué. Veuillez réessayer."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Créer un compte</Text>

        {/* Connection status */}
        {connectionStatus === 'connected' && (
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedText}>✅ Connecté au serveur</Text>
          </View>
        )}
        {connectionStatus === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ Pas de connexion au serveur</Text>
            <TouchableOpacity onPress={testConnection}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Test info */}
        <View style={styles.testInfoContainer}>
          <Text style={styles.testInfoText}>
            ⚠️ Compte test pré-rempli! Ce compte sera créé dans la base de données.
          </Text>
        </View>

        {/* Afficher l'erreur globale s'il y en a une */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Champs obligatoires */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, validationErrors.email && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder="Entrez votre email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Nom d'utilisateur <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, validationErrors.displayName && styles.inputError]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Choisissez un nom d'utilisateur"
          />
          {validationErrors.displayName && (
            <Text style={styles.errorText}>{validationErrors.displayName}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Mot de passe <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, validationErrors.password && styles.inputError]}
            value={password}
            onChangeText={setPassword}
            placeholder="Choisissez un mot de passe"
            secureTextEntry
          />
          {validationErrors.password && (
            <Text style={styles.errorText}>{validationErrors.password}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Confirmer le mot de passe <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, validationErrors.confirmPassword && styles.inputError]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez votre mot de passe"
            secureTextEntry
          />
          {validationErrors.confirmPassword && (
            <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
          )}
        </View>

        {/* Choix du rôle */}
        <View style={styles.roleContainer}>
          <Text style={styles.label}>Je suis un guide/accompagnateur</Text>
          <Switch
            value={isGuide}
            onValueChange={setIsGuide}
            trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
            thumbColor={isGuide ? '#3b82f6' : '#f4f4f5'}
          />
        </View>
        <Text style={styles.helperText}>
          {isGuide ? 'Vous allez accompagner un apprenti conducteur' : 'Vous apprenez à conduire'}
        </Text>

        {/* Toggle pour afficher/masquer les champs optionnels */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowOptionalFields(!showOptionalFields)}
        >
          <Text style={styles.toggleText}>
            {showOptionalFields
              ? 'Masquer les champs optionnels'
              : 'Ajouter des informations supplémentaires'}
          </Text>
        </TouchableOpacity>

        {/* Champs optionnels */}
        {showOptionalFields && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Entrez votre prénom"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Entrez votre nom"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Entrez votre numéro de téléphone"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Numéro de registre national</Text>
              <TextInput
                style={[styles.input, validationErrors.nationalRegisterNumber && styles.inputError]}
                value={nationalRegisterNumber}
                onChangeText={setNationalRegisterNumber}
                placeholder="Format: XX.XX.XX-XXX.XX"
              />
              {validationErrors.nationalRegisterNumber && (
                <Text style={styles.errorText}>{validationErrors.nationalRegisterNumber}</Text>
              )}
              <Text style={styles.helperText}>
                Optionnel, mais nécessaire pour l'officialisation du RoadBook
              </Text>
            </View>
          </>
        )}

        {/* Bouton d'inscription */}
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        {/* Lien vers la connexion */}
        <View style={styles.linkContainer}>
          <Text>Vous avez déjà un compte ? </Text>
          <Link href="/auth/login">
            <Text style={styles.link}>Se connecter</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  testInfoContainer: {
    backgroundColor: '#fff8e1',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcc80',
    marginBottom: 16,
  },
  testInfoText: {
    color: '#e65100',
    fontSize: 14,
    textAlign: 'center',
  },
  connectedContainer: {
    backgroundColor: '#e6f4ea',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a8dab5',
    marginBottom: 16,
  },
  connectedText: {
    color: '#1e8e3e',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fce8e8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f8c9c9',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryText: {
    color: '#0366d6',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111827',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 4,
    fontSize: 14,
  },
  helperText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  toggleButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  toggleText: {
    color: '#3b82f6',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
