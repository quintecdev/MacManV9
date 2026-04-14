import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface SettingRow {
  label: string;
  description?: string;
  type: 'toggle' | 'action' | 'info';
  value?: boolean;
  actionColor?: string;
  infoValue?: string;
}

interface SettingSection {
  title: string;
  rows: SettingRow[];
}

const SECTIONS: SettingSection[] = [
  {
    title: 'Notifications',
    rows: [
      {
        label: 'Push Notifications',
        description: 'Receive alerts for device events',
        type: 'toggle',
        value: true,
      },
      {
        label: 'Offline Alerts',
        description: 'Notify when a device goes offline',
        type: 'toggle',
        value: true,
      },
      {
        label: 'Update Reminders',
        description: 'Remind me when updates are available',
        type: 'toggle',
        value: false,
      },
    ],
  },
  {
    title: 'Sync & Data',
    rows: [
      {
        label: 'Auto Sync',
        description: 'Automatically sync device data',
        type: 'toggle',
        value: true,
      },
      {
        label: 'Sync Interval',
        type: 'info',
        infoValue: 'Every 5 min',
      },
      {
        label: 'Last Synced',
        type: 'info',
        infoValue: '2 minutes ago',
      },
    ],
  },
  {
    title: 'Account',
    rows: [
      {
        label: 'Organization',
        type: 'info',
        infoValue: 'MacMan Corp',
      },
      {
        label: 'Admin User',
        type: 'info',
        infoValue: 'admin@macman.io',
      },
      {
        label: 'Sign Out',
        type: 'action',
        actionColor: '#FF3B30',
      },
    ],
  },
  {
    title: 'About',
    rows: [
      {
        label: 'App Version',
        type: 'info',
        infoValue: '9.0.0',
      },
      {
        label: 'MDM Protocol',
        type: 'info',
        infoValue: 'v4.2',
      },
      {
        label: 'Privacy Policy',
        type: 'action',
        actionColor: '#007AFF',
      },
      {
        label: 'Terms of Service',
        type: 'action',
        actionColor: '#007AFF',
      },
    ],
  },
];

export default function SettingsScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Push Notifications': true,
    'Offline Alerts': true,
    'Update Reminders': false,
    'Auto Sync': true,
  });

  const handleAction = (label: string) => {
    if (label === 'Sign Out') {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.rows.map((row, index) => (
                <View key={row.label}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                      {row.description ? (
                        <Text style={styles.rowDescription}>
                          {row.description}
                        </Text>
                      ) : null}
                    </View>
                    {row.type === 'toggle' && (
                      <Switch
                        value={toggles[row.label] ?? row.value ?? false}
                        onValueChange={(value) =>
                          setToggles((prev) => ({
                            ...prev,
                            [row.label]: value,
                          }))
                        }
                        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                        thumbColor="#FFFFFF"
                      />
                    )}
                    {row.type === 'info' && (
                      <Text style={styles.infoValue}>{row.infoValue}</Text>
                    )}
                    {row.type === 'action' && (
                      <TouchableOpacity
                        onPress={() => handleAction(row.label)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.actionText,
                            { color: row.actionColor ?? '#007AFF' },
                          ]}
                        >
                          {row.label === 'Sign Out' ? 'Sign Out' : '›'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
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
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '400',
  },
  rowDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 16,
  },
});
