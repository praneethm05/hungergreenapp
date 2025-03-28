import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image
} from 'react-native';
import MealDetailsModal from '../components/MealDetailsModal';
import ReanimatedSwipeable from 'react-native-gesture-handler/Swipeable';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Camera, Sun, Send, User, TrendingUp } from 'lucide-react-native';
import { IllnessCauseCard } from '../components/IllnessBox';
import { AlertBox } from '../components/alertBox';
import { RecordIllnessForm } from '../components/IllnessForm';
import { useUser } from "@clerk/clerk-expo";
import { Circle } from 'react-native-svg';

const Dashboard = () => {
  const navigation = useNavigation<any>();
  const [meal, setMeal] = useState<string>('');
  const [hungerScore, setHungerScore] = useState<number>(75);
  const [streak, setStreak] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [lastMealInfo, setLastMealInfo] = useState<any>(null);
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  // New state variable to force re-render AlertBox
  const [alertBoxKey, setAlertBoxKey] = useState<number>(0);
  // New state for illness analysis data and its visibility
  const [illnessData, setIllnessData] = useState<any>(null);
  const [showIllnessCard, setShowIllnessCard] = useState<boolean>(false);
  const [circleFriends, setCircleFriends] = useState<Array<{ id: string, name: string,avatar: string | null }>>([]);

  const { user } = useUser();
  const userId = user?.id;

  // Helper to format illness date
  const formatIllnessDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const fetchCircleFriends = useCallback(async () => {
    try {
      const userResponse = await fetch(`http://192.168.1.4:550/users/${userId}`);
      const userData = await userResponse.json();
      const friendIds = userData.circle || [];
     

      const friendDetailsPromises = friendIds.map(async (friendId: string) => {
        const friendResponse = await fetch(`http://192.168.1.4:550/users/${friendId}`);
        const friendData = await friendResponse.json();
        return { id: friendId, name: friendData.name ,avatar: friendData.profile_picture };
      });

      const friends = await Promise.all(friendDetailsPromises);
      setCircleFriends(friends);
    } catch (error) {
      console.error("Error fetching circle friends: ", error);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchCircleFriends();
      }
    }, [userId, fetchCircleFriends])
  );

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`http://192.168.1.4:550/users/${userId}`);
        const data = await response.json();
        setUserName(data.name);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    }
    if (userId) fetchUser();
  }, [userId]);

  // Fetch meal history
  useEffect(() => {
    async function fetchMealHistory() {
      try {
        const response = await fetch(`http://192.168.1.4:550/mealHistory/getMeals/${userId}`);
        const data = await response.json();
        setMealHistory(data);
      } catch (error) {
        console.error("Error fetching meal history: ", error);
      }
    }
    if (userId) fetchMealHistory();
  }, [userId]);

  // Enrich meal history if nutrition info is missing
  useEffect(() => {
    async function enrichMealHistory() {
      const enriched = await Promise.all(
        mealHistory.map(async (meal) => {
          if (!meal.nutrition) {
            try {
              const response = await fetch(`http://192.168.1.4:550/mealSearch/getMeal/${meal.meal_id}`);
              const mealSearchData = await response.json();
              return {
                ...meal,
                nutrition: mealSearchData.nutrition_info,
                score: mealSearchData.health_score,
                feedback: mealSearchData.feedback
              };
            } catch (error) {
              console.error("Error enriching meal:", error);
              return meal;
            }
          } else {
            return meal;
          }
        })
      );
      setMealHistory(enriched);
    }
    if (mealHistory.length > 0) {
      enrichMealHistory();
    }
  }, [mealHistory.length]);

  // Fetch suggestion on mount
  useEffect(() => {
    const refreshSuggestion = async () => {
      try {
        const response = await fetch(`http://192.168.1.4:550/suggestions/${userId}`);
        const data = await response.json();
        setSuggestion(data);
      } catch (error) {
        console.error("Error fetching suggestion: ", error);
      }
    };
    if (userId) refreshSuggestion();
  }, [userId]);

  // Define fetchIllnessAnalysis function once so it can be used in both useEffect and RecordIllnessForm
  const fetchIllnessAnalysis = async () => {
    try {
      const response = await fetch(`http://192.168.1.4:550/illness/analysis/${userId}`);
      const data = await response.json();
      // Check if data has the required fields
      if (data && data.foodItem && data.date && data.illnessName) {
        setIllnessData(data);
        setShowIllnessCard(true);
      } else {
        setIllnessData(null);
        setShowIllnessCard(false);
      }
    } catch (error) {
      console.error("Error fetching illness analysis: ", error);
      setIllnessData(null);
      setShowIllnessCard(false);
    }
  };

  // Call fetchIllnessAnalysis when userId changes
  useEffect(() => {
    if (userId) {
      fetchIllnessAnalysis();
    }
  }, [userId]);

  // Function to fetch leaderboard info and update hunger score and streak
  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch(`http://192.168.1.4:550/leaderboard/info/${userId}`);
      const data = await response.json();
      setHungerScore(data.hunger_score);
      setStreak(data.streak || 0);
    } catch (error) {
      console.error("Error fetching leaderboard data: ", error);
    }
  };

  // Initial fetch for leaderboard data
  useEffect(() => {
    if (userId) {
      fetchLeaderboardData();
    }
  }, [userId]);

  // Helper function to calculate updated time string for suggestions
  const getUpdatedTime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const diffMs = new Date().getTime() - created.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    if (diffMinutes < 60) {
      return `Updated ${Math.floor(diffMinutes)} minutes ago`;
    }
    const diffHours = diffMinutes / 60;
    if (diffHours < 24) {
      return `Updated ${Math.floor(diffHours)} hours ago`;
    }
    const diffDays = diffHours / 24;
    return `Updated ${Math.floor(diffDays)} days ago`;
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleMealSubmit = async () => {
    if (!meal.trim()) return;
    setLoading(true);
    try {
      // 1. Fetch nutritional info for the meal
      const nutritionResponse = await fetch(
        `http://192.168.1.4:550/nutrition/getnutritioninfo?meal_name=${encodeURIComponent(meal)}`
      );
      const nutritionData = await nutritionResponse.json();
  
      // 2. Prepare new meal entry; assume the POST API returns the unique _id
      const newMealEntry = {
        meal_name: nutritionData.meal_name,
        meal_id: nutritionData._id,
        user_id: userId,
        nutrition: nutritionData.nutrition_info,
        score: nutritionData.health_score,
        feedback: nutritionData.feedback,
        timestamp: new Date().toISOString()
      };
  
     // 3. Log the meal via POST API
const postResponse = await fetch("http://192.168.1.4:550/mealHistory/logMeal", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newMealEntry)
});
const postResult = await postResponse.json();
const updatedMealEntry = { ...newMealEntry, _id: postResult._id };

// 5. Now update the local meal history state after leaderboard update
setMealHistory(prev => [...prev, updatedMealEntry]);
setLastMealInfo(updatedMealEntry);
setModalVisible(true);
setMeal('');

      // 6. Fetch updated leaderboard data
      await fetch(`http://192.168.1.4:550/leaderboard/update/${userId}`, {
        method: 'POST'
      });
      await fetchLeaderboardData();
  
      // 7. Refresh suggestion after logging the meal
      const suggestionResponse = await fetch(`http://192.168.1.4:550/suggestions/${userId}`);
      const suggestionData = await suggestionResponse.json();
      setSuggestion(suggestionData);
  
      // 8. Force AlertBox to re-render by updating its key
      setAlertBoxKey(prev => prev + 1);
  
    } catch (error) {
      console.error("Error logging meal: ", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Updated deletion handler to update leaderboard data after deletion
  const handleDeleteMeal = async (_id: string) => {
    try {
      await fetch(`http://192.168.1.4:550/mealHistory/deleteMeal/${_id}`, {
        method: "DELETE"
      });
      setMealHistory(prev => prev.filter(item => item._id !== _id));
      
      // Update leaderboard data after deletion:
      await fetch(`http://192.168.1.4:550/leaderboard/update/${userId}`, {
        method: 'POST'
      });
      await fetchLeaderboardData();
      
    } catch (error) {
      console.error("Error deleting meal: ", error);
    }
  };

  const recentMeals = mealHistory.slice(-6).reverse();

  const RightAction = (progress: any, dragX: any) => (
    <View style={styles.deleteAction}>
      <Text style={styles.deleteActionText}>Delete</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting and Meal Input */}
        <View style={styles.card}>
          <View style={styles.greetingContainer}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>{userName}</Text>
            </View>
            <Sun size={32} color="#2E664A" strokeWidth={2} />
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="What did you eat?"
                placeholderTextColor="#94a3b8"
                value={meal}
                onChangeText={setMeal}
              />
              <TouchableOpacity
                onPress={handleMealSubmit}
                style={styles.sendButton}
                disabled={loading}
              >
                <Send size={18} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={22} color="#2E664A" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Circle */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Your Circle</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.seeAllButton}>
              <Text style={styles.seeAll}>See Leaderboard</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.circleScrollView}>
            {circleFriends.map((friend) => (
              <View key={friend.id} style={styles.circleItem}>
                <TouchableOpacity >
                        <Image 
                                                      source={{ 
                                                        uri: friend.avatar ,
                                                      }}
                                                      style={styles.avatar}
                                                    />
                </TouchableOpacity>
                <Text style={styles.circleName}>{friend.name}</Text>
              </View>
            ))}
            <View style={styles.circleItem}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Circle')}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.circleName}>Add More</Text>
            </View>
          </ScrollView>
        </View>

        {/* Your Hunger Health */}
        <View style={styles.card}>
          <View style={styles.healthHeader}>
            <View>
              <Text style={styles.title}>Your Hunger Health</Text>
              <Text style={styles.subtitle}>Keep up the good work! 🎯</Text>
            </View>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodButtonText}>Today</Text>
              <TrendingUp size={16} color="#5E8C7B" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.healthContainer}>
  {[
    { value: mealHistory.length.toString(), label: 'Meals Logged', color: '#3E885B', bg: '#EFF5F1' },
    {
      value: parseFloat((hungerScore ?? 0).toString()).toFixed(2),
      label: 'Hunger Score',
      color: '#2E664A',
      bg: '#F0FDF4'
    },
    { value: (streak ?? 0).toString(), label: 'Day Streak', color: '#5E8C7B', bg: '#F6F9F7' },
  ].map((item, index) => {
    return (
      <View key={index} style={{ flex: 1, marginHorizontal: 4 }}>
        {item.label === 'Hunger Score' ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            style={{ flex: 1 }}
            activeOpacity={0.7}
          >
            <View style={[styles.healthItem, { backgroundColor: item.bg }]}>
              <Text style={[styles.healthValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.healthLabel}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.healthItem, { backgroundColor: item.bg, flex: 1 }]}>
            <Text style={[styles.healthValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.healthLabel}>{item.label}</Text>
          </View>
        )}
      </View>
    );
  })}
</View>


        </View>

        {/* Illness Analysis Card with a Close Button */}
        {showIllnessCard && illnessData && (
          <View style={styles.illnessCardWrapper}>
            <TouchableOpacity 
              onPress={() => setShowIllnessCard(false)} 
              style={styles.illnessCardCloseButton}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <IllnessCauseCard
              foodItem={illnessData.foodItem}
              date={formatIllnessDate(illnessData.date)}
              illnessName={illnessData.illnessName}
              reason={illnessData.reason}
            />
          </View>
        )}

        {/* Recent Meals */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Recent Meals</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AllMeals')}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mealList}>
            {recentMeals.length > 0 ? (
              recentMeals.map((mealItem, index) => (
                <ReanimatedSwipeable
                  key={mealItem._id || index}
                  containerStyle={styles.swipeable}
                  friction={2}
                  enableTrackpadTwoFingerGesture
                  rightThreshold={40}
                  renderRightActions={RightAction}
                  onSwipeableOpen={(direction) => {
                    if (direction === 'right') {
                      handleDeleteMeal(mealItem._id);
                    }
                  }}
                >
                  <TouchableOpacity
                    style={styles.mealItem}
                    onPress={() => {
                      setLastMealInfo(mealItem);
                      setModalVisible(true);
                    }}
                  >
                    <View style={styles.mealDetails}>
                      <Text style={styles.mealName}>{mealItem.meal_name}</Text>
                      <Text style={styles.mealTime}>
                        {new Date(mealItem.timestamp || mealItem.time_logged).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <View style={styles.mealScore}>
                      <Text
                        style={[
                          styles.scoreText,
                          {
                            color:
                              mealItem.score >= 80
                                ? '#2E664A'
                                : mealItem.score >= 60
                                ? '#5E8C7B'
                                : '#E57373'
                          }
                        ]}
                      >
                        {mealItem.score}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </ReanimatedSwipeable>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No meals logged yet. Start tracking your nutrition!
              </Text>
            )}
          </View>
        </View>

        {/* Nutrition Tips Section */}
        <View style={styles.card}>
          <Text style={styles.title}>Nutrition Tips</Text>
          <Text style={styles.subtitle}>Based on your recent meals</Text>
          {suggestion ? (
            <View style={styles.tipCard}>
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>{suggestion.suggestion_title}</Text>
                <Text style={styles.tipMessage}>{suggestion.message}</Text>
                {suggestion.createdAt && (
                  <Text style={styles.tipUpdate}>
                    {getUpdatedTime(suggestion.createdAt)}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <ActivityIndicator size="small" color="#2E664A" />
          )}
        </View>

        <AlertBox key={alertBoxKey} />

        <RecordIllnessForm onSubmitSuccess={fetchIllnessAnalysis} />
     
      </ScrollView>

      <MealDetailsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        lastMealInfo={lastMealInfo}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E664A" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9F7' },
  scrollView: { flex: 1, padding: 16 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#5E8C7B',
    marginBottom: 4,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E664A',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  inputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F9F7',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    height: 52,
    color: '#2E664A',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  sendButton: {
    backgroundColor: '#2E664A',
    padding: 10,
    borderRadius: 12,
  },
  cameraButton: {
    backgroundColor: '#EFF5F1',
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  circleScrollView:{
paddingTop:9,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E664A',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 14,
    color: '#5E8C7B',
    marginTop: 4,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  seeAllButton: {
    backgroundColor: '#EFF5F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seeAll: {
    color: '#2E664A',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  circleItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: '#F6F9F7',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    borderWidth:1,
    borderColor:'#E2E8F0',
    shadowRadius: 4,
    elevation: 2,
  },
  circleName: {
    fontSize: 13,
    color: '#5E8C7B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  addButton: {
    width: 56,
    height: 56,
    backgroundColor: '#EFF5F1',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 24,
    color: '#2E664A',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF5F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  periodButtonText: {
    color: '#5E8C7B',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
    marginRight: 4,
  },
  healthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  healthItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    flex: 1,
  },
  healthValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  healthLabel: {
    fontSize: 12,
    color: '#5E8C7B',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  mealList: {
    marginTop: 8,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF5F1',
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    color: '#2E664A',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  mealTime: {
    fontSize: 13,
    color: '#5E8C7B',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  mealScore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: '700',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  emptyText: {
    fontSize: 14,
    color: '#5E8C7B',
    textAlign: 'center',
    padding: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E664A',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  tipMessage: {
    fontSize: 14,
    color: '#5E8C7B',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  tipUpdate: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  swipeable: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  deleteAction: {
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 10,
    paddingVertical: 10,
  },
  deleteActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Styles for the illness card wrapper and close button
  illnessCardWrapper: {
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative'
  },
  illnessCardCloseButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 14
  }
});

export default Dashboard;
