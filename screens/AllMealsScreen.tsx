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

const AllMealsScreen = () => {
  const [mealHistory, setMealHistory] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const userId = "1234";

  useEffect(() => {
    async function fetchMealHistory() {
      try {
        const response = await fetch(`http://192.168.1.4:5500/mealHistory/getMeals/${userId}`);
        const data = await response.json();
        setMealHistory(data);
        setFilteredMeals(data);
      } catch (error) {
        console.error("Error fetching meal history: ", error);
      }
    }
    fetchMealHistory();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'All') {
      setFilteredMeals(mealHistory);
    } else if (selectedFilter === 'Today') {
      const today = new Date().toDateString();
      setFilteredMeals(
        mealHistory.filter(meal => new Date(meal.timestamp).toDateString() === today)
      );
    } else if (selectedFilter === 'This Week') {
      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      setFilteredMeals(
        mealHistory.filter(meal => new Date(meal.timestamp) >= firstDayOfWeek)
      );
    } else if (selectedFilter === 'Healthy') {
      setFilteredMeals(mealHistory.filter(meal => meal.score >= 80));
    } else if (selectedFilter === 'Unhealthy') {
      setFilteredMeals(mealHistory.filter(meal => meal.score < 60));
    }
  }, [selectedFilter, mealHistory]);

  const filters = ['All', 'Today', 'This Week', 'Healthy', 'Unhealthy'];

  const renderMealItem = ({ item }) => (
    <TouchableOpacity style={styles.mealItem}>
      <View style={styles.mealDetails}>
        <Text style={styles.mealName}>{item.meal_name}</Text>
        <Text style={styles.mealTime}>
          {new Date(item.timestamp).toLocaleTimeString([], {
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
                item.score >= 80
                  ? '#2E664A'
                  : item.score >= 60
                  ? '#5E8C7B'
                  : '#E57373'
            }
          ]}
        >
          {item.score}
        </Text>
      </View>
    </TouchableOpacity>
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

      <FlatList
        data={filteredMeals}
        keyExtractor={(item, index) =>
          item._id ? item._id.toString() : index.toString()
        }
        renderItem={renderMealItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No meals found.</Text>}
      />
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
    paddingVertical: 15, // Reduced vertical padding
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E664A',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium'
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 0, // Reduced vertical padding
    marginVertical: 0 // Reduced vertical margin
  },
  filterContent: {
    alignItems: 'center',
    paddingHorizontal: 10 // Reduced horizontal padding
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#EFF5F1',
    borderRadius: 20,
    marginRight: 8
  },
  filterButtonActive: {
    backgroundColor: '#2E664A'
  },
  filterButtonText: {
    color: '#2E664A',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium'
  },
  filterButtonTextActive: {
    color: '#fff'
  },
  listContent: {
    paddingHorizontal: 16, // Reduced horizontal padding
    paddingBottom: 16 // Reduced bottom padding
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10, // Reduced margin bottom
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3
  },
  mealDetails: {
    flex: 1
  },
  mealName: {
    fontSize: 16,
    color: '#2E664A',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium'
  },
  mealTime: {
    fontSize: 13,
    color: '#5E8C7B',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light'
  },
  mealScore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF5F1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scoreText: {
    fontWeight: '700',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium'
  },
  emptyText: {
    fontSize: 14,
    color: '#5E8C7B',
    textAlign: 'center',
    marginTop: 20, // Reduced top margin
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light'
  }
});

export default AllMealsScreen;
