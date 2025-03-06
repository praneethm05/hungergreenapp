import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform, ActivityIndicator 
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CONTAINER_PADDING = 24;
const ALERT_WIDTH = width - (2 * CONTAINER_PADDING);

function AlertBox() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Fetch alerts from your API endpoint
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch('http://192.168.1.2:5500/healthstats/user_2tvd1715aTDTRkhDpuScbcvi6yh');
        const data = await response.json();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching health alerts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / ALERT_WIDTH);
    setCurrentAlertIndex(index);
  };

  const scrollToAlert = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * ALERT_WIDTH,
      animated: true,
    });
  };

  const ProgressBar = ({ progress }) => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2E664A" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>No alerts available.</Text>
      </View>
    );
  }

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
              <LucideIcons.ChevronLeft size={20} color={currentAlertIndex === 0 ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
            <Text style={styles.alertCounter}>
              {currentAlertIndex + 1}/{alerts.length}
            </Text>
            <TouchableOpacity 
              style={[styles.navButton, currentAlertIndex === alerts.length - 1 && styles.navButtonDisabled]}
              onPress={() => scrollToAlert(currentAlertIndex + 1)}
              disabled={currentAlertIndex === alerts.length - 1}
            >
              <LucideIcons.ChevronRight size={20} color={currentAlertIndex === alerts.length - 1 ? '#94a3b8' : '#64748b'} />
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
          {alerts.map((alert, index) => {
            // Dynamically select the icon component from lucide-react-native.
            const IconComponent = LucideIcons[alert.icon];
            // Use high-contrast fallback values
            const backgroundColor = alert.backgroundColor || "#ffffff";
            const textColor = alert.textColor || "#2E664A";
            // Ensure numeric values for expected and current; default to 0 if not provided.
            const recommended = typeof alert.expected === "number" ? alert.expected : 0;
            const current = typeof alert.current === "number" ? alert.current : 0;
            // Fallback box colors with high contrast
            const boxColor1 = (alert.boxColors && alert.boxColors[0]) || "#d0f0fd"; // light blue
            const boxColor2 = (alert.boxColors && alert.boxColors[1]) || "#fff3e0"; // light orange

            return (
              <View 
                key={index}
                style={[
                  styles.alertBox,
                  { 
                    backgroundColor,
                    width: ALERT_WIDTH - (2 * CARD_PADDING),
                  }
                ]}
              >
                <View style={styles.alertHeader}>
                  {IconComponent && <IconComponent size={24} color={textColor} strokeWidth={2} />}
                  <Text style={[styles.alertTitle, { color: textColor }]}>{alert.title}</Text>
                </View>
                <Text style={[styles.alertText, { color: textColor }]}>{alert.message}</Text>
                
                <View style={styles.insightsContainer}>
                  <View style={[styles.insightBox, { backgroundColor: boxColor1 }]}>
                    <Text style={styles.insightLabel}>Recommended</Text>
                    <View style={styles.valueRow}>
                      <Text style={[styles.insightValue, { color: textColor }]}>{recommended}</Text>
                      {alert.unit ? (
                        <Text style={[styles.unitText, { color: textColor }]}>{alert.unit}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={[styles.insightBox, { backgroundColor: boxColor2 }]}>
                    <Text style={styles.insightLabel}>Your Consumption</Text>
                    <View style={styles.valueRow}>
                      <Text style={[styles.insightValue, { color: textColor }]}>{current}</Text>
                      {alert.unit ? (
                        <Text style={[styles.unitText, { color: textColor }]}>{alert.unit}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                
                <ProgressBar progress={alert.progress} />
              </View>
            );
          })}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2E664A',
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E664A',
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  alertBox: {
    padding: 20,
    borderRadius: 16,
    marginRight: CARD_PADDING * 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  alertText: {
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Avenir-Book" : "sans-serif-light",
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  insightLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    color: '#4b5563',
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  unitText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  navButtonDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.5,
  },
  alertCounter: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginHorizontal: 8,
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif-medium",
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2E664A',
    width: 24,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2E664A',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 0,
  },
});

export { AlertBox };
