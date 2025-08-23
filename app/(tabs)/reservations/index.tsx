import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, Clock, MapPin, Users, Phone, X } from 'lucide-react-native';

interface Reservation {
  id: string;
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  address: string;
  phone: string;
  confirmationNumber: string;
}

const mockReservations: Reservation[] = [
  {
    id: '1',
    restaurantName: 'Le Bernardin',
    date: '2024-01-15',
    time: '7:30 PM',
    partySize: 2,
    status: 'confirmed',
    address: '155 West 51st Street, New York, NY',
    phone: '(212) 554-1515',
    confirmationNumber: 'LB2024001'
  },
  {
    id: '2',
    restaurantName: 'Eleven Madison Park',
    date: '2024-01-20',
    time: '6:00 PM',
    partySize: 4,
    status: 'pending',
    address: '11 Madison Avenue, New York, NY',
    phone: '(212) 889-0905',
    confirmationNumber: 'EMP2024002'
  },
  {
    id: '3',
    restaurantName: 'Joe\'s Pizza',
    date: '2024-01-10',
    time: '12:30 PM',
    partySize: 3,
    status: 'cancelled',
    address: '7 Carmine Street, New York, NY',
    phone: '(212) 366-1182',
    confirmationNumber: 'JP2024003'
  }
];

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const handleCancelReservation = (id: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setReservations(prev => 
              prev.map(res => 
                res.id === id ? { ...res, status: 'cancelled' as const } : res
              )
            );
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#50C878';
      case 'pending': return '#FFB347';
      case 'cancelled': return '#FF6B6B';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'upcoming':
        return reservationDate >= today && reservation.status !== 'cancelled';
      case 'past':
        return reservationDate < today || reservation.status === 'cancelled';
      default:
        return true;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {(['upcoming', 'past', 'all'] as const).map(filterType => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === filterType && styles.filterButtonTextActive
            ]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredReservations.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#999" />
            <Text style={styles.emptyTitle}>No reservations found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'upcoming' 
                ? 'You don\'t have any upcoming reservations'
                : filter === 'past'
                ? 'No past reservations to show'
                : 'You haven\'t made any reservations yet'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.reservationsList}>
            {filteredReservations.map(reservation => (
              <View key={reservation.id} style={styles.reservationCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.restaurantName}>{reservation.restaurantName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                      {getStatusText(reservation.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.reservationDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {new Date(reservation.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.detailText}>{reservation.time}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Users size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.detailText}>{reservation.address}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Phone size={16} color="#666" />
                    <Text style={styles.detailText}>{reservation.phone}</Text>
                  </View>
                </View>

                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>Confirmation #</Text>
                  <Text style={styles.confirmationNumber}>{reservation.confirmationNumber}</Text>
                </View>

                {reservation.status === 'confirmed' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => handleCancelReservation(reservation.id)}
                    >
                      <X size={16} color="#FF6B6B" />
                      <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  reservationsList: {
    padding: 16,
    gap: 16,
  },
  reservationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reservationDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 12,
    color: '#999',
  },
  confirmationNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B6B',
  },
});