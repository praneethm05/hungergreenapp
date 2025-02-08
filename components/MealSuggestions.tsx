import { View, Text, StyleSheet } from 'react-native';
import { Leaf, Apple, Carrot } from 'lucide-react-native';

function MealSuggestions() {
  const suggestions = [
    {
      icon: Leaf,
      title: 'Add More Greens',
      description: 'Consider adding spinach or kale for more nutrients',
      color: '#16A34A',
      bgColor: '#f0fdf4'
    },
    {
      icon: Apple,
      title: 'Include Fresh Fruit',
      description: 'Add an apple or berries for natural sweetness',
      color: '#ea580c',
      bgColor: '#fff7ed'
    },
    {
      icon: Carrot,
      title: 'More Fiber',
      description: 'Try adding carrots or whole grains',
      color: '#eab308',
      bgColor: '#fefce8'
    }
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Suggestions for a Healthier Meal</Text>
      
      <View style={styles.suggestionsContainer}>
        {suggestions.map((item, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
              <item.icon size={20} color={item.color} strokeWidth={2} />

              
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.suggestionTitle}>{item.title}</Text>
              <Text style={styles.suggestionDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  suggestionsContainer: {
    gap: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export { MealSuggestions };