import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { MessageCircle, Send, ThumbsUp, MessagesSquare, Bot, X } from 'lucide-react-native';
import { useState, useEffect } from 'react';

export default function FeedbackScreen() {
  const [message, setMessage] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Dummy chat messages for demonstration
  const [chatMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isBot: true },
    { id: 2, text: "I'm having trouble with meal tracking", isBot: false },
    { id: 3, text: "I understand. Let me guide you through the meal tracking process.", isBot: true },
  ]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!showChatbot ? (
            // Feedback Section
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
                <TouchableOpacity style={styles.actionCard}>
                  <MessagesSquare size={24} color="#16A34A" />
                  <Text style={styles.actionTitle}>Report Issue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
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
                />
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={() => Keyboard.dismiss()}
                >
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Chatbot Interface
            <View style={[styles.chatSection, { paddingBottom: keyboardHeight }]}>
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderContent}>
                  <Bot size={24} color="#16A34A" />
                  <Text style={styles.chatHeaderText}>Chat Support</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowChatbot(false)} 
                  style={styles.closeButton}
                >
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Chat Messages */}
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageContainer,
                    msg.isBot ? styles.botMessage : styles.userMessage,
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    msg.isBot ? styles.botMessageText : styles.userMessageText
                  ]}>
                    {msg.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Chat Input - Only shown in chatbot mode */}
        {showChatbot && (
          <View style={[styles.chatInputContainer, { bottom: keyboardHeight }]}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={styles.sendButton}>
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  feedbackSection: {
    padding: 16,
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
    padding: 16,
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