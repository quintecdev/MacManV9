import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { mockAlerts } from '../data/mockData';

type AlertSeverity = 'warning' | 'info' | 'success';

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  warning: '#FF9500',
  info: '#007AFF',
  success: '#34C759',
};

const SEVERITY_ICON: Record<AlertSeverity, string> = {
  warning: '⚠️',
  info: 'ℹ️',
  success: '✅',
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  warning: 'Warning',
  info: 'Info',
  success: 'Resolved',
};

function AlertCard({
  alert,
}: {
  alert: (typeof mockAlerts)[0];
}) {
  const severity = alert.severity as AlertSeverity;
  const color = SEVERITY_COLOR[severity];

  return (
    <View style={[styles.alertCard, { borderLeftColor: color }]}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertIcon}>{SEVERITY_ICON[severity]}</Text>
        <View style={styles.alertHeaderText}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <View
            style={[styles.severityPill, { backgroundColor: color + '22' }]}
          >
            <Text style={[styles.severityPillText, { color }]}>
              {SEVERITY_LABEL[severity]}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.alertMessage}>{alert.message}</Text>
      <View style={styles.alertFooter}>
        <Text style={styles.alertDevice}>📱 {alert.device}</Text>
        <Text style={styles.alertTime}>{alert.time}</Text>
      </View>
    </View>
  );
}

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Alerts</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{mockAlerts.length}</Text>
        </View>
      </View>

      <FlatList
        data={mockAlerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <AlertCard alert={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptySubtitle}>No alerts at this time.</Text>
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
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  countBadge: {
    backgroundColor: '#FF3B30',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  severityPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 13,
    color: '#3C3C43',
    lineHeight: 18,
    marginBottom: 10,
    paddingLeft: 30,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30,
  },
  alertDevice: {
    fontSize: 12,
    color: '#8E8E93',
  },
  alertTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
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
