import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { mockStats, mockDevices } from '../data/mockData';
import { DeviceStatus } from '../types';

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

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const recentDevices = mockDevices.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.title}>MacMan V9</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {mockStats.pendingUpdates} updates
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total"
            value={mockStats.totalDevices}
            color="#007AFF"
          />
          <StatCard
            label="Online"
            value={mockStats.onlineDevices}
            color="#34C759"
          />
          <StatCard
            label="Offline"
            value={mockStats.offlineDevices}
            color="#FF3B30"
          />
          <StatCard
            label="Alerts"
            value={mockStats.warningDevices}
            color="#FF9500"
          />
        </View>

        {/* Pending Updates Banner */}
        {mockStats.pendingUpdates > 0 && (
          <TouchableOpacity style={styles.updateBanner} activeOpacity={0.8}>
            <View style={styles.updateBannerContent}>
              <Text style={styles.updateIcon}>⬆️</Text>
              <View style={styles.updateText}>
                <Text style={styles.updateTitle}>
                  {mockStats.pendingUpdates} Pending Updates
                </Text>
                <Text style={styles.updateSubtitle}>
                  Tap to review and deploy
                </Text>
              </View>
            </View>
            <Text style={styles.updateChevron}>›</Text>
          </TouchableOpacity>
        )}

        {/* Recent Devices */}
        <Text style={styles.sectionTitle}>Recent Devices</Text>
        {recentDevices.map((device) => (
          <View key={device.id} style={styles.deviceRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLOR[device.status] },
              ]}
            />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>
                {device.owner} · {device.lastSeen}
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
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  badge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  updateBanner: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  updateBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateIcon: {
    fontSize: 24,
  },
  updateText: {
    gap: 2,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  updateSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  updateChevron: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  deviceRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deviceInfo: {
    flex: 1,
    gap: 2,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  deviceMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
