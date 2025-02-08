import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

function IllnessCauseCard({ foodItem, date, illnessName = "illness_name" }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <AlertTriangle size={20} color="#991b1b" strokeWidth={2} />
        </View>
        <Text style={styles.headerText}>Possible Cause For {illnessName}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.causeBox}>
          <View style={styles.itemContainer}>
            <Text style={styles.label}>SUSPECTED ITEM</Text>
            <Text style={styles.value}>{foodItem}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.itemContainer}>
            <Text style={styles.label}>CONSUMED ON</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.disclaimerText}>
        Based on past data analysis and toxic combinations
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  contentContainer: {
    marginBottom: 12,
  },
  causeBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContainer: {
    flex: 1,
  },
  separator: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export { IllnessCauseCard };