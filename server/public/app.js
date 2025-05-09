/**
 * RoadBook API Tester
 * Application JavaScript pour tester les APIs modulaires RoadBook
 */

// API base URL - adaptable selon l'environnement
const API_URL = window.location.port === '4001' ? 'http://localhost:4001/api' : '/api';

// Variables d'état
let accessToken = localStorage.getItem('accessToken') || null;
let userRefreshToken = localStorage.getItem('refreshToken') || null;
let currentUser = null;

// ======== INITIALISATION ========

// Initialiser l'application au chargement
document.addEventListener('DOMContentLoaded', function() {
    updateTokenStatus();
    updateAuthStatusDisplay();
    
    // Auto-vérification du token si présent
    if (accessToken) {
        verifyToken(true);
    }
    
    // Initialiser les écouteurs d'événements pour les éléments dynamiques
    setupDynamicEventListeners();
});

// ======== GESTION DES TOKENS ========

// Configuration des écouteurs d'événements pour les éléments dynamiques
function setupDynamicEventListeners() {
    // Exemple: mettre en place des écouteurs pour des éléments qui seront générés dynamiquement
    document.addEventListener('click', function(event) {
        // Gestion des boutons "Utiliser ID" pour les roadbooks
        if (event.target.matches('[data-action="use-roadbook-id"]')) {
            const roadbookId = event.target.getAttribute('data-id');
            fillRoadbookId(roadbookId);
        }
        
        // Gestion des boutons "Voir détails" pour les roadbooks
        if (event.target.matches('[data-action="view-roadbook-details"]')) {
            const roadbookId = event.target.getAttribute('data-id');
            getRoadbookById(roadbookId);
        }
    });
}

// Mettre à jour l'affichage des status de token
function updateTokenStatus() {
    const accessTokenStatus = document.getElementById('access-token-status');
    const refreshTokenStatus = document.getElementById('refresh-token-status');
    
    if (accessTokenStatus && refreshTokenStatus) {
        accessTokenStatus.innerText = accessToken ? 'Présent' : 'Non présent';
        refreshTokenStatus.innerText = userRefreshToken ? 'Présent' : 'Non présent';
        
        accessTokenStatus.className = accessToken ? 'text-success' : 'text-danger';
        refreshTokenStatus.className = userRefreshToken ? 'text-success' : 'text-danger';
    }
}

// Mettre à jour l'affichage du statut d'authentification
function updateAuthStatusDisplay() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('auth-status-text');
    
    if (statusIndicator && statusText) {
        if (accessToken) {
            statusText.innerText = currentUser ? 
                `Connecté (${currentUser.displayName || currentUser.email})` : 
                'Connecté';
            statusIndicator.className = 'status-indicator status-connected';
        } else {
            statusText.innerText = 'Non connecté';
            statusIndicator.className = 'status-indicator status-disconnected';
        }
    }
}

// ======== GESTION DES RÉPONSES API ========

// Afficher la réponse dans la zone de sortie
function showResponse(response) {
    const output = document.getElementById('response-output');
    if (output) {
        if (typeof response === 'object') {
            output.value = JSON.stringify(response, null, 2);
        } else {
            output.value = response;
        }
    }
}

// Gérer les erreurs API
function handleApiError(error) {
    console.error('API Error:', error);
    showResponse({
        status: 'error',
        message: error.message || 'Une erreur est survenue',
        details: error.toString()
    });
    
    // Si l'erreur est liée à l'authentification, nettoyer les tokens
    if (error.message && (
        error.message.includes('token') || 
        error.message.includes('Token') || 
        error.message.includes('auth') || 
        error.message.includes('Auth')
    )) {
        clearAuthTokens();
    }
}

// Utilitaire pour afficher les détails de la requête
function logRequest(endpoint, method, data) {
    console.log(`API Request: ${method} ${API_URL}${endpoint}`);
    if (data) console.log('Request Data:', data);
    
    // Afficher la requête pour le débogage
    showResponse({
        debug: true,
        timestamp: new Date().toISOString(),
        endpoint: `${API_URL}${endpoint}`,
        method,
        data,
        headers: accessToken ? {'Authorization': `Bearer ${accessToken}`} : {}
    });
}

// ======== REQUÊTES API ========

// Effectuer une requête API avec authentification
async function apiRequest(endpoint, method = 'GET', data = null, silent = false) {
    try {
        // Journaliser la requête si non silencieuse
        if (!silent) {
            logRequest(endpoint, method, data);
        }
        
        // Configurer les en-têtes
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        // Options de la requête
        const fetchOptions = {
            method,
            headers,
            credentials: 'include'
        };
        
        // Ajouter le corps de la requête pour les méthodes non-GET
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            fetchOptions.body = JSON.stringify(data);
        }
        
        // Effectuer la requête
        const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
        
        // Traiter la réponse
        try {
            const responseData = await response.json();
            
            // Afficher la réponse si la requête n'est pas silencieuse
            if (!silent) {
                console.log('Response:', responseData);
                showResponse(responseData);
            }
            
            // Gérer les erreurs HTTP
            if (!response.ok) {
                const error = new Error(responseData.message || `HTTP error ${response.status}`);
                error.statusCode = response.status;
                error.response = responseData;
                throw error;
            }
            
            return responseData;
        } catch (jsonError) {
            // Erreur de parsing JSON
            console.error('Error parsing JSON response:', jsonError);
            const errorData = {
                status: 'error',
                message: 'Error parsing server response',
                httpStatus: response.status,
                text: await response.text()
            };
            
            if (!silent) {
                showResponse(errorData);
            }
            
            throw new Error(`Failed to parse JSON: ${errorData.text.substring(0, 100)}...`);
        }
    } catch (error) {
        // Ne pas afficher l'erreur pour les requêtes silencieuses
        if (!silent) {
            handleApiError(error);
        }
        throw error;
    }
}

// ======== FONCTIONS D'AUTHENTIFICATION ========

// Inscription d'un nouvel utilisateur
async function register() {
    try {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const displayName = document.getElementById('register-display-name').value;
        const role = document.getElementById('register-role').value;
        
        if (!email || !password || !displayName) {
            alert('Tous les champs sont requis');
            return;
        }
        
        const result = await apiRequest('/auth/register', 'POST', {
            email,
            password,
            displayName,
            role
        });
        
        if (result.status === 'success') {
            // Stocker les tokens
            accessToken = result.accessToken;
            userRefreshToken = result.refreshToken;
            currentUser = result.user;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', userRefreshToken);
            
            updateTokenStatus();
            updateAuthStatusDisplay();
            
            alert('Inscription réussie!');
        }
    } catch (error) {
        console.error('Registration error:', error);
    }
}

// Connexion
async function login() {
    try {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            alert('Email et mot de passe sont requis');
            return;
        }
        
        const result = await apiRequest('/auth/login', 'POST', {
            email,
            password
        });
        
        if (result.status === 'success') {
            // Stocker les tokens
            accessToken = result.accessToken;
            userRefreshToken = result.refreshToken;
            currentUser = result.user;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', userRefreshToken);
            
            updateTokenStatus();
            updateAuthStatusDisplay();
            
            alert('Connexion réussie!');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Rafraîchir le token
async function refreshToken() {
    try {
        if (!userRefreshToken) {
            alert('Pas de refresh token disponible');
            return;
        }
        
        const result = await apiRequest('/auth/refresh-token', 'POST', {
            refreshToken: userRefreshToken
        });
        
        if (result.status === 'success') {
            // Mettre à jour l'access token (et le refresh token si présent)
            accessToken = result.accessToken;
            localStorage.setItem('accessToken', accessToken);
            
            if (result.refreshToken) {
                userRefreshToken = result.refreshToken;
                localStorage.setItem('refreshToken', userRefreshToken);
            }
            
            updateTokenStatus();
            
            alert('Token rafraîchi avec succès!');
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        clearAuthTokens();
    }
}

// Vérifier la validité du token
async function verifyToken(silent = false) {
    try {
        if (!accessToken) {
            if (!silent) alert('Pas d\'access token disponible');
            return false;
        }
        
        const result = await apiRequest('/auth/verify', 'GET', null, silent);
        
        if (result.status === 'success' && result.valid) {
            if (!silent) alert('Token valide!');
            
            // Mettre à jour currentUser si disponible
            if (result.user) {
                currentUser = result.user;
                updateAuthStatusDisplay();
            }
            
            return true;
        } else {
            if (!silent) alert('Token invalide ou expiré!');
            
            // Effacer le token invalide
            if (!result.valid) {
                clearAuthTokens();
            }
            
            return false;
        }
    } catch (error) {
        console.error('Token verification error:', error);
        clearAuthTokens();
        return false;
    }
}

// Déconnexion
async function logout() {
    try {
        if (!userRefreshToken) {
            alert('Pas de refresh token disponible');
            clearAuthTokens();
            return;
        }
        
        const result = await apiRequest('/auth/logout', 'POST', {
            refreshToken: userRefreshToken
        });
        
        // Effacer les tokens quelle que soit la réponse
        clearAuthTokens();
        
        if (result.status === 'success') {
            alert('Déconnexion réussie!');
        }
    } catch (error) {
        console.error('Logout error:', error);
        clearAuthTokens();
    }
}

// Nettoyer les tokens d'authentification
function clearAuthTokens() {
    accessToken = null;
    userRefreshToken = null;
    currentUser = null;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    updateTokenStatus();
    updateAuthStatusDisplay();
}

// Demande de réinitialisation de mot de passe
async function forgotPassword() {
    try {
        const email = document.getElementById('forgot-email').value;
        
        if (!email) {
            alert('Email requis');
            return;
        }
        
        const result = await apiRequest('/auth/forgot-password', 'POST', { email });
        
        if (result.status === 'success') {
            alert('Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        // Même en cas d'erreur, afficher un message neutre pour éviter les fuites d'information
        alert('Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.');
    }
}

// Réinitialisation de mot de passe
async function resetPassword() {
    try {
        const token = document.getElementById('reset-token').value;
        const newPassword = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-confirm-password').value;
        
        if (!token || !newPassword || !confirmPassword) {
            alert('Tous les champs sont requis');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }
        
        const result = await apiRequest('/auth/reset-password', 'POST', {
            token,
            newPassword,
            confirmPassword
        });
        
        if (result.status === 'success') {
            alert('Mot de passe réinitialisé avec succès!');
            // Effacer les champs après succès
            document.getElementById('reset-token').value = '';
            document.getElementById('reset-password').value = '';
            document.getElementById('reset-confirm-password').value = '';
        }
    } catch (error) {
        console.error('Reset password error:', error);
    }
}

// ======== FONCTIONS UTILISATEUR ========

// Récupérer le profil de l'utilisateur courant
async function getCurrentUser() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const result = await apiRequest('/users/me', 'GET');
        
        if (result.status === 'success') {
            currentUser = result.data;
            updateAuthStatusDisplay();
            
            // Afficher les détails du profil
            const profileContainer = document.getElementById('current-user-profile');
            const profileDetails = document.getElementById('profile-details');
            
            if (profileContainer && profileDetails) {
                profileContainer.style.display = 'block';
                
                // Formater les dates
                const createdAt = new Date(currentUser.createdAt).toLocaleString();
                const updatedAt = new Date(currentUser.updatedAt).toLocaleString();
                
                let profileHTML = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">ID</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${currentUser.id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Email</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${currentUser.email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Nom d'affichage</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${currentUser.displayName || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Prénom</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${currentUser.firstName || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Nom</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${currentUser.lastName || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Rôle</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${currentUser.role}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Bio</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${currentUser.bio || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Créé le</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${createdAt}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Mis à jour le</td>
                            <td style="padding: 8px; border: 1px solid #dee2e6;">${updatedAt}</td>
                        </tr>
                    </table>
                `;
                
                profileDetails.innerHTML = profileHTML;
            }
        }
    } catch (error) {
        console.error('Get user error:', error);
    }
}

// Mettre à jour le profil utilisateur
async function updateProfile() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const displayName = document.getElementById('update-display-name').value;
        const firstName = document.getElementById('update-first-name').value;
        const lastName = document.getElementById('update-last-name').value;
        const bio = document.getElementById('update-bio').value;
        
        const data = {};
        if (displayName) data.displayName = displayName;
        if (firstName) data.firstName = firstName;
        if (lastName) data.lastName = lastName;
        if (bio) data.bio = bio;
        
        if (Object.keys(data).length === 0) {
            alert('Aucune donnée à mettre à jour');
            return;
        }
        
        const result = await apiRequest('/users/me', 'PUT', data);
        
        if (result.status === 'success') {
            alert('Profil mis à jour avec succès!');
            currentUser = result.data;
            updateAuthStatusDisplay();
            
            // Effacer les champs après mise à jour
            document.getElementById('update-display-name').value = '';
            document.getElementById('update-first-name').value = '';
            document.getElementById('update-last-name').value = '';
            document.getElementById('update-bio').value = '';
        }
    } catch (error) {
        console.error('Update profile error:', error);
    }
}

// Changer le mot de passe
async function changePassword() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('Tous les champs sont requis');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert('Les nouveaux mots de passe ne correspondent pas');
            return;
        }
        
        const result = await apiRequest('/users/me/password', 'PUT', {
            currentPassword,
            newPassword,
            confirmPassword: confirmNewPassword
        });
        
        if (result.status === 'success') {
            alert('Mot de passe changé avec succès!');
            
            // Effacer les champs après succès
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-new-password').value = '';
        }
    } catch (error) {
        console.error('Change password error:', error);
    }
}

// Récupérer tous les utilisateurs (admin seulement)
async function getAllUsers() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const result = await apiRequest('/users', 'GET');
        
        if (result.status === 'success' && result.data) {
            // Afficher la liste des utilisateurs
            const usersContainer = document.getElementById('all-users-container');
            
            if (usersContainer) {
                usersContainer.style.display = 'block';
                
                if (!result.data.length) {
                    usersContainer.innerHTML = '<p>Aucun utilisateur trouvé</p>';
                    return;
                }
                
                let usersHTML = '<div class="list-group">';
                
                result.data.forEach(user => {
                    // Formater la date de création
                    const createdDate = new Date(user.createdAt).toLocaleDateString();
                    
                    // Créer un badge pour le rôle
                    let roleBadgeClass = 'badge-primary';
                    if (user.role === 'ADMIN') roleBadgeClass = 'badge-danger';
                    else if (user.role === 'INSTRUCTOR') roleBadgeClass = 'badge-success';
                    else if (user.role === 'GUIDE') roleBadgeClass = 'badge-warning';
                    
                    usersHTML += `
                        <div class="list-item">
                            <div class="list-item-title">
                                ${user.displayName || user.email}
                                <span class="badge ${roleBadgeClass}">${user.role}</span>
                            </div>
                            <div>
                                <small>ID: ${user.id}</small> | 
                                <small>Email: ${user.email}</small> | 
                                <small>Créé le: ${createdDate}</small>
                            </div>
                            <div style="margin-top: 10px;">
                                <button class="btn btn-sm btn-secondary" onclick="fillUserId('${user.id}')">Utiliser ID</button>
                            </div>
                        </div>
                    `;
                });
                
                usersHTML += '</div>';
                usersContainer.innerHTML = usersHTML;
            }
        }
    } catch (error) {
        console.error('Get all users error:', error);
    }
}

// Remplir l'ID utilisateur dans le formulaire
function fillUserId(id) {
    const field = document.getElementById('user-id');
    if (field) field.value = id;
}

// Récupérer un utilisateur par ID
async function getUserById() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const userId = document.getElementById('user-id').value;
        
        if (!userId) {
            alert('ID utilisateur requis');
            return;
        }
        
        await apiRequest(`/users/${userId}`, 'GET');
    } catch (error) {
        console.error('Get user by ID error:', error);
    }
}

// ======== FONCTIONS ROADBOOK ========

// Créer un nouveau roadbook
async function createRoadbook() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const title = document.getElementById('roadbook-title').value;
        const description = document.getElementById('roadbook-description').value;
        const targetHours = document.getElementById('roadbook-target-hours').value;
        
        if (!title) {
            alert('Titre requis');
            return;
        }
        
        const data = {
            title,
            description,
            targetHours: parseInt(targetHours) || 30
        };
        
        const result = await apiRequest('/roadbooks', 'POST', data);
        
        if (result.status === 'success') {
            alert('RoadBook créé avec succès!');
            getMyRoadbooks(); // Rafraîchir la liste
        }
    } catch (error) {
        console.error('Create roadbook error:', error);
    }
}

// Récupérer mes roadbooks
async function getMyRoadbooks() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const result = await apiRequest('/roadbooks', 'GET');
        
        if (result.status === 'success' && result.data) {
            renderRoadbookList(result.data);
        }
    } catch (error) {
        console.error('Get roadbooks error:', error);
    }
}

// Récupérer roadbooks où je suis guide
async function getGuidedRoadbooks() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const result = await apiRequest('/roadbooks/guided', 'GET');
        
        if (result.status === 'success' && result.data) {
            renderRoadbookList(result.data);
        }
    } catch (error) {
        console.error('Get guided roadbooks error:', error);
    }
}

// Afficher la liste des roadbooks
function renderRoadbookList(roadbooks) {
    const container = document.getElementById('roadbook-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!roadbooks || roadbooks.length === 0) {
        container.innerHTML = '<p>Aucun roadbook trouvé</p>';
        return;
    }
    
    let html = '';
    
    roadbooks.forEach(roadbook => {
        // Formater la date de création
        const createdDate = new Date(roadbook.createdAt).toLocaleDateString();
        
        // Définir la classe de statut
        let statusBadgeClass = 'badge-primary';
        if (roadbook.status === 'ACTIVE') statusBadgeClass = 'badge-success';
        else if (roadbook.status === 'COMPLETED') statusBadgeClass = 'badge-primary';
        else if (roadbook.status === 'ARCHIVED') statusBadgeClass = 'badge-danger';
        
        html += `
            <div class="list-item">
                <div class="list-item-title">
                    ${roadbook.title}
                    <span class="badge ${statusBadgeClass}">${roadbook.status}</span>
                </div>
                <p>${roadbook.description || 'Pas de description'}</p>
                <div style="margin-top: 5px;">
                    <span class="badge badge-primary">Heures cibles: ${roadbook.targetHours}h</span>
                    <span class="badge">Créé le: ${createdDate}</span>
                    ${roadbook._count ? `<span class="badge">Sessions: ${roadbook._count.sessions}</span>` : ''}
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="fillRoadbookId('${roadbook.id}')">Utiliser ID</button>
                    <button class="btn btn-sm btn-secondary" onclick="getRoadbookById('${roadbook.id}')">Détails</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `<div class="list-group">${html}</div>`;
}

// Utiliser l'ID d'un roadbook dans les champs
function fillRoadbookId(id) {
    // Remplir tous les champs d'ID roadbook sur la page
    const idFields = [
        'roadbook-id',
        'session-roadbook-id',
        'sessions-roadbook-id',
        'competencies-roadbook-id',
        'competency-roadbook-id'
    ];
    
    idFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = id;
    });
}

// Récupérer un roadbook par ID
async function getRoadbookById(id) {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        // Utiliser l'ID passé en paramètre ou récupérer du champ
        const roadbookId = id || document.getElementById('roadbook-id').value;
        
        if (!roadbookId) {
            alert('ID du roadbook requis');
            return;
        }
        
        await apiRequest(`/roadbooks/${roadbookId}`, 'GET');
    } catch (error) {
        console.error('Get roadbook error:', error);
    }
}

// Récupérer les statistiques d'un roadbook
async function getRoadbookStatistics() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('roadbook-id').value;
        
        if (!roadbookId) {
            alert('ID du roadbook requis');
            return;
        }
        
        await apiRequest(`/roadbooks/${roadbookId}/statistics`, 'GET');
    } catch (error) {
        console.error('Get roadbook statistics error:', error);
    }
}

// Exporter un roadbook (JSON/PDF)
async function exportRoadbook() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('roadbook-id').value;
        
        if (!roadbookId) {
            alert('ID du roadbook requis');
            return;
        }
        
        await apiRequest(`/roadbooks/${roadbookId}/export?format=json`, 'GET');
    } catch (error) {
        console.error('Export roadbook error:', error);
    }
}

// Mettre à jour le statut d'un roadbook
async function updateRoadbookStatus() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('roadbook-id').value;
        const status = document.getElementById('roadbook-status').value;
        
        if (!roadbookId) {
            alert('ID du roadbook requis');
            return;
        }
        
        const result = await apiRequest(`/roadbooks/${roadbookId}/status`, 'PATCH', {
            status
        });
        
        if (result.status === 'success') {
            alert(`Statut du roadbook mis à jour: ${status}`);
            getMyRoadbooks(); // Rafraîchir la liste
        }
    } catch (error) {
        console.error('Update roadbook status error:', error);
    }
}

// Assigner un guide à un roadbook
async function assignGuide() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('roadbook-id').value;
        const guideId = document.getElementById('guide-id').value;
        
        if (!roadbookId || !guideId) {
            alert('ID du roadbook et ID du guide requis');
            return;
        }
        
        const result = await apiRequest(`/roadbooks/${roadbookId}/guide`, 'POST', {
            guideId
        });
        
        if (result.status === 'success') {
            alert('Guide assigné avec succès!');
        }
    } catch (error) {
        console.error('Assign guide error:', error);
    }
}

// ======== FONCTIONS SESSIONS ========

// Récupérer les sessions d'un roadbook
async function getRoadbookSessions() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('sessions-roadbook-id').value;
        
        if (!roadbookId) {
            alert('ID du roadbook requis');
            return;
        }
        
        const result = await apiRequest(`/roadbooks/${roadbookId}/sessions`, 'GET');
        
        if (result.status === 'success' && result.data) {
            renderSessionsList(result.data);
        }
    } catch (error) {
        console.error('Get sessions error:', error);
    }
}

// Afficher la liste des sessions
function renderSessionsList(sessions) {
    const container = document.getElementById('sessions-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!sessions || sessions.length === 0) {
        container.innerHTML = '<p>Aucune session trouvée</p>';
        return;
    }
    
    let html = '';
    
    sessions.forEach(session => {
        // Formater la date
        const sessionDate = new Date(session.date).toLocaleDateString();
        
        // Formater l'heure de début/fin
        const startTime = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        
        // Formater la durée
        const duration = session.duration ? `${Math.floor(session.duration / 60)}h${(session.duration % 60).toString().padStart(2, '0')}` : 'N/A';
        
        html += `
            <div class="list-item">
                <div class="list-item-title">
                    Session du ${sessionDate}
                    ${session.validatorId ? '<span class="badge badge-success">Validée</span>' : ''}
                </div>
                <div>
                    <span class="badge badge-primary">Début: ${startTime}</span>
                    <span class="badge">${endTime !== 'N/A' ? `Fin: ${endTime}` : ''}</span>
                    <span class="badge">${duration !== 'N/A' ? `Durée: ${duration}` : ''}</span>
                    ${session.distance ? `<span class="badge">Distance: ${session.distance}km</span>` : ''}
                </div>
                <div style="margin-top: 5px;">
                    ${session.weather ? `<span class="badge">Météo: ${session.weather}</span>` : ''}
                    ${session.daylight ? `<span class="badge">Luminosité: ${session.daylight}</span>` : ''}
                </div>
                ${session.notes ? `<p style="margin-top: 10px;"><small>Notes:</small> ${session.notes}</p>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = `<div class="list-group">${html}</div>`;
}

// Créer une nouvelle session
async function createSession() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('session-roadbook-id').value;
        const date = document.getElementById('session-date').value;
        const startTime = document.getElementById('session-start-time').value;
        const endTime = document.getElementById('session-end-time').value;
        const duration = document.getElementById('session-duration').value;
        const startLocation = document.getElementById('session-start-location').value;
        const endLocation = document.getElementById('session-end-location').value;
        const distance = document.getElementById('session-distance').value;
        const weather = document.getElementById('session-weather').value;
        const daylight = document.getElementById('session-daylight').value;
        const notes = document.getElementById('session-notes').value;
        
        if (!roadbookId || !date || !startTime) {
            alert('Roadbook ID, date et heure de début sont requis');
            return;
        }
        
        // Construire les dates complètes
        const datePart = new Date(date).toISOString().split('T')[0];
        
        const startDateTime = `${datePart}T${startTime}:00`;
        const endDateTime = endTime ? `${datePart}T${endTime}:00` : null;
        
        const data = {
            roadbookId,
            date: new Date(date).toISOString(),
            startTime: new Date(startDateTime).toISOString(),
            endTime: endDateTime ? new Date(endDateTime).toISOString() : null,
            duration: duration ? parseInt(duration) : null,
            startLocation,
            endLocation,
            distance: distance ? parseFloat(distance) : null,
            weather,
            daylight,
            notes,
            // La route définira l'apprentice comme l'utilisateur actuel
        };
        
        const result = await apiRequest(`/roadbooks/${roadbookId}/sessions`, 'POST', data);
        
        if (result.status === 'success') {
            alert('Session créée avec succès!');
            
            // Mettre à jour la liste des sessions si on est sur la même page
            if (document.getElementById('sessions-roadbook-id').value === roadbookId) {
                getRoadbookSessions();
            }
        }
    } catch (error) {
        console.error('Create session error:', error);
    }
}

// ======== FONCTIONS COMPÉTENCES ========

// Récupérer la progression des compétences
async function getCompetencyProgress() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('competencies-roadbook-id').value;
        
        if (!roadbookId) {
            alert('ID du roadbook requis');
            return;
        }
        
        const result = await apiRequest(`/roadbooks/${roadbookId}/competencies`, 'GET');
        
        if (result.status === 'success') {
            renderCompetencyList(result.data || []);
        }
    } catch (error) {
        console.error('Get competency progress error:', error);
    }
}

// Afficher la liste des compétences
function renderCompetencyList(competencies) {
    const container = document.getElementById('competency-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!competencies || competencies.length === 0) {
        container.innerHTML = '<p>Aucune compétence trouvée</p>';
        return;
    }
    
    let html = '';
    
    competencies.forEach(competency => {
        // Déterminer le style en fonction du statut
        let statusBadgeClass = 'badge-primary';
        let statusText = competency.status || 'NOT_STARTED';
        
        if (statusText === 'MASTERED') {
            statusBadgeClass = 'badge-success';
        } else if (statusText === 'IN_PROGRESS') {
            statusBadgeClass = 'badge-warning';
        } else {
            statusBadgeClass = 'badge-secondary';
        }
        
        // Utiliser le statut localisé
        const statusMap = {
            'NOT_STARTED': 'Non commencé',
            'IN_PROGRESS': 'En cours',
            'MASTERED': 'Maîtrisé'
        };
        
        html += `
            <div class="list-item">
                <div class="list-item-title">
                    ${competency.competency?.name || 'Compétence'} 
                    <span class="badge ${statusBadgeClass}">${statusMap[statusText] || statusText}</span>
                </div>
                <p>${competency.competency?.description || ''}</p>
                ${competency.notes ? `<p style="margin-top: 10px;"><small>Notes:</small> ${competency.notes}</p>` : ''}
                <div style="margin-top: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="fillCompetencyId('${competency.competencyId || competency.id}')">Modifier</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `<div class="list-group">${html}</div>`;
}

// Remplir l'ID de compétence dans le formulaire
function fillCompetencyId(id) {
    const field = document.getElementById('competency-id');
    if (field) field.value = id;
}

// Mettre à jour le statut d'une compétence
async function updateCompetencyStatus() {
    try {
        if (!accessToken) {
            alert('Veuillez vous connecter d\'abord');
            return;
        }
        
        const roadbookId = document.getElementById('competency-roadbook-id').value;
        const competencyId = document.getElementById('competency-id').value;
        const status = document.getElementById('competency-status').value;
        const notes = document.getElementById('competency-notes').value;
        
        if (!roadbookId || !competencyId || !status) {
            alert('ID du roadbook, ID de la compétence et statut sont requis');
            return;
        }
        
        const result = await apiRequest(`/roadbooks/${roadbookId}/competencies/${competencyId}`, 'PATCH', {
            status,
            notes
        });
        
        if (result.status === 'success') {
            alert('Statut de la compétence mis à jour avec succès!');
            
            // Mettre à jour la liste si sur la même page
            if (document.getElementById('competencies-roadbook-id').value === roadbookId) {
                getCompetencyProgress();
            }
        }
    } catch (error) {
        console.error('Update competency status error:', error);
    }
}