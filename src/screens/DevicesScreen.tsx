import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { mockDevices } from '../data/mockData';
import { Device, DeviceStatus, RootStackParamList } from '../types';

type DevicesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

const STATUS_COLOR: Record<DeviceStatus, string> = {
  online: '#34C759',
  offline: '#FF3B30',
  warning: '#FF9500',
  updating: '#007AFF',
};

const STATUS_LABEL: Record<DeviceStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  warning: 'Warning',
  updating: 'Updating',
};

const FILTER_OPTIONS: { label: string; value: DeviceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Warning', value: 'warning' },
  { label: 'Updating', value: 'updating' },
];

function DeviceCard({
  device,
  onPress,
}: {
  device: Device;
  onPress: () => void;
}) {
  const storagePercent = Math.round(
    (device.storageUsed / device.storageTotal) * 100
  );
  const storageColor =
    storagePercent >= 90
      ? '#FF3B30'
      : storagePercent >= 75
        ? '#FF9500'
        : '#34C759';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLOR[device.status] },
            ]}
          />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {device.name}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: STATUS_COLOR[device.status] + '22' },
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              { color: STATUS_COLOR[device.status] },
            ]}
          >
            {STATUS_LABEL[device.status]}
          </Text>
        </View>
      </View>

      <Text style={styles.cardModel}>{device.model}</Text>
      <Text style={styles.cardMeta}>
        {device.owner} · {device.department}
      </Text>
      <Text style={styles.cardMeta}>Last seen: {device.lastSeen}</Text>

      <View style={styles.storageRow}>
        <Text style={styles.storageLabel}>Storage</Text>
        <Text style={styles.storagePercent}>{storagePercent}%</Text>
      </View>
      <View style={styles.storageBar}>
        <View
          style={[
            styles.storageBarFill,
            { width: `${storagePercent}%`, backgroundColor: storageColor },
          ]}
        />
      </View>

      {device.batteryLevel !== null && (
        <Text style={styles.batteryText}>
          🔋 {device.batteryLevel}% battery
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function DevicesScreen() {
  const navigation = useNavigation<DevicesNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DeviceStatus | 'all'>(
    'all'
  );

  const filteredDevices = mockDevices.filter((device) => {
    const matchesSearch =
      searchQuery === '' ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' || device.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Devices</Text>
        <Text style={styles.deviceCount}>{filteredDevices.length} found</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search devices, owners..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterPill,
              activeFilter === option.value && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter(option.value)}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === option.value && styles.filterPillTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            onPress={() => navigation.navigate('DeviceDetail', { device: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No devices found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  deviceCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#1C1C1E',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterPillActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterPillText: {
    fontSize: 13,
    color: '#3C3C43',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardModel: {
    fontSize: 13,
    color: '#3C3C43',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  storageLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  storagePercent: {
    fontSize: 12,
    color: '#3C3C43',
    fontWeight: '600',
  },
  storageBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  batteryText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
