import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  ImageBackground,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, User, Bell, Lock, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useClerk } from '@clerk/clerk-react';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut } = useClerk();

  const menuSections = [
    {
      title: 'Profile',
      items: [
        { 
          icon: <User size={20} color="#2E664A" />, 
          label: 'Edit Profile', 
          onPress: () => navigation.navigate('Profile'as never)
        },
        // { icon: <Bell size={20} color="#2E664A" />, label: 'Notifications' }
      ]
    },
    // REMOVED PREFERENCES SECTION
    {
      title: 'Support',
      items: [
        { 
          icon: <HelpCircle size={20} color="#2E664A" />, 
          label: 'Help Center',
          onPress: () => navigation.navigate('Feedback' as never)
        },
        { 
          icon: <LogOut size={20} color="#dc2626" />, 
          label: 'Log Out', 
          danger: true,
          onPress: () => signOut()
        }
      ]
    }
  ];

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.container}>
        {/* Fixed header with proper gradient */}
      

        <View style={styles.contentContainer}>
          {menuSections.map((section, index) => (
            <View key={index} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex}
                  style={[styles.menuItem, item.danger && styles.dangerItem]}
                  activeOpacity={0.7}
                  onPress={item.onPress || (() => {})} // Fallback for empty handlers
                >
                  <View style={styles.menuItemContent}>
                    {item.icon}
                    <Text style={[styles.menuItemText, item.danger && styles.dangerText]}>
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={item.danger ? '#dc2626' : '#64748b'} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    flex: 1
  },
  headerBackground: {
    height: 160
  },
  headerBackgroundImage: {
    opacity: 0.8
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Bold' : 'sans-serif-medium',
    letterSpacing: 1.2
  },
  contentContainer: {
    padding: 20
  },
  sectionContainer: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#1e293b',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif'
  },
  dangerItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626'
  },
  dangerText: {
    color: '#dc2626'
  }
});