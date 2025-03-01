import React from 'react';
import { Modal, View, Text, TouchableOpacity ,Platform, StyleSheet} from 'react-native';
import { Check, X } from 'lucide-react-native'; // using your existing icon imports

const MealDetailsModal = ({ modalVisible, setModalVisible, lastMealInfo }) => {
  return (
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
    </Modal>
  );
};


const styles = StyleSheet.create({
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
    closeButton: { 
      padding: 6 
    },
    modalBody: { 
      padding: 20 
    },
    mealNameLarge: {
      fontSize: 20,
      fontWeight: '700',
      color: '#2E664A',
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    },
    scoreContainer: { 
      alignItems: 'center', 
      marginBottom: 24 
    },
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
  });
  

export default MealDetailsModal;
