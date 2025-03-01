import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import MealDetailsModal from '../components/MealDetailsModal';
import ReanimatedSwipeable from 'react-native-gesture-handler/Swipeable';
import { useNavigation } from '@react-navigation/native';
import { Camera, Sun, Send, User, TrendingUp } from 'lucide-react-native';
import { IllnessCauseCard } from '../components/IllnessBox';
import { AlertBox } from '../components/alertBox';
import { RecordIllnessForm } from '../components/IllnessForm';

const Dashboard = () => {
  const navigation = useNavigation<any>();
  const [meal, setMeal] = useState<string>('');
  const [hungerScore, setHungerScore] = useState<number>(75);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [lastMealInfo, setLastMealInfo] = useState<any>(null);
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<any>(null);

  // Assume a static user id for demo purposes
  const userId: string = "4d28d6fb-d7ba-43b3-b7fa-13ed49063fb3";

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`http://192.168.1.4:5500/users/${userId}`);
        const data = await response.json();
        setUserName(data.name);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    }
    fetchUser();
  }, [userId]);

  useEffect(() => {
    async function fetchMealHistory() {
      try {
        const response = await fetch(`http://192.168.1.4:5500/mealHistory/getMeals/${userId}`);
        const data = await response.json();
        setMealHistory(data);
      } catch (error) {
        console.error("Error fetching meal history: ", error);
      }
    }
    fetchMealHistory();
  }, [userId]);

  // Enrich meal history if nutrition info is missing
  useEffect(() => {
    async function enrichMealHistory() {
      const enriched = await Promise.all(
        mealHistory.map(async (meal) => {
          if (!meal.nutrition) {
            try {
              const response = await fetch(`http://192.168.1.4:5500/mealSearch/getMeal/${meal.meal_id}`);
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

  // Helper function to refresh suggestion from the API
  const refreshSuggestion = async () => {
    try {
      const response = await fetch(`http://192.168.1.4:5500/suggestions/${userId}`);
      const data = await response.json();
      setSuggestion(data);
    } catch (error) {
      console.error("Error fetching suggestion: ", error);
    }
  };

  // Fetch suggestion on mount
  useEffect(() => {
    refreshSuggestion();
  }, [userId]);

  // Helper function to calculate updated time string using getTime()
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
      // Fetch nutritional info for the meal
      const nutritionResponse = await fetch(
        `http://192.168.1.4:5500/nutrition/getnutritioninfo?meal_name=${encodeURIComponent(meal)}`
      );
      const nutritionData = await nutritionResponse.json();
  
      // Prepare new meal entry; assume the POST API returns the unique _id
      const newMealEntry = {
        meal_name: nutritionData.meal_name,
        meal_id: nutritionData._id,
        user_id: userId,
        nutrition: nutritionData.nutrition_info,
        score: nutritionData.health_score,
        feedback: nutritionData.feedback,
        timestamp: new Date().toISOString()
      };
  
      // Log the meal via POST API
      const postResponse = await fetch("http://192.168.1.4:5500/mealHistory/logMeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMealEntry)
      });
      const postResult = await postResponse.json();
      (newMealEntry as any)._id = postResult._id;
      // Update meal history (UI shows only the 6 most recent)
      setMealHistory(prev => [...prev, newMealEntry]);
      setLastMealInfo(newMealEntry);
      setModalVisible(true);
      setMeal('');
  
      // Check the suggestion's age using the full date
    
        await refreshSuggestion();
  
    } catch (error) {
      console.error("Error logging meal: ", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteMeal = async (_id: string) => {
    try {
      await fetch(`http://192.168.1.4:5500/mealHistory/deleteMeal/${_id}`, {
        method: "DELETE"
      });
      setMealHistory(prev => prev.filter(item => item._id !== _id));
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
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['John', 'Sarah', 'Mike', 'Emma'].map((name) => (
              <View key={name} style={styles.circleItem}>
                <TouchableOpacity style={styles.avatar}>
                  <User size={22} color="#5E8C7B" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.circleName}>{name}</Text>
              </View>
            ))}
            <View style={styles.circleItem}>
              <TouchableOpacity style={styles.addButton}>
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
              { value: hungerScore.toString(), label: 'Hunger Score', color: '#2E664A', bg: '#F0FDF4' },
              { value: '28', label: 'Day Streak', color: '#5E8C7B', bg: '#F6F9F7' },
            ].map((item, index) => (
              <View key={index} style={[styles.healthItem, { backgroundColor: item.bg, marginHorizontal: 4 }]}>
                <Text style={[styles.healthValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.healthLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <IllnessCauseCard foodItem="Chicken" date="2022-01-01" illnessName="Stomach Ache" />

        {/* Recent Meals */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Recent Meals</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => (navigation as any).navigate('AllMeals')}
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
                  onSwipeableOpen={(direction, swipeable) => {
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

        <AlertBox />
        <RecordIllnessForm />
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginHorizontal: 4,
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
  // Redesigned Nutrition Tips Card Styles (without icon)
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
});

export default Dashboard;
