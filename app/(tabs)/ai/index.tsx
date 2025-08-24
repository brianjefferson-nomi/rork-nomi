import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Bot, User, MapPin, DollarSign, Star, ExternalLink } from 'lucide-react-native';
import { useRestaurants } from '@/hooks/restaurant-store';
import { router } from 'expo-router';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: RestaurantSuggestion[];
}

interface RestaurantSuggestion {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  neighborhood: string;
  reason: string;
}

export default function AIScreen() {
  const { restaurants } = useRestaurants();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your restaurant recommendation assistant. I can help you find the perfect spot based on cuisine, vibe, location, or any specific preferences you have. What are you in the mood for?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const generateAIResponse = async (userMessage: string): Promise<{ text: string; suggestions?: RestaurantSuggestion[] }> => {
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a restaurant recommendation assistant. Based on the user's request, provide helpful recommendations from this restaurant data: ${JSON.stringify(restaurants.slice(0, 10))}. 
              
              Respond in a conversational, friendly tone. If the user asks for recommendations, suggest 2-3 specific restaurants from the data that match their criteria. Always explain why you're recommending each place.
              
              Keep responses concise but informative. Focus on cuisine, vibe, price range, and location when making recommendations.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      });

      const data = await response.json();
      
      // Extract restaurant suggestions from the response
      const suggestions: RestaurantSuggestion[] = [];
      const mentionedRestaurants = restaurants.filter(r => 
        data.completion.toLowerCase().includes(r.name.toLowerCase())
      );

      mentionedRestaurants.forEach(restaurant => {
        suggestions.push({
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          priceRange: restaurant.priceRange,
          neighborhood: restaurant.neighborhood,
          reason: `Great ${restaurant.cuisine.toLowerCase()} spot with ${restaurant.rating}★ rating`
        });
      });

      return {
        text: data.completion,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return {
        text: "I'm having trouble connecting right now. In the meantime, I'd recommend checking out our trending restaurants in the Discover tab!"
      };
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const aiResponse = await generateAIResponse(userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const quickPrompts = [
    "Best Italian restaurants nearby",
    "Romantic date night spots",
    "Casual lunch under $20",
    "Trendy places with good vibes"
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            <View style={[
              styles.message,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={styles.messageHeader}>
                {message.isUser ? (
                  <User size={16} color="#FFF" />
                ) : (
                  <Bot size={16} color="#FF6B6B" />
                )}
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
              </View>
            </View>
            
            {message.suggestions && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Recommended for you:</Text>
                {message.suggestions.map((suggestion) => (
                  <TouchableOpacity 
                    key={suggestion.id} 
                    style={styles.suggestionCard}
                    onPress={() => {
                      router.push({ pathname: '/restaurant/[id]', params: { id: suggestion.id } });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionHeader}>
                      <Text style={styles.suggestionName}>{suggestion.name}</Text>
                      <View style={styles.suggestionActions}>
                        <View style={styles.suggestionRating}>
                          <Star size={12} color="#FFD700" fill="#FFD700" />
                          <Text style={styles.suggestionRatingText}>{suggestion.rating}</Text>
                        </View>
                        <ExternalLink size={14} color="#FF6B6B" />
                      </View>
                    </View>
                    <Text style={styles.suggestionCuisine}>{suggestion.cuisine}</Text>
                    <View style={styles.suggestionInfo}>
                      <View style={styles.suggestionInfoItem}>
                        <DollarSign size={12} color="#666" />
                        <Text style={styles.suggestionInfoText}>{suggestion.priceRange}</Text>
                      </View>
                      <View style={styles.suggestionInfoItem}>
                        <MapPin size={12} color="#666" />
                        <Text style={styles.suggestionInfoText}>{suggestion.neighborhood}</Text>
                      </View>
                    </View>
                    <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                    <View style={styles.suggestionFooter}>
                      <Text style={styles.suggestionCTA}>Tap to view details →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={styles.messageWrapper}>
            <View style={[styles.message, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <Bot size={16} color="#FF6B6B" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          </View>
        )}

        {messages.length === 1 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Try asking:</Text>
            {quickPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickPrompt}
                onPress={() => setInputText(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about restaurants, cuisines, or vibes..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={20} color={!inputText.trim() ? "#999" : "#FFF"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  message: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#FF6B6B',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  userMessageText: {
    color: '#FFF',
  },
  aiMessageText: {
    color: '#333',
  },
  loadingText: {
    color: '#999',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 8,
    marginLeft: 24,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  suggestionCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  suggestionRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  suggestionRatingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  suggestionCuisine: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  suggestionInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  suggestionInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  suggestionInfoText: {
    fontSize: 12,
    color: '#666',
  },
  suggestionReason: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  suggestionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    alignItems: 'center',
  },
  suggestionCTA: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  quickPromptsContainer: {
    marginTop: 16,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  quickPrompt: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickPromptText: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});