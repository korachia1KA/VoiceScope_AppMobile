// src/screens/SessionDetailScreen.tsx
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { api, ApiError } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, shadows, spacing, typography } from '../theme';

type Route = RouteProp<RootStackParamList, 'SessionDetail'>;

export default function SessionDetailScreen() {
  const route = useRoute<Route>();
  const setCurrentResult = useAppStore((s) => s.setCurrentResult);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.getSession(route.params.id);
        setResult(r);
        setCurrentResult(r);
      } catch (e) {
        setError((e as ApiError).detail);
      }
    })();
  }, [route.params.id, setCurrentResult]);

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        Séance du {new Date(result.date).toLocaleString('fr-FR')}
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Résumé</Text>
        <Row label="Durée" value={`${result.duree.toFixed(1)} s`} />
        <Row label="Langue détectée" value={result.langue ?? '—'} />
        <Row label="Profils" value={String(result.profiles.length)} />
        <Row label="Événements" value={String(result.events.length)} />
        <Row label="Alertes" value={String(result.alerts.length)} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
  error: { ...typography.body, color: colors.danger, textAlign: 'center', padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.sm,
  },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowValue: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
});