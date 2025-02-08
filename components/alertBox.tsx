import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, 
    ScrollView, Dimensions
  } from 'react-native';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplet, Beef, Apple } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CONTAINER_PADDING = 24;
const ALERT_WIDTH = width - (2 * CONTAINER_PADDING);

function AlertBox() {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const alerts = [
    {
      title: 'Nutrition Alert',
      message: 'Today you are lacking fiber in your diet',
      type: 'fiber',
      expected: '38g',
      current: '15g',
      icon: Apple,
      progress: 39,
      backgroundColor: '#fff3f3',
      textColor: '#991b1b',
      boxColors: ['#f0fdf4', '#fee2e2']
    },
    {
      title: 'Protein Intake',
      message: 'Great job hitting your protein goals!',
      type: 'protein',
      expected: '56g',
      current: '62g',
      icon: Beef,
      progress: 110,
      backgroundColor: '#f0fdf4',
      textColor: '#166534',
      boxColors: ['#dcfce7', '#dcfce7']
    },
    {
      title: 'Hydration Alert',
      message: 'You need to drink more water',
      type: 'water',
      expected: '2.5L',
      current: '1.2L',
      icon: Droplet,
      progress: 48,
      backgroundColor: '#eff6ff',
      textColor: '#1e40af',
      boxColors: ['#dbeafe', '#fee2e2']
    }
  ];

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / ALERT_WIDTH);
    setCurrentAlertIndex(index);
  };

  const scrollToAlert = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * ALERT_WIDTH,
      animated: true
    });
  };

  const ProgressBar = ({ progress }) => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.alertsHeader}>
          <Text style={styles.title}>Health Insights</Text>
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, currentAlertIndex === 0 && styles.navButtonDisabled]}
              onPress={() => scrollToAlert(currentAlertIndex - 1)}
              disabled={currentAlertIndex === 0}
            >
              <ChevronLeft size={20} color={currentAlertIndex === 0 ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
            <Text style={styles.alertCounter}>
              {currentAlertIndex + 1}/{alerts.length}
            </Text>
            <TouchableOpacity 
              style={[styles.navButton, currentAlertIndex === alerts.length - 1 && styles.navButtonDisabled]}
              onPress={() => scrollToAlert(currentAlertIndex + 1)}
              disabled={currentAlertIndex === alerts.length - 1}
            >
              <ChevronRight size={20} color={currentAlertIndex === alerts.length - 1 ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={ALERT_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
        >
          {alerts.map((alert, index) => (
            <View 
              key={index}
              style={[
                styles.alertBox,
                { 
                  backgroundColor: alert.backgroundColor,
                  width: ALERT_WIDTH - (2 * CARD_PADDING), // Subtract padding to ensure proper width
                }
              ]}
            >
              <View style={styles.alertHeader}>
                <alert.icon size={24} color={alert.textColor} strokeWidth={2} />
                <Text style={[styles.alertTitle, { color: alert.textColor }]}>{alert.title}</Text>
              </View>
              <Text style={[styles.alertText, { color: alert.textColor }]}>{alert.message}</Text>
              
              <View style={styles.fiberContainer}>
                <View style={[styles.fiberBox, { backgroundColor: alert.boxColors[0] }]}> 
                  <Text style={styles.fiberLabel}>TARGET</Text>
                  <Text style={[styles.fiberValue, { color: alert.textColor }]}>{alert.expected}</Text>
                </View>
                <View style={[styles.fiberBox, { backgroundColor: alert.boxColors[1] }]}> 
                  <Text style={styles.fiberLabel}>CURRENT</Text>
                  <Text style={[styles.fiberValue, { color: alert.textColor }]}>{alert.current}</Text>
                </View>
              </View>
              
              <ProgressBar progress={alert.progress} />
            </View>
          ))}
        </ScrollView>

        <View style={styles.paginationContainer}>
          {alerts.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                currentAlertIndex === index && styles.paginationDotActive
              ]}
              onPress={() => scrollToAlert(index)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: CARD_PADDING,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15
  },
  alertBox: {
    padding: 20,
    borderRadius: 16,
    marginRight: CARD_PADDING*2, // Add horizontal margin to center the card
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5
  },
  alertText: {
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22
  },
  fiberContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  fiberBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1
  },
  fiberLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  fiberValue: {
    fontSize: 20,
    fontWeight: '700'
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  navButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10
  },
  navButtonDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.5
  },
  alertCounter: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600'
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0'
  },
  paginationDotActive: {
    backgroundColor: '#16A34A',
    width: 24
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 2
  },
  scrollContent: {
    flexGrow: 0
  }
});

export { AlertBox };