import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Search, User } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the navigation types
type RootStackParamList = {
  SearchUsers: undefined;
  UserProfile: { userId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchUsers() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Array<{
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  }>>([]);
  const [filteredUsers, setFilteredUsers] = useState<Array<{
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all users from the provided endpoint
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.1.2:550/users/');
      const data = await response.json();
      // Map the response data using user.user_id
      const mappedUsers = data.map((user: any) => ({
        id: user.user_id,
        name: user.name,
        username: user.username,
        avatar: user.profile_picture || null,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(text.toLowerCase()) ||
      user.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Navigate to user profile
  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const displayedUsers = searchQuery ? filteredUsers : users;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Search size={20} color="#64748b" strokeWidth={2} />
            <TextInput 
              style={styles.textInput}
              placeholder="Search User"
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        )}

        {/* User List */}
        {displayedUsers.map((user) => (
          <TouchableOpacity 
            key={user.id} 
            style={styles.userCard}
            onPress={() => handleUserPress(user.id)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <User size={22} color="#64748b" strokeWidth={2} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>@{user.username}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* No Results */}
        {searchQuery && displayedUsers.length === 0 && !isLoading && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No users found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    color: '#0f172a',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  userHandle: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
});
