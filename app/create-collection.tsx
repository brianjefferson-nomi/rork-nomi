import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';

const occasions = ['Birthday', 'Date Night', 'Business', 'Casual', 'Late Night', 'Brunch', 'Special Occasion'];

export default function CreatePlanScreen() {
  const { createPlan } = useRestaurants();
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to create a plan', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth' as any) }
      ]);
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    try {
      console.log('[CreatePlan] Creating plan with data:', {
        name: name.trim(),
        description: description.trim() || undefined,
        plannedDate: plannedDate.trim() || undefined,
        isPublic
      });
      
      await createPlan({
        name: name.trim(),
        description: description.trim() || undefined,
        plannedDate: plannedDate.trim() || undefined,
        isPublic
      });
      
      console.log('[CreatePlan] Plan created successfully');
      Alert.alert('Success', 'Plan created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('[CreatePlan] Error creating plan:', error);
      Alert.alert('Error', `Failed to create plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Plan Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Birthday Dinner Plans"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this plan about?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Planned Date (Optional)</Text>
          <TextInput
            style={styles.input}
            value={plannedDate}
            onChangeText={setPlannedDate}
            placeholder="e.g., Next Friday, Dec 15th"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Occasion</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.occasionList}>
              {occasions.map(occasion => (
                <TouchableOpacity
                  key={occasion}
                  style={[
                    styles.occasionChip,
                    selectedOccasion === occasion && styles.occasionChipActive
                  ]}
                  onPress={() => setSelectedOccasion(selectedOccasion === occasion ? '' : occasion)}
                >
                  <Text style={[
                    styles.occasionText,
                    selectedOccasion === occasion && styles.occasionTextActive
                  ]}>
                    {occasion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Privacy</Text>
          <View style={styles.privacyOptions}>
            <TouchableOpacity
              style={[styles.privacyOption, isPublic && styles.privacyOptionActive]}
              onPress={() => setIsPublic(true)}
            >
              <Text style={[styles.privacyText, isPublic && styles.privacyTextActive]}>Public</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.privacyOption, !isPublic && styles.privacyOptionActive]}
              onPress={() => setIsPublic(false)}
            >
              <Text style={[styles.privacyText, !isPublic && styles.privacyTextActive]}>Private</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  occasionList: {
    flexDirection: 'row',
    gap: 8,
  },
  occasionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  occasionChipActive: {
    backgroundColor: '#FF6B6B',
  },
  occasionText: {
    fontSize: 14,
    color: '#666',
  },
  occasionTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  privacyOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  privacyOptionActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  privacyText: {
    fontSize: 16,
    color: '#666',
  },
  privacyTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  buttons: {
    marginTop: 32,
    gap: 12,
  },
  createButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});