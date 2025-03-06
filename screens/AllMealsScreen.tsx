import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Platform
} from 'react-native';
import { Swipeable as ReanimatedSwipeable } from 'react-native-gesture-handler';
import MealDetailsModal from '../components/MealDetailsModal'; // Ensure this component exists and is properly configured
import { useUser } from "@clerk/clerk-expo";

// Extend the Meal interface to include nutritional info and feedback
interface Meal {
  _id: string | number;
  meal_id: string;
  meal_name: string;
  timestamp: string; // mapped from time_logged
  score: number;
  nutrition?: any;
  feedback?: string;
}

const AllMealsScreen: React.FC = () => {
  // Filters: Today, Healthy, Unhealthy, and This Week
  const filters: string[] = ['Today', 'Healthy', 'Unhealthy', 'This Week'];
  const [selectedFilter, setSelectedFilter] = useState<string>('Today');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  
  // State for modal visibility and selected meal info for nutritional details
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [lastMealInfo, setLastMealInfo] = useState<Meal | null>(null);

  // Static user id for demo purposes
  const { user } = useUser();
  const userId = user?.id;

  // Fetch meal history and enrich each meal with nutritional info from the mealSearch API
  useEffect(() => {
    async function fetchMeals() {
      try {
        const response = await fetch(`http://192.168.1.6:5500/mealHistory/getMeals/${userId}`);
        const data = await response.json();
        // Enrich each meal using the mealSearch API
        const enrichedMeals = await Promise.all(
          data.map(async (meal: any) => {
            try {
              const res = await fetch(`http://192.168.1.6:5500/mealSearch/getMeal/${meal.meal_id}`);
              const mealSearchData = await res.json();
              return {
                ...meal,
                // Map "time_logged" to "timestamp" for consistency
                timestamp: meal.time_logged,
                nutrition: mealSearchData.nutrition_info,
                score: Number(mealSearchData.health_score), // ensure numeric
                feedback: mealSearchData.feedback
              };
            } catch (error) {
              console.error("Error enriching meal:", error);
              // Fallback in case of error
              return {
                ...meal,
                timestamp: meal.time_logged,
                score: 0
              };
            }
          })
        );
        setMeals(enrichedMeals);
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    }
    fetchMeals();
  }, []);

  // Filter meals based on the selected option
  useEffect(() => {
    if (selectedFilter === 'Today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFilteredMeals(
        meals.filter(meal => {
          const mealDate = new Date(meal.timestamp);
          return mealDate >= today && mealDate < tomorrow;
        })
      );
    } else if (selectedFilter === 'Healthy') {
      setFilteredMeals(meals.filter(meal => meal.score >= 70));
    } else if (selectedFilter === 'Unhealthy') {
      setFilteredMeals(meals.filter(meal => meal.score < 60));
    } else if (selectedFilter === 'This Week') {
      const now = new Date();
      const currentDay = now.getDay(); // Sunday = 0, Monday = 1, etc.
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      setFilteredMeals(
        meals.filter(meal => new Date(meal.timestamp) >= monday)
      );
    }
  }, [selectedFilter, meals]);

  // Handler to delete a meal using its unique _id
  const handleDeleteMeal = async (_id: string | number) => {
    try {
      await fetch(`http://192.168.1.4:5500/mealHistory/deleteMeal/${_id}`, {
        method: "DELETE"
      });
      setMeals(prev => prev.filter(item => item._id !== _id));
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  // Right action for swipe-to-delete
  const RightAction = (progress: any, dragX: any) => {
    return (
      <View style={styles.deleteAction}>
        <Text style={styles.deleteActionText}>Delete</Text>
      </View>
    );
  };

  // Render each meal item wrapped in a swipeable container
  const renderMealItem = ({ item }: { item: Meal }) => (
    <ReanimatedSwipeable
      key={item._id}
      containerStyle={styles.swipeable}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={RightAction}
      onSwipeableOpen={(direction, swipeable) => {
        if (direction === 'right') {
          handleDeleteMeal(item._id);
        }
      }}
    >
      <TouchableOpacity
        style={styles.mealItem}
        onPress={() => {
          setLastMealInfo(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.mealDetails}>
          <Text style={styles.mealName} numberOfLines={1} ellipsizeMode="tail">
            {item.meal_name}
          </Text>
          <Text style={styles.mealTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View
          style={[
            styles.mealScore,
            {
              backgroundColor:
                item.score >= 80 ? '#E8F5E9' :
                item.score < 60 ? '#FFEBEE' :
                '#F1F8E9'
            }
          ]}
        >
          <Text
            style={[
              styles.scoreText,
              {
                color:
                  item.score >= 80 ? '#2E664A' :
                  item.score < 60 ? '#EF5350' :
                  '#5E8C7B'
              }
            ]}
          >
            {item.score}
          </Text>
        </View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Meals</Text>
      </View>

      {/* Filter Options */}
      <ScrollView
        horizontal
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
        showsHorizontalScrollIndicator={false}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meals List */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item, index) =>
          item._id ? item._id.toString() : index.toString()
        }
        renderItem={renderMealItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No meals found for this filter</Text>
        }
      />

      {/* Modal to display meal nutritional info */}
      {lastMealInfo && (
        <MealDetailsModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          lastMealInfo={lastMealInfo}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F7'
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E664A',
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    paddingBottom:20,
    borderBottomColor: '#EDF2F7',
  },
  filterContent: {
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 2,
    backgroundColor: '#F5F7F6',
    borderRadius: 20,
    marginRight: 10,
    height: 36,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2E664A',
  },
  filterButtonText: {
    color: '#5E8C7B',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
 
  },
  swipeable: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 4,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mealDetails: {
    flex: 1,
    marginRight: 12,
  },
  mealName: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  mealTime: {
    fontSize: 13,
    color: '#718096',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
  mealScore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: '700',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
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
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  }
});

export default AllMealsScreen;
