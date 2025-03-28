import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  Platform,
  ImageBackground,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { User, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-react';

// Define your stack param list
type RootStackParamList = {
  UserProfile: { userId: string };
};

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

const { width } = Dimensions.get('window');

export default function UserProfile() {
  const route = useRoute<UserProfileRouteProp>();
  const { userId } = route.params;
  const { user: currentUser } = useUser();

  const [profileData, setProfileData] = useState<any>(null);
  const [leaderboardInfo, setLeaderboardInfo] = useState<any>(null);
  const [isFriend, setIsFriend] = useState(false);

  // Fetch user details with friend check
  useEffect(() => {
    if (userId) {
      fetch(`http://192.168.1.4:550/users/${userId}`)
        .then(response => response.json())
        .then(data => {
          console.log("User data:", data); // Log user data
          console.log("Circle data:", data.circle); // Log circle data
          setProfileData(data);
          if (currentUser && data.circle?.includes(currentUser.id)) {
            setIsFriend(true);
          } else {
            setIsFriend(false); // Ensure isFriend is false if not in circle
          }
        })
        .catch(err => console.error("Error fetching user data: ", err));
    }
  }, [userId, currentUser]);

  // Fetch leaderboard info (streak and hunger_score)
  useEffect(() => {
    if (userId) {
      fetch(`http://192.168.1.4:550/leaderboard/info/${userId}`)
        .then(response => response.json())
        .then(data => {
          console.log("Leaderboard info:", data); // Log leaderboard info
          setLeaderboardInfo(data);
        })
        .catch(err => console.error("Error fetching leaderboard info: ", err));
    }
  }, [userId]);

  // Unified friend action handler
  const handleFriendAction = async () => {
    try {
      const endpoint = isFriend ? 'delete' : 'add'; // Use 'delete' for removing
      const method = isFriend ? 'DELETE' : 'POST';
      
      const response = await fetch(`http://192.168.1.4:550/user/circle/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id,
          friend_id: userId,
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from server: ${errorText}`);
        throw new Error(`Failed to ${endpoint} friend`);
      }
  
      const responseData = await response.json();
      console.log(`Friend action response (${endpoint}):`, responseData);
  
      setIsFriend(!isFriend);
    } catch (error) {
      console.error(`Error ${isFriend ? 'removing' : 'adding'} friend:`, error);
    }
  };

  // Calculate circle count from profile data
  const circleCount = profileData && Array.isArray(profileData.circle) ? profileData.circle.length : 0;
  const streak = leaderboardInfo ? leaderboardInfo.streak : 0;
  const hungerScore = leaderboardInfo ? leaderboardInfo.hunger_score : 0;

  // Helper to return a tuple for LinearGradient colors based on hunger score
  const getScoreColor = (score: number): [string, string] => {
    if (score >= 80) return ['#4ade80', '#16a34a'];
    if (score >= 60) return ['#facc15', '#eab308'];
    return ['#fb7185', '#e11d48'];
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(46, 102, 74, 0.9)', 'rgba(46, 102, 74, 0.8)'] as const}
            style={styles.headerGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#4ade80', '#22c55e'] as const}
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
              <Text style={styles.name}>
                {profileData ? profileData.name : 'Loading...'}
              </Text>
              <Text style={styles.username}>
                {profileData ? profileData.username : ''}
              </Text>
              <Text style={styles.userSince}>
                Member since {profileData ? profileData.since || '2025' : ''}
              </Text>
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
                <Text style={styles.scoreText}>{typeof hungerScore === 'number' ? hungerScore.toFixed(0) : '0'}</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Hunger Score</Text>
            </View>
          </View>
        </View>

        {/* Friend action button */}
        {currentUser && profileData && currentUser.id !== profileData.user_id && (
          <View style={styles.friendSection}>
            {isFriend && (
              <Text style={styles.friendStatusText}>Already in your Circle</Text>
            )}
            <TouchableOpacity 
              style={[
                styles.addCircleButton, 
                isFriend && styles.removeButton
              ]} 
              onPress={handleFriendAction}
            >
              <UserPlus size={20} color="#fff" style={styles.addCircleIcon} />
              <Text style={styles.addCircleButtonText}>
                {isFriend ? "Remove from Circle" : "Add to Circle"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#ddf0e8',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
    marginBottom: 3,
  },
  userSince: {
    fontSize: 14,
    color: '#ddf0e8',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
    opacity: 0.8,
    marginBottom: 10,
  },
  statsOuterContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E664A',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#5E8C7B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
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
    marginBottom: 8,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    textAlign: 'center',
  },
  addCircleButton: {
    backgroundColor: '#2E664A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCircleIcon: {
    marginRight: 8,
  },
  addCircleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  friendSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  friendStatusText: {
    color: '#2E664A',
    fontSize: 14,
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#dc2626',
  },
});
