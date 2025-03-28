import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  Image,
  Dimensions 
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Trophy, Medal, Flame, Clock, Award } from 'lucide-react-native';

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

  // Helper function to format the "last_updated" date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to truncate long names
  const truncateName = (name: string, maxLength: number = 15): string => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  // Helper function to format score with max 1 decimal place
  const formatScore = (score: number): string => {
    return score.toFixed(1).replace(/\.0$/, '');
  };

  // Helper function to get rank icon
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy size={20} color="#FFD700" />;
      case 2:
        return <Medal size={20} color="#C0C0C0" />;
      case 3:
        return <Medal size={20} color="#CD7F32" />;
      default:
        return <Text style={styles.rankText}>{rank}</Text>;
    }
  };

  // Helper function to determine if entry is the current user
  const isCurrentUser = (entry: LeaderboardEntry): boolean => {
    return entry.user_id === userId;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Trophy size={28} color="#2E664A" />
        <Text style={styles.header}>Leaderboard</Text>
      </View>
      <Text style={styles.subHeader}>See how you stack up against your circle!</Text>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#2E664A" style={styles.loader} />
        ) : filteredLeaderboard.length > 0 ? (
          <>
            {/* Top 3 Podium (if available) */}
            {filteredLeaderboard.length >= 2 && (
              <View style={styles.podiumContainer}>
                {filteredLeaderboard
                  .sort((a, b) => a.rank - b.rank)
                  .slice(0, Math.min(3, filteredLeaderboard.length))
                  .map((entry, index) => {
                    const name = entry.user_id === currentUser?.user_id 
                      ? currentUser.name 
                      : friendDetails[entry.user_id]?.name || "Unknown";
                    const profilePic = entry.user_id === currentUser?.user_id 
                      ? currentUser.profile_picture 
                      : friendDetails[entry.user_id]?.profile_picture || 'https://via.placeholder.com/40';
                    
                    // Determine podium position styles
                    const podiumStyles = [styles.podiumFirst, styles.podiumSecond, styles.podiumThird];
                    const podiumHeights = [100, 80, 60];
                    
                    return (
                      <View key={entry._id} style={[
                        styles.podiumItem,
                        podiumStyles[index],
                        { height: podiumHeights[index] }
                      ]}>
                        <View style={styles.podiumContent}>
                          <Image source={{ uri: profilePic }} style={styles.podiumAvatar} />
                          <Text style={styles.podiumRank}>{index + 1}</Text>
                          <Text style={styles.podiumName}>{truncateName(name, 10)}</Text>
                          <View style={styles.podiumScoreContainer}>
                            <Text style={styles.podiumScore}>{formatScore(entry.hunger_score)}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}

            {/* Detailed Table */}
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.headerCell, styles.rankCell]}>Rank</Text>
                <Text style={[styles.tableCell, styles.headerCell, styles.nameCell]}>Name</Text>
                <Text style={[styles.tableCell, styles.headerCell, styles.scoreCell]}>Score</Text>
                <Text style={[styles.tableCell, styles.headerCell, styles.streakCell]}>Streak</Text>
                <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Updated</Text>
              </View>
              
              {/* Table Rows */}
              {filteredLeaderboard
                .sort((a, b) => a.rank - b.rank)
                .map((entry) => (
                  <View 
                    key={entry._id} 
                    style={[
                      styles.tableRow, 
                      isCurrentUser(entry) && styles.currentUserRow
                    ]}
                  >
                    <View style={[styles.tableCell, styles.rankCell]}>
                      {getRankIcon(entry.rank)}
                    </View>
                    <View style={[styles.tableCell, styles.nameCell]}>
                      <Image 
                        source={{ 
                          uri: entry.user_id === currentUser?.user_id 
                            ? currentUser.profile_picture 
                            : friendDetails[entry.user_id]?.profile_picture || 'https://via.placeholder.com/40'
                        }}
                        style={styles.avatar}
                      />
                      <Text 
                        style={[
                          styles.nameText,
                          isCurrentUser(entry) && styles.currentUserText
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {truncateName(
                          entry.user_id === currentUser?.user_id 
                            ? currentUser.name 
                            : friendDetails[entry.user_id]?.name || "Unknown"
                        )}
                      </Text>
                    </View>
                    <Text 
                      style={[
                        styles.tableCell, 
                        styles.scoreCell,
                        isCurrentUser(entry) && styles.currentUserText
                      ]}
                    >
                      {formatScore(entry.hunger_score)}
                    </Text>
                    <View style={[styles.tableCell, styles.streakCell]}>
                      <Text 
                        style={[
                          styles.streakText,
                          isCurrentUser(entry) && styles.currentUserText
                        ]}
                      >
                        {entry.streak}
                      </Text>
                      {entry.streak > 0 && <Flame size={14} color={isCurrentUser(entry) ? "#fff" : "#FF6B00"} />}
                    </View>
                    <Text 
                      style={[
                        styles.tableCell, 
                        styles.dateCell,
                        isCurrentUser(entry) && styles.currentUserText
                      ]}
                    >
                      {formatDate(entry.last_updated)}
                    </Text>
                  </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Trophy size={60} color="#5E8C7B" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No leaderboard data available.</Text>
            <Text style={styles.emptySubText}>Invite friends to your circle to compete!</Text>
          </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E664A',
    marginLeft: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#5E8C7B',
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
  // Podium styles
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    height: 140,
  },
  podiumItem: {
    width: 80,
    marginHorizontal: 5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-end',
  },
  podiumFirst: {
    backgroundColor: '#FFD700',
    zIndex: 3,
  },
  podiumSecond: {
    backgroundColor: '#C0C0C0',
    zIndex: 2,
  },
  podiumThird: {
    backgroundColor: '#CD7F32',
    zIndex: 1,
  },
  podiumContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  podiumAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 4,
  },
  podiumRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  podiumScoreContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  podiumScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Table styles
  table: {
    borderWidth: 1,
    borderColor: '#EFF5F1',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
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
    fontSize: 14,
    color: '#2E664A',
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 4,
  },
  rankCell: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  scoreCell: {
    flex: 0.8,
  },
  streakCell: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCell: {
    flex: 1,
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
    flex: 1,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E664A',
  },
  streakText: {
    marginRight: 4,
  },
  currentUserRow: {
    backgroundColor: '#2E664A',
  },
  currentUserText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#5E8C7B',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    color: '#5E8C7B',
    fontSize: 14,
  },
});

export default LeaderboardScreen;
