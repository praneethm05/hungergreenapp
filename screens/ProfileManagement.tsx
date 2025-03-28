import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Platform,
  ImageBackground,
  Dimensions,
  Modal,
  TextInput,
  Image,
  ScrollView
} from 'react-native';
import { User, Settings, Edit2, Camera, Utensils, AlertTriangle, LogOut } from 'lucide-react-native';
import { useUser, useClerk } from '@clerk/clerk-react';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// --- API Configuration ---
const apiConfig = {
  'Change Profile Picture': { url: 'http://192.168.1.4:550/users/profilePicture/', method: 'PUT' },
  'Change Diet Preference': { url: 'http://192.168.1.4:550/users/dietType/', method: 'PUT' },
  'Delete Account': { url: 'http://192.168.1.4:550/users/', method: 'DELETE' },
};

const allowedDietTypes = ["Vegetarian", "Eggetarian", "Nonvegetarian"];

const placeholders = {
  'Change Profile Picture': 'Enter new profile picture URL',
  'Change Diet Preference': 'Select new diet preference',
  'Delete Account': 'Type DELETE to confirm',
};

// --- ActionModal Component ---
function ActionModal({ visible, action, onClose, userId, clerk }) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setInputValue('');
      setError('');
      setLoading(false);
    }
  }, [visible]);

  const renderInput = () => {
    if (action === 'Change Diet Preference') {
      return (
        <View style={modalStyles.selectionContainer}>
          {allowedDietTypes.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setInputValue(type)}
              style={[
                modalStyles.selectionItem,
                inputValue === type && modalStyles.selectionItemSelected
              ]}
            >
              <Text style={modalStyles.selectionText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    } else {
      return (
        <TextInput
          style={modalStyles.input}
          placeholder={placeholders[action] || 'Enter value'}
          value={inputValue}
          onChangeText={setInputValue}
          placeholderTextColor="#9ca3af"
        />
      );
    }
  };

  const handleSubmit = async () => {
    if (action === 'Delete Account' && inputValue !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    if (action !== 'Delete Account' && inputValue.trim() === '') {
      setError('Please enter a value');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (action === 'Delete Account') {
        const response = await fetch(apiConfig[action].url + userId, {
          method: apiConfig[action].method,
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error('Request failed');
        }
        await clerk.user.delete();
        onClose();
        return;
      }
      let payload = {};
      if (action === 'Change Profile Picture') {
        payload = { profile_picture: inputValue };
      } else if (action === 'Change Diet Preference') {
        payload = { diet_type: inputValue };
      } else {
        payload = { value: inputValue };
      }
      const response = await fetch(apiConfig[action].url + userId, {
        method: apiConfig[action].method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>{action}</Text>
          {renderInput()}
          {error ? <Text style={modalStyles.errorText}>{error}</Text> : null}
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={modalStyles.cancelButton}>
              <Text style={modalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={modalStyles.submitButton}>
              <Text style={modalStyles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2E664A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f9fafb',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  selectionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
  },
  selectionItemSelected: {
    borderColor: '#2E664A',
    backgroundColor: '#e0f2f1',
  },
  selectionText: {
    fontSize: 16,
    color: '#374151',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#9ca3af',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2E664A',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

// --- Main ProfileSettings Component ---
export default function ProfileSettings() {
  const { user } = useUser();
  const clerk = useClerk();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [leaderboardInfo, setLeaderboardInfo] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      const userId = user.id;
      fetch(`http://192.168.1.4:550/users/${userId}`)
        .then(response => response.json())
        .then(data => setProfileData(data))
        .catch(err => console.error("Error fetching user data: ", err));
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      const userId = user.id;
      fetch(`http://192.168.1.4:550/leaderboard/info/${userId}`)
        .then(response => response.json())
        .then(data => setLeaderboardInfo(data))
        .catch(err => console.error("Error fetching leaderboard info: ", err));
    }
  }, [user]);

  const menuItems = [
    { title: 'Change Name', icon: <Edit2 size={20} color="#2E664A" />, danger: false },
    { title: 'Change Username', icon: <Edit2 size={20} color="#2E664A" />, danger: false },
    { title: 'Change Credentials', icon: <Settings size={20} color="#2E664A" />, danger: false },
    { title: 'Change Profile Picture', icon: <Camera size={20} color="#2E664A" />, danger: false },
    { title: 'Change Diet Preference', icon: <Utensils size={20} color="#2E664A" />, danger: false },
    { title: 'Delete Account', icon: <AlertTriangle size={20} color="#dc2626" />, danger: true }
  ];

  const handleSignOut = async () => {
    try {
      await clerk.signOut();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getScoreColor = (score: number): [string, string] => {
    if (score >= 80) return ['#4ade80', '#16a34a'];
    if (score >= 60) return ['#facc15', '#eab308'];
    return ['#fb7185', '#e11d48'];
  };

  const circleCount = profileData && Array.isArray(profileData.circle) ? profileData.circle.length : 0;
  const streak = leaderboardInfo && typeof leaderboardInfo.streak === 'number' ? leaderboardInfo.streak : 0;
  const hungerScore = leaderboardInfo && typeof leaderboardInfo.hunger_score === 'number' ? leaderboardInfo.hunger_score : 0;

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(46, 102, 74, 0.9)', 'rgba(46, 102, 74, 0.8)']}
            style={styles.headerGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#4ade80', '#22c55e']}
                  style={styles.avatarGradientBorder}
                >
                  {profileData && profileData.profile_picture ? (
                    <Image 
                      source={{ uri: profileData.profile_picture }}
                      style={styles.avatar}
                    />
                  ) : (
                    <User size={36} color="#1e3a29" strokeWidth={1.5} />
                  )}
                </LinearGradient>
              </View>
              <Text style={styles.name}>{profileData ? profileData.name : 'Loading...'}</Text>
              <Text style={styles.username}>{profileData ? profileData.username : ''}</Text>
              <Text style={styles.userSince}>Member since {profileData ? profileData.since || '2024' : ''}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.statsOuterContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{circleCount}</Text>
              <Text style={styles.statLabel}>Circle</Text>
            </View>
            <View style={styles.statsVerticalDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statsVerticalDivider} />
            <View style={styles.statItem}>
              <LinearGradient
                colors={getScoreColor(hungerScore)}
                style={styles.scoreCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.scoreText}>
                  {typeof hungerScore === 'number' ? hungerScore.toFixed(0) : '0'}
                </Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Hunger Score</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Settings</Text>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuGridItem, item.danger && styles.dangerItem]}
              onPress={() => {
                setCurrentAction(item.title);
                setModalVisible(true);
              }}
            >
              <View style={styles.menuItemIcon}>{item.icon}</View>
              <Text style={[styles.menuText, item.danger && styles.dangerText]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <ActionModal 
          visible={modalVisible} 
          action={currentAction} 
          onClose={() => setModalVisible(false)} 
          userId={user ? user.id : ''} 
          clerk={clerk}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 20,
  },
  headerBackground: {
    height: 340,
  },
  headerBackgroundImage: {
    opacity: 0.7,
  },
  headerGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradientBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#ddf0e8',
    marginBottom: 6,
  },
  userSince: {
    fontSize: 14,
    color: '#ddf0e8',
    opacity: 0.8,
    marginBottom: 45,
  },
  statsOuterContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10, // Changed from -40 to a positive margin for spacing
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E664A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#5E8C7B',
    fontWeight: '500',
    textAlign: 'center',
  },
  statsVerticalDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  menuGridItem: {
    backgroundColor: '#ffffff',
    width: width > 400 ? '48%' : '100%',
    paddingVertical: 18,
    marginBottom: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 70,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f9f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    fontSize: 16,
    color: '#2E664A',
    fontWeight: '500',
    flex: 1,
  },
  dangerText: {
    color: '#dc2626',
  },
  dangerItem: {
    backgroundColor: '#fff5f5',
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    marginTop: 16,
    marginBottom: 40,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
