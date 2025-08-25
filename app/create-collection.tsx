import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { useRestaurants } from '@/hooks/restaurant-store';
import { useAuth } from '@/hooks/auth-store';
import { ChevronLeft, Users, Lock, Globe, Calendar as CalendarIcon, ChevronRight, ChevronDown } from 'lucide-react-native';

const occasions = ['Birthday', 'Date Night', 'Business', 'Casual', 'Late Night', 'Brunch', 'Special Occasion'];

type CollectionType = 'public' | 'private' | 'shared';

// Custom Calendar Component
const CustomCalendar = ({ onDateSelect, onClose }: { onDateSelect: (date: Date) => void; onClose: () => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDatePress = (day: number) => {
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(selectedDateObj);
  };

  const confirmDate = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const weekDays = getWeekDays();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>Select Date</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.calendarClose}>Cancel</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarNavigation}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <ChevronLeft size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthYear}>{getMonthName(currentMonth)}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <ChevronRight size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={index} style={styles.emptyDay} />;
          }
          
          const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const isSelected = selectedDate && 
            selectedDate.getDate() === day && 
            selectedDate.getMonth() === currentMonth.getMonth() && 
            selectedDate.getFullYear() === currentMonth.getFullYear();
          const isToday = new Date().toDateString() === dateObj.toDateString();
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                isToday && styles.today,
                isSelected && styles.selectedDay
              ]}
              onPress={() => handleDatePress(day)}
            >
              <Text style={[
                styles.dayText,
                isToday && styles.todayText,
                isSelected && styles.selectedDayText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.calendarFooter}>
        <TouchableOpacity 
          style={[styles.confirmButton, !selectedDate && styles.confirmButtonDisabled]} 
          onPress={confirmDate}
          disabled={!selectedDate}
        >
          <Text style={styles.confirmButtonText}>Confirm Date</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
            
            {/* Quick Date Options */}
            <View style={styles.quickDateOptions}>
              <Text style={styles.quickDateLabel}>Quick Select:</Text>
              <View style={styles.quickDateButtons}>
                {[
                  { label: 'Today', date: new Date() },
                  { label: 'Tomorrow', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
                  { label: 'Next Week', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                  { label: 'Next Month', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
                ].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickDateButton}
                    onPress={() => handleDateSelect(option.date)}
                  >
                    <Text style={styles.quickDateButtonText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
          <CustomCalendar 
            onDateSelect={handleDateSelect} 
            onClose={() => setShowCalendar(false)} 
          />
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
  quickDateOptions: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  quickDateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  quickDateButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  calendarNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    padding: 10,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quickDateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  weekDay: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  calendarDay: {
    width: '14%', // 7 days in a week
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  emptyDay: {
    width: '14%',
    aspectRatio: 1,
  },
  today: {
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
  },
  todayText: {
    color: '#007BFF',
  },
  selectedDay: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
  },
  selectedDayText: {
    color: '#FFF',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  calendarFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#D3D3D3',
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});