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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, DeviceStatus } from '../types';

type DeviceDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeviceDetail'
>;

type DeviceDetailRouteProp = RouteProp<RootStackParamList, 'DeviceDetail'>;

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} selectable>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DeviceDetailScreen() {
  const navigation = useNavigation<DeviceDetailNavigationProp>();
  const route = useRoute<DeviceDetailRouteProp>();
  const { device } = route.params;

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹ Devices</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {device.name}
        </Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <View style={styles.statusCard}>
          <Text style={styles.deviceModel}>{device.model}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLOR[device.status] },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLOR[device.status] },
              ]}
            >
              {STATUS_LABEL[device.status]}
            </Text>
            <Text style={styles.lastSeen}>· Last seen {device.lastSeen}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon="🔄"
            label="Restart"
            color="#FF9500"
            onPress={() => {}}
          />
          <ActionButton
            icon="⬆️"
            label="Update"
            color="#007AFF"
            onPress={() => {}}
          />
          <ActionButton
            icon="🔒"
            label="Lock"
            color="#FF3B30"
            onPress={() => {}}
          />
          <ActionButton
            icon="📋"
            label="Reports"
            color="#5856D6"
            onPress={() => {}}
          />
        </View>

        {/* System Info */}
        <Text style={styles.sectionTitle}>System Info</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Serial Number" value={device.serialNumber} />
          <View style={styles.divider} />
          <InfoRow label="macOS Version" value={device.osVersion} />
          <View style={styles.divider} />
          <InfoRow label="IP Address" value={device.ipAddress} />
          <View style={styles.divider} />
          <InfoRow label="Owner" value={device.owner} />
          <View style={styles.divider} />
          <InfoRow label="Department" value={device.department} />
        </View>

        {/* Storage */}
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageUsed}>
              {device.storageUsed} GB used
            </Text>
            <Text style={styles.storageTotal}>
              of {device.storageTotal} GB
            </Text>
          </View>
          <View style={styles.storageBar}>
            <View
              style={[
                styles.storageBarFill,
                { width: `${storagePercent}%`, backgroundColor: storageColor },
              ]}
            />
          </View>
          <Text style={[styles.storagePercent, { color: storageColor }]}>
            {storagePercent}% used
          </Text>
        </View>

        {/* Battery (if applicable) */}
        {device.batteryLevel !== null && (
          <>
            <Text style={styles.sectionTitle}>Battery</Text>
            <View style={styles.storageCard}>
              <View style={styles.storageHeader}>
                <Text style={styles.storageUsed}>
                  {device.batteryLevel}% charge remaining
                </Text>
              </View>
              <View style={styles.storageBar}>
                <View
                  style={[
                    styles.storageBarFill,
                    {
                      width: `${device.batteryLevel}%`,
                      backgroundColor:
                        device.batteryLevel < 20 ? '#FF3B30' : '#34C759',
                    },
                  ]}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
  },
  backButton: {
    width: 80,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceModel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastSeen: {
    fontSize: 13,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 16,
  },
  storageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  storageUsed: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  storageTotal: {
    fontSize: 14,
    color: '#8E8E93',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storagePercent: {
    fontSize: 13,
    fontWeight: '600',
  },
});
