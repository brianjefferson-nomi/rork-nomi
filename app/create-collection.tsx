import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useRestaurants } from '@/hooks/restaurant-store';

const occasions = ['Birthday', 'Date Night', 'Business', 'Casual', 'Late Night', 'Brunch', 'Special Occasion'];
const coverImages = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
];

export default function CreateCollectionScreen() {
  const { createCollection } = useRestaurants();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    createCollection({
      name,
      description,
      coverImage: coverImages[Math.floor(Math.random() * coverImages.length)],
      restaurants: [],
      createdBy: 'currentUser',
      collaborators: [],
      occasion: selectedOccasion,
      isPublic,
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Collection Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Birthday Dinner Spots"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this collection about?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
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
            <Text style={styles.createButtonText}>Create Collection</Text>
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