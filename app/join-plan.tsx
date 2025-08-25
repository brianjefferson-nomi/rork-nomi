import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { dbHelpers } from '@/services/supabase';

export default function JoinPlanScreen() {
  const [planCode, setPlanCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleJoinPlan = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!planCode.trim()) {
      Alert.alert('Error', 'Please enter a plan code');
      return;
    }

    try {
      setIsLoading(true);
      
      // Find plan by code
      const plan = await dbHelpers.getPlanByCode(planCode.trim());
      
      if (!plan) {
        Alert.alert('Error', 'Plan not found. Please check the code and try again.');
        return;
      }

      // Type assertion to fix TypeScript error
      const typedPlan = plan as any;

      // Check if user is already a collaborator
      if (typedPlan.collaborators && Array.isArray(typedPlan.collaborators) && typedPlan.collaborators.includes(user!.id) || typedPlan.creator_id === user!.id) {
        Alert.alert('Info', 'You are already part of this plan.');
        router.push(`/collection/${typedPlan.id}` as any);
        return;
      }

      // Add user to collaborators
      const updatedCollaborators = typedPlan.collaborators && Array.isArray(typedPlan.collaborators) ? [...typedPlan.collaborators, user!.id] : [user!.id];
      await dbHelpers.updatePlan(typedPlan.id, {
        collaborators: updatedCollaborators,
        updated_at: new Date().toISOString()
      });

      Alert.alert('Success', `You've joined "${typedPlan.name || 'the plan'}"!`, [
        {
          text: 'View Plan',
          onPress: () => {
            router.back();
            router.push(`/collection/${typedPlan.id}` as any);
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to join plan. Please try again.');
      console.error('Join plan error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Join a Plan</Text>
        <Text style={styles.subtitle}>Enter the plan code shared with you to join a collaborative dining plan</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Plan Code</Text>
            <TextInput
              style={styles.input}
              value={planCode}
              onChangeText={setPlanCode}
              placeholder="Enter 6-character code"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.joinButton, isLoading && styles.joinButtonDisabled]}
            onPress={handleJoinPlan}
            disabled={isLoading}
          >
            <Text style={styles.joinButtonText}>
              {isLoading ? 'Joining...' : 'Join Plan'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpText}>
            Ask the plan creator to share the 6-character plan code with you. 
            You can find this code in the plan details.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});