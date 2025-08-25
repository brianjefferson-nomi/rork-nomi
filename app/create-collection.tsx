import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { ChevronLeft, Users, Lock, Globe, Calendar as CalendarIcon } from 'lucide-react-native';

const occasions = ['Birthday', 'Date Night', 'Business', 'Casual', 'Late Night', 'Brunch', 'Special Occasion'];

type CollectionType = 'public' | 'private' | 'shared';

export default function CreatePlanScreen() {
  const { createPlan } = useRestaurants();
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [collectionType, setCollectionType] = useState<CollectionType>('public');
  const [showCalendar, setShowCalendar] = useState(false);

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
        plannedDate: selectedDate?.toISOString() || plannedDate.trim() || undefined,
        isPublic: collectionType === 'public'
      });
      
      await createPlan({
        name: name.trim(),
        description: description.trim() || undefined,
        plannedDate: selectedDate?.toISOString() || plannedDate.trim() || undefined,
        isPublic: collectionType === 'public',
        collection_type: collectionType,
        occasion: selectedOccasion || undefined
      });
      
      console.log('[CreatePlan] Plan created successfully');
      Alert.alert('Success', 'Plan created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('[CreatePlan] Error creating plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to create plan: ${errorMessage}`);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setPlannedDate(formatDate(date));
    setShowCalendar(false);
  };

  const getCollectionTypeInfo = (type: CollectionType) => {
    switch (type) {
      case 'public':
        return {
          icon: <Globe size={20} color="#FF6B6B" />,
          title: 'Public',
          description: 'Visible to everyone on the app',
          color: '#FF6B6B'
        };
      case 'private':
        return {
          icon: <Lock size={20} color="#6B7280" />,
          title: 'Private',
          description: 'Only visible to you',
          color: '#6B7280'
        };
      case 'shared':
        return {
          icon: <Users size={20} color="#3B82F6" />,
          title: 'Shared',
          description: 'Visible to you and invited members',
          color: '#3B82F6'
        };
    }
  };

  // Simple date picker component
  const SimpleDatePicker = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const quickDates = [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      { label: 'Next Week', date: nextWeek },
      { label: 'Next Month', date: nextMonth }
    ];

    return (
      <View style={styles.datePickerContainer}>
        <Text style={styles.datePickerTitle}>Quick Select</Text>
        <View style={styles.quickDatesGrid}>
          {quickDates.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickDateButton}
              onPress={() => handleDateSelect(item.date)}
            >
              <Text style={styles.quickDateLabel}>{item.label}</Text>
              <Text style={styles.quickDateValue}>
                {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.datePickerTitle}>Or enter manually</Text>
        <TextInput
          style={styles.manualDateInput}
          placeholder="e.g., Next Friday, Dec 15th"
          placeholderTextColor="#999"
          value={plannedDate}
          onChangeText={setPlannedDate}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Plan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => setShowCalendar(true)}
            >
              <CalendarIcon size={20} color="#666" />
              <Text style={styles.dateInputText}>
                {plannedDate || "Select a date"}
              </Text>
            </TouchableOpacity>
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
            <Text style={styles.label}>Collection Type</Text>
            <View style={styles.collectionTypeOptions}>
              {(['public', 'private', 'shared'] as CollectionType[]).map(type => {
                const info = getCollectionTypeInfo(type);
                const isSelected = collectionType === type;
                
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.collectionTypeOption,
                      isSelected && { borderColor: info.color, backgroundColor: `${info.color}10` }
                    ]}
                    onPress={() => setCollectionType(type)}
                  >
                    <View style={styles.collectionTypeHeader}>
                      {info.icon}
                      <Text style={[
                        styles.collectionTypeTitle,
                        isSelected && { color: info.color }
                      ]}>
                        {info.title}
                      </Text>
                    </View>
                    <Text style={styles.collectionTypeDescription}>
                      {info.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={styles.calendarClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <SimpleDatePicker />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Adjust as needed for spacing
  },
  scrollView: {
    flex: 1,
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  dateInputText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
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
  collectionTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  collectionTypeOption: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  collectionTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  collectionTypeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarClose: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  datePickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  quickDatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  quickDateButton: {
    width: '48%', // Two buttons per row
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickDateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  quickDateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  manualDateInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
});