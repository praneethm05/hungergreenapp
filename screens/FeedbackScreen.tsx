import React, { useState, useEffect, useRef, FC } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import {
  MessageCircle,
  Send,
  ThumbsUp,
  MessagesSquare,
  Bot,
  X,
} from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

type FeedbackType = 'reportissue' | 'suggestfeature';

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
}

const FeedbackScreen: FC = () => {
  const { user } = useUser();

  // Feedback states
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

  // Chat states
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, text: 'Hello! How can I help you today?', isBot: true },
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(keyboardShowEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardHideListener = Keyboard.addListener(keyboardHideEvent, () => setKeyboardHeight(0));

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  // Auto scroll to bottom when chat messages or keyboard height changes
  useEffect(() => {
    if (flatListRef.current && chatMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages, keyboardHeight]);

  const toggleChatbot = (): void => {
    setShowChatbot((prev) => !prev);
  };

  // Handle feedback submission
  const submitFeedback = async (): Promise<void> => {
    if (!selectedFeedbackType) {
      Alert.alert('Select Feedback Type', 'Please choose either Report Issue or Suggest Feature.');
      return;
    }
    if (!feedbackMessage.trim()) {
      Alert.alert('Empty Feedback', 'Please enter your feedback message.');
      return;
    }
    setFeedbackLoading(true);
    const payload = {
      user_id: user?.id || 'unknown',
      message: feedbackMessage,
      type: selectedFeedbackType,
    };

    try {
      const response = await fetch('http://192.168.1.4:550/feedback/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        Alert.alert('Feedback Sent', 'Thank you for your feedback!');
        setFeedbackMessage('');
        setSelectedFeedbackType(null);
        Keyboard.dismiss();
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to send feedback. Please check your network connection.');
    }
    setFeedbackLoading(false);
  };

  // Handle sending a chat message
  const handleSendChat = async (): Promise<void> => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMsg: ChatMessage = { id: Date.now(), text: chatInput, isBot: false };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('http://192.168.1.4:550/feedback/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, user_id: user?.id || 'unknown' }),
      });
      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = { id: Date.now() + 1, text: data.response, isBot: true };
        setChatMessages((prev) => [...prev, botMsg]);
      } else {
        Alert.alert('Error', 'Chat service error');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to send chat message. Check network connection.');
    }
    setChatLoading(false);
  };

  const onChatSubmit = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>): void => {
    handleSendChat();
  };

  // Render each chat message
  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.isBot ? styles.botMessage : styles.userMessage,
      ]}
    >
      <Text style={[styles.messageText, item.isBot ? styles.botMessageText : styles.userMessageText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          renderItem={() => null}
          data={[]}
          // Use FlatList's ListHeaderComponent to switch between feedback and chat UI
          ListHeaderComponent={
            !showChatbot ? (
              <View style={styles.feedbackSection}>
                {/* Chatbot Toggle */}
                <TouchableOpacity onPress={toggleChatbot} style={styles.chatbotToggle}>
                  <Bot size={24} color="#64748b" />
                  <Text style={styles.chatbotText}>Need immediate help? Chat with us</Text>
                </TouchableOpacity>

                <View style={styles.welcomeCard}>
                  <ThumbsUp size={32} color="#16A34A" style={styles.welcomeIcon} />
                  <Text style={styles.welcomeTitle}>We'd love to hear from you!</Text>
                  <Text style={styles.welcomeText}>
                    Your feedback helps us improve our service and provide you with a better experience.
                  </Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionCard,
                      selectedFeedbackType === 'reportissue' && styles.selectedAction,
                    ]}
                    onPress={() => setSelectedFeedbackType('reportissue')}
                  >
                    <MessagesSquare size={24} color="#16A34A" />
                    <Text style={styles.actionTitle}>Report Issue</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionCard,
                      selectedFeedbackType === 'suggestfeature' && styles.selectedAction,
                    ]}
                    onPress={() => setSelectedFeedbackType('suggestfeature')}
                  >
                    <MessageCircle size={24} color="#16A34A" />
                    <Text style={styles.actionTitle}>Suggest Feature</Text>
                  </TouchableOpacity>
                </View>

                {/* Feedback Form */}
                <View style={styles.feedbackForm}>
                  <Text style={styles.formLabel}>Share your thoughts</Text>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={6}
                    placeholder="Type your feedback here..."
                    placeholderTextColor="#94a3b8"
                    textAlignVertical="top"
                    value={feedbackMessage}
                    onChangeText={setFeedbackMessage}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={submitFeedback}
                    disabled={feedbackLoading}
                  >
                    {feedbackLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>Submit Feedback</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.chatSection}>
                {/* Chat Header */}
                <View style={styles.chatHeader}>
                  <View style={styles.chatHeaderContent}>
                    <Bot size={24} color="#16A34A" />
                    <Text style={styles.chatHeaderText}>Chat Support</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowChatbot(false)} style={styles.closeButton}>
                    <X size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Chat Messages List */}
                <FlatList
                  ref={flatListRef}
                  data={chatMessages}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderChatMessage}
                  contentContainerStyle={styles.chatMessagesContainer}
                />
              </View>
            )
          }
          // Empty footer so that FlatList can scroll properly
          ListFooterComponent={<View style={{ height: keyboardHeight + 24 }} />}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        />

        {/* Chat Input - Only shown in chatbot mode */}
        {showChatbot && (
          <View style={[styles.chatInputContainer, { bottom: keyboardHeight }]}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={onChatSubmit}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendChat} disabled={chatLoading}>
              {chatLoading ? <ActivityIndicator color="white" /> : <Send size={20} color="white" />}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  feedbackSection: {
    flex: 1,
  },
  chatbotToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chatbotText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedAction: {
    backgroundColor: '#e0f2f1',
  },
  actionTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  feedbackForm: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chatSection: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  chatMessagesContainer: {
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  botMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: '#16A34A',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#0f172a',
  },
  userMessageText: {
    color: 'white',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0f172a',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#16A34A',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedbackScreen;
