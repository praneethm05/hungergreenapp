import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { User, Bell } from 'lucide-react-native';

export default function ProfileSettings() {
  const profileData = {
    name: 'Adithyan RK',
    username: '@adithyanrk',
    since: '2024',
    stats: {
      circle: 200,
      streak: 365,
      favFood: 'Pizza',
      rating: 3
    }
  };

  const menuItems = [
    { title: 'Change Name', danger: false },
    { title: 'Change Username', danger: false },
    { title: 'Change Credentials', danger: false },
    { title: 'Change Profile Picture', danger: false },
    { title: 'Change Diet Preference', danger: false },
    { title: 'Delete Account', danger: true }
  ];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <SafeAreaView style={styles.container}>
   

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={32} color="#64748b" strokeWidth={2} />
          </View>
        </View>
        
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.userSince}>user since {profileData.since}</Text>
        <Text style={styles.username}>{profileData.username}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.stats.circle}</Text>
            <Text style={styles.statLabel}>Circle</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.stats.streak}</Text>
            <Text style={styles.statLabel}>Top Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.stats.favFood}</Text>
            <Text style={styles.statLabel}>Fav Food</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.ratingValue}>{renderStars(profileData.stats.rating)}</Text>
            <Text style={styles.statLabel}>Hunger Rating</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => console.log(`Pressed: ${item.title}`)}
          >
            <Text style={[
              styles.menuText,
              item.danger && styles.dangerText
            ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#f8fafc',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  userSince: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 16,
    color: '#16A34A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '500',
  },
  dangerText: {
    color: '#dc2626',
  },
});