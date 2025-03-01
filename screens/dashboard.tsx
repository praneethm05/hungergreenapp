import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/Swipeable'; // Import the reanimated version
import { useNavigation } from '@react-navigation/native';
import {
  Camera,
  Sun,
  Send,
  User,
  TrendingUp,
  Check,
  X,
  Leaf
} from 'lucide-react-native';
import { IllnessCauseCard } from '../components/IllnessBox';
import { AlertBox } from '../components/alertBox';
import { RecordIllnessForm } from '../components/IllnessForm';

const Dashboard = () => {
  const navigation = useNavigation();
  const [meal, setMeal] = useState('');
  const [hungerScore, setHungerScore] = useState(75);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastMealInfo, setLastMealInfo] = useState(null);
  const [mealHistory, setMealHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Assume a static user id for demo purposes
  const userId = "1234";

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
  }, []);

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

  const getGreeting = () => {
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
        meal_id: nutritionData._id, // Note: Do not use this _id for deletion!
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
        body: JSON.stringify({
          meal_name: newMealEntry.meal_name,
          meal_id: newMealEntry.meal_id,
          user_id: newMealEntry.user_id,
          nutrition: newMealEntry.nutrition,
          score: newMealEntry.score,
          feedback: newMealEntry.feedback,
          timestamp: newMealEntry.timestamp
        })
      });
      const postResult = await postResponse.json();
      // Set the unique _id from the logMeal API (used for deletion)
      (newMealEntry as any)._id = postResult._id;
      // Update meal history. The full history is maintained but the UI shows only the 6 most recent.
      setMealHistory(prev => [...prev, newMealEntry]);
      setLastMealInfo(newMealEntry);
      setModalVisible(true);
      setMeal('');
    } catch (error) {
      console.error("Error logging meal: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a meal by its unique _id
  const handleDeleteMeal = async (_id) => {
    try {
      await fetch(`http://192.168.1.4:5500/mealHistory/deleteMeal/${_id}`, {
        method: "DELETE"
      });
      setMealHistory(prev => prev.filter(item => item._id !== _id));
    } catch (error) {
      console.error("Error deleting meal: ", error);
    }
  };

  // Compute the six most recent meals (most recent first)
  const recentMeals = mealHistory.slice(-6).reverse();

  // Define a RightAction component for swipe-to-delete
  const RightAction = (progress, dragX) => {
    return (
      <View style={styles.deleteAction}>
        <Text style={styles.deleteActionText}>Delete</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting and Meal Input */}
        <View style={styles.card}>
          <View style={styles.greetingContainer}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>Adithyan RK</Text>
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

        {/* Illness Cause */}
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

        {/* Nutrition Tips */}
        <View style={styles.card}>
          <Text style={styles.title}>Nutrition Tips</Text>
          <Text style={styles.subtitle}>Based on your recent meals</Text>
          <View style={styles.tipContainer}>
            <View style={styles.tipIconContainer}>
              <Leaf size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Increase fiber intake</Text>
              <Text style={styles.tipDescription}>
                Try adding more whole grains, fruits, and vegetables to your meals for better digestion.
              </Text>
            </View>
          </View>
        </View>

        <AlertBox />
        <RecordIllnessForm />
      </ScrollView>

      {/* Success Modal
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.successIconContainer}>
                <Check size={24} color="white" />
              </View>
              <Text style={styles.modalTitle}>Meal Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={20} color="#5E8C7B" />
              </TouchableOpacity>
            </View>
            {lastMealInfo && (
              <View style={styles.modalBody}>
                <Text style={styles.mealNameLarge}>{lastMealInfo.meal_name}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Hunger Score</Text>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreValue}>{lastMealInfo.score}</Text>
                  </View>
                  <Text style={styles.scoreFeedback}>{lastMealInfo.feedback}</Text>
                </View>
                <View style={styles.nutritionContainer}>
                  <Text style={styles.nutritionTitle}>Nutritional Information</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {lastMealInfo.nutrition.calories}
                      </Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {lastMealInfo.nutrition.proteins}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {lastMealInfo.nutrition.carbohydrates}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {lastMealInfo.nutrition.fats}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Fats</Text>
                    </View>
                  </View>
                  <View style={styles.additionalNutrition}>
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionKey}>Fiber:</Text>
                      <Text style={styles.nutritionValue2}>
                        {lastMealInfo.nutrition.fiber}g
                      </Text>
                    </View>
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionKey}>Sugar:</Text>
                      <Text style={styles.nutritionValue2}>
                        {lastMealInfo.nutrition.sugars}g
                      </Text>
                    </View>
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionKey}>Sodium:</Text>
                      <Text style={styles.nutritionValue2}>
                        {lastMealInfo.nutrition.sodium}mg
                      </Text>
                    </View>
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionKey}>Cholesterol:</Text>
                      <Text style={styles.nutritionValue2}>
                        {lastMealInfo.nutrition.cholesterol}mg
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal> */}

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
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF5F1',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E664A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E664A',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  tipDescription: {
    fontSize: 14,
    color: '#5E8C7B',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EFF5F1',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  successIconContainer: {
    backgroundColor: '#2E664A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E664A',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  closeButton: { padding: 6 },
  modalBody: { padding: 20 },
  mealNameLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E664A',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  scoreContainer: { alignItems: 'center', marginBottom: 24 },
  scoreLabel: {
    fontSize: 14,
    color: '#5E8C7B',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF5F1',
    borderWidth: 3,
    borderColor: '#2E664A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E664A',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  scoreFeedback: {
    fontSize: 14,
    color: '#5E8C7B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
    textAlign: 'center',
  },
  nutritionContainer: {
    backgroundColor: '#F6F9F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E664A',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E664A',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#5E8C7B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  additionalNutrition: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionKey: {
    fontSize: 14,
    color: '#5E8C7B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  nutritionValue2: {
    fontSize: 14,
    color: '#2E664A',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  closeModalButton: {
    backgroundColor: '#2E664A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
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
  // New styles for the reanimated swipeable
  swipeable: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    // Add subtle shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
    overflow: 'hidden', // Ensures content respects the borderRadius
  },
  
  deleteAction: {
    backgroundColor: '#F44336', // brighter, more vivid red
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
