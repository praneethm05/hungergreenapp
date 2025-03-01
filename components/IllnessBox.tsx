import { View, Text, StyleSheet, Platform } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

function IllnessCauseCard({ foodItem, date, illnessName = "illness_name" }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>Possible Cause For</Text>
          <Text style={styles.headerTitle}>{illnessName}</Text>
        </View>
        <View style={styles.iconContainer}>
          <AlertTriangle size={20} color="#991b1b" strokeWidth={2} />
        </View>
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#2E664A',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E664A',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    marginTop: 2,
  },
  iconContainer: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 12,
    marginLeft: 12,
    alignSelf: 'center',
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif-light',
  },
});

export { IllnessCauseCard };
