import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { Camera, Sun, Send, User, TrendingUp } from 'lucide-react-native';
import { AlertBox } from '../components/alertBox';
import { IllnessCauseCard } from '../components/IllnessBox';
import { MealSuggestions } from '../components/MealSuggestions';
import { RecordIllnessForm } from '../components/IllnessForm';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [meal, setMeal] = useState('');

  const [illnessFound, setIllnessFound] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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
            <Sun size={32} color="#EAB308" strokeWidth={2} />
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
                onPress={() => alert(`Meal logged: ${meal}`)}
                style={styles.sendButton}
              >
                <Send size={18} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={22} color="#16A34A" strokeWidth={2} />
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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.circleContainer}
          >
            {['John', 'Akshay', 'Arun', 'Keeveta'].map((name, index) => (
              <View key={name} style={styles.circleItem}>
                <TouchableOpacity style={styles.avatar}>
                  <User size={22} color="#64748b" strokeWidth={2} />
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


        {illnessFound && <IllnessCauseCard foodItem="Chicken" date="2022-01-01" illnessName="Stomach Ache" />}


        {/* Hunger Health */}
        <View style={styles.card}>
          <View style={styles.healthHeader}>
            <View>
              <Text style={styles.title}>Your Hunger Health</Text>
              <Text style={styles.subtitle}>Keep up the good work! 🎯</Text>
            </View>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodButtonText}>Today</Text>
              <TrendingUp size={16} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.healthContainer}>
            {[
              { value: '3', label: 'Meals Logged', color: '#6366f1', bg: '#eef2ff' },
              { value: '100', label: 'Hunger Score', color: '#16A34A', bg: '#f0fdf4' },
              { value: '365', label: 'Day Streak', color: '#eab308', bg: '#fefce8' },
            ].map((item, index) => (
              <View key={index} style={[styles.healthItem, { backgroundColor: item.bg }]}>
                <Text style={[styles.healthValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.healthLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

        
        </View>

        <AlertBox />

        <MealSuggestions/>

        <RecordIllnessForm />
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
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    height: 52,
    color: '#0f172a',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#16A34A',
    padding: 10,
    borderRadius: 12,
  },
  cameraButton: {
    backgroundColor: '#dcfce7',
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  seeAllButton: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seeAll: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
  },
  circleContainer: {
    paddingVertical: 8,
    gap: 20,
    flexDirection: 'row',
  },
  circleItem: {
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: '#f8fafc',
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
    color: '#64748b',
    fontWeight: '500',
  },
  addButton: {
    width: 56,
    height: 56,
    backgroundColor: '#f0fdf4',
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
    color: '#16A34A',
    fontWeight: '500',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  periodButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  healthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
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
  },
  healthLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
});