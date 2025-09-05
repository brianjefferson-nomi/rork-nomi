import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { SearchFilters } from '@/services/restaurant-pagination';
import { useRestaurantFilterOptions } from '@/hooks/use-restaurant-pagination';

interface RestaurantFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
  style?: any;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

function FilterSection({ title, children, isExpanded = true, onToggle }: FilterSectionProps) {
  return (
    <View style={styles.filterSection}>
      <TouchableOpacity 
        style={styles.filterSectionHeader} 
        onPress={onToggle}
        disabled={!onToggle}
      >
        <Text style={styles.filterSectionTitle}>{title}</Text>
        {onToggle && (
          <Text style={styles.filterSectionToggle}>
            {isExpanded ? '−' : '+'}
          </Text>
        )}
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.filterSectionContent}>
          {children}
        </View>
      )}
    </View>
  );
}

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
}

function MultiSelect({ options, selected, onSelectionChange, placeholder }: MultiSelectProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleToggleOption = useCallback((option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onSelectionChange(newSelected);
  }, [selected, onSelectionChange]);

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    onSelectionChange(filteredOptions);
  }, [filteredOptions, onSelectionChange]);

  return (
    <View style={styles.multiSelectContainer}>
      <TouchableOpacity 
        style={styles.multiSelectButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.multiSelectButtonText}>
          {selected.length === 0 
            ? placeholder || 'Select options'
            : `${selected.length} selected`
          }
        </Text>
        <Text style={styles.multiSelectButtonArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={styles.modalActionText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSelectAll}>
                <Text style={styles.modalActionText}>Select All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search options..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ScrollView style={styles.optionsList}>
            {filteredOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  selected.includes(option) && styles.optionItemSelected
                ]}
                onPress={() => handleToggleOption(option)}
              >
                <Text style={[
                  styles.optionText,
                  selected.includes(option) && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
                {selected.includes(option) && (
                  <Text style={styles.optionCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
}

function RangeSlider({ min, max, value, onValueChange, step = 0.1, label }: RangeSliderProps) {
  // Simplified range slider implementation
  // In a real app, you'd use a proper slider component
  return (
    <View style={styles.rangeSliderContainer}>
      {label && <Text style={styles.rangeSliderLabel}>{label}</Text>}
      <View style={styles.rangeSliderTrack}>
        <View style={styles.rangeSliderFill} />
        <View style={styles.rangeSliderThumb} />
      </View>
      <View style={styles.rangeSliderLabels}>
        <Text style={styles.rangeSliderLabelText}>{min}</Text>
        <Text style={styles.rangeSliderLabelText}>{value[0]} - {value[1]}</Text>
        <Text style={styles.rangeSliderLabelText}>{max}</Text>
      </View>
    </View>
  );
}

export default function RestaurantFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  style 
}: RestaurantFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    cuisine: true,
    neighborhood: true,
    price: true,
    rating: true,
    location: true,
    features: true
  });

  const { cuisines, neighborhoods, cities, priceRanges } = useRestaurantFilterOptions();

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Filters',
      'Are you sure you want to reset all filters?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onReset }
      ]
    );
  }, [onReset]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.cuisine?.length) count++;
    if (filters.neighborhood?.length) count++;
    if (filters.city) count++;
    if (filters.priceRange?.length) count++;
    if (filters.minRating !== undefined) count++;
    if (filters.maxRating !== undefined) count++;
    if (filters.hasImages) count++;
    if (filters.hasCoordinates) count++;
    if (filters.source) count++;
    return count;
  }, [filters]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        {activeFiltersCount > 0 && (
          <View style={styles.activeFiltersBadge}>
            <Text style={styles.activeFiltersText}>{activeFiltersCount}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cuisine Filter */}
        <FilterSection
          title="Cuisine"
          isExpanded={expandedSections.cuisine}
          onToggle={() => toggleSection('cuisine')}
        >
          <MultiSelect
            options={cuisines}
            selected={filters.cuisine || []}
            onSelectionChange={(selected) => updateFilter('cuisine', selected)}
            placeholder="Select cuisines"
          />
        </FilterSection>

        {/* Neighborhood Filter */}
        <FilterSection
          title="Neighborhood"
          isExpanded={expandedSections.neighborhood}
          onToggle={() => toggleSection('neighborhood')}
        >
          <MultiSelect
            options={neighborhoods}
            selected={filters.neighborhood || []}
            onSelectionChange={(selected) => updateFilter('neighborhood', selected)}
            placeholder="Select neighborhoods"
          />
        </FilterSection>

        {/* City Filter */}
        <FilterSection
          title="City"
          isExpanded={expandedSections.location}
          onToggle={() => toggleSection('location')}
        >
          <MultiSelect
            options={cities}
            selected={filters.city ? [filters.city] : []}
            onSelectionChange={(selected) => updateFilter('city', selected[0] || undefined)}
            placeholder="Select city"
          />
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <MultiSelect
            options={priceRanges}
            selected={filters.priceRange || []}
            onSelectionChange={(selected) => updateFilter('priceRange', selected)}
            placeholder="Select price ranges"
          />
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection
          title="Rating"
          isExpanded={expandedSections.rating}
          onToggle={() => toggleSection('rating')}
        >
          <RangeSlider
            min={0}
            max={5}
            value={[filters.minRating || 0, filters.maxRating || 5]}
            onValueChange={([min, max]) => {
              updateFilter('minRating', min);
              updateFilter('maxRating', max);
            }}
            step={0.1}
            label="Rating Range"
          />
        </FilterSection>

        {/* Features Filter */}
        <FilterSection
          title="Features"
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
        >
          <View style={styles.switchContainer}>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Has Photos</Text>
              <Switch
                value={filters.hasImages || false}
                onValueChange={(value) => updateFilter('hasImages', value)}
                trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
                thumbColor={filters.hasImages ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Has Location</Text>
              <Switch
                value={filters.hasCoordinates || false}
                onValueChange={(value) => updateFilter('hasCoordinates', value)}
                trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
                thumbColor={filters.hasCoordinates ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </FilterSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activeFiltersBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  activeFiltersText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterSectionToggle: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  filterSectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  multiSelectContainer: {
    marginBottom: 8,
  },
  multiSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  multiSelectButtonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  multiSelectButtonArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCloseButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  modalActionText: {
    color: '#666',
    fontSize: 14,
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 14,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionItemSelected: {
    backgroundColor: '#F8F9FA',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  optionCheckmark: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  rangeSliderContainer: {
    marginBottom: 8,
  },
  rangeSliderLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  rangeSliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
  },
  rangeSliderFill: {
    height: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
    width: '60%',
  },
  rangeSliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    left: '60%',
  },
  rangeSliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeSliderLabelText: {
    fontSize: 12,
    color: '#666',
  },
  switchContainer: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
});
