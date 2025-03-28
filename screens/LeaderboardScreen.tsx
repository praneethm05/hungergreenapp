import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  Image 
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';

interface LeaderboardEntry {
  _id: string;
  user_id: string;
  hunger_score: number;
  last_updated: string;
  rank: number;
  streak: number;
  name?: string;
}

interface UserDetails {
  _id: string;
  user_id: string;
  name: string;
  username: string;
  email: string;
  profile_picture: string;
  circle: string[];
}

interface FriendData {
  name: string;
  profile_picture: string;
}

const LeaderboardScreen = () => {
  const { user } = useUser();
  const userId = user?.id;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [circleIds, setCircleIds] = useState<string[]>([]);
  // Cache friend details by matching user_id
  const [friendDetails, setFriendDetails] = useState<{ [key: string]: FriendData }>({});

  // 1. Fetch current user's details from the users API
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`http://192.168.1.4:550/users/${userId}`);
        const data: UserDetails = await response.json();
        setCurrentUser(data);
        // Use the "circle" field from the fetched user details
        setCircleIds(data.circle || []);
      } catch (error) {
        console.error('Error fetching current user details:', error);
      }
    };
    if (userId) fetchCurrentUser();
  }, [userId]);

  // 2. Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`http://192.168.1.4:550/leaderboard/leaderboard`);
        const data: LeaderboardEntry[] = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // 3. Filter leaderboard to include only the current user and users in the current user's circle
  const filteredLeaderboard = leaderboard.filter((entry) => {
    return entry.user_id === userId || circleIds.includes(entry.user_id);
  });

  // 4. For each entry that isn’t the current user, fetch friend details if not already cached
  useEffect(() => {
    const fetchFriendDetails = async () => {
      const details: { [key: string]: FriendData } = { ...friendDetails };
      const promises = filteredLeaderboard.map(async (entry) => {
        if (entry.user_id !== currentUser?.user_id && !details[entry.user_id]) {
          try {
            const response = await fetch(`http://192.168.1.4:550/users/${entry.user_id}`);
            const data: UserDetails = await response.json();
            details[entry.user_id] = {
              name: data.name,
              profile_picture: data.profile_picture,
            };
          } catch (error) {
            console.error("Error fetching friend details for user_id:", entry.user_id, error);
          }
        }
      });
      await Promise.all(promises);
      setFriendDetails(details);
    };
    if (filteredLeaderboard.length > 0) {
      fetchFriendDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLeaderboard, currentUser]);

  // 5. Helper function to format the "last_updated" date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Leaderboard</Text>
        <Text style={styles.subHeader}>See how you stack up against your circle!</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2E664A" />
        ) : filteredLeaderboard.length > 0 ? (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.headerCell]}>Rank</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Name</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Score</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Streak</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Updated</Text>
            </View>
            {/* Table Rows */}
            {filteredLeaderboard
              .sort((a, b) => a.rank - b.rank)
              .map((entry) => (
                <View key={entry._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{entry.rank}</Text>
                  <View style={[styles.tableCell, styles.nameCell]}>
                    <Image 
                      source={{ 
                        uri: entry.user_id === currentUser?.user_id 
                          ? currentUser.profile_picture 
                          : friendDetails[entry.user_id]?.profile_picture || 'https://via.placeholder.com/40'
                      }}
                      style={styles.avatar}
                    />
                    <Text style={styles.nameText}>
                      {entry.user_id === currentUser?.user_id 
                        ? currentUser.name 
                        : friendDetails[entry.user_id]?.name || "Unknown"}
                    </Text>
                  </View>
                  <Text style={styles.tableCell}>{entry.hunger_score}</Text>
                  <Text style={styles.tableCell}>{entry.streak}</Text>
                  <Text style={styles.tableCell}>{formatDate(entry.last_updated)}</Text>
                </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No leaderboard data available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F6F9F7' 
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E664A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#5E8C7B',
    marginBottom: 16,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#EFF5F1',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF5F1',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#EFF5F1',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#2E664A',
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: '600',
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  nameText: {
    fontSize: 14,
    color: '#2E664A',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#5E8C7B',
    fontSize: 16,
    marginTop: 20,
  },
});

export default LeaderboardScreen;
