// src/screens/AnalyticsScreen.tsx
import { ChartNoAxesCombined, TriangleAlert } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, shadows, spacing, typography } from '../theme';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const result = useAppStore((s) => s.currentResult);

  const levelChart = useMemo(() => {
    if (!result?.niveaux) return [];
    return result.niveaux.slice(0, 100).map((n: any) => ({
      value: n.dbfs,
      label: undefined,
    }));
  }, [result]);

  const participationChart = useMemo(() => {
    if (!result?.statistics) return [];
    return result.statistics.map((s: any, i: number) => ({
      value: s.secondes,
      label: s.nom.slice(0, 6),
      frontColor: [colors.primary[500], colors.accent.cyan, colors.accent.coral][i % 3],
    }));
  }, [result]);

  if (!result) {
    return (
      <View style={[styles.container, styles.center]}>
        <ChartNoAxesCombined size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>Aucune analyse disponible</Text>
        <Text style={styles.emptyText}>
          Lancez une analyse depuis l'onglet Analyser.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['3xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.eyebrow}>ANALYTICS</Text>
          <Text style={styles.title}>Résultats de la séance</Text>
          <Text style={styles.subtitle}>
            {new Date(result.date).toLocaleString('fr-FR')} · {formatClock(result.duree)}
          </Text>
        </Animated.View>

        {result.warnings?.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.warningCard}>
            <TriangleAlert size={18} color={colors.warning} />
            <View style={{ flex: 1 }}>
              {result.warnings.map((w: string, i: number) => (
                <Text key={i} style={styles.warningText}>• {w}</Text>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Niveau sonore */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)} style={styles.card}>
          <Text style={styles.cardTitle}>Niveau sonore numérique</Text>
          <Text style={styles.cardHint}>Échantillon des 100 premières fenêtres</Text>
          {levelChart.length > 0 ? (
            <View style={styles.chartWrap}>
              <LineChart
                data={levelChart}
                height={180}
                width={300}
                color={colors.chart.line}
                thickness={2}
                hideDataPoints
                yAxisColor={colors.border}
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                noOfSections={4}
                formatYLabel={(v) => `${Math.round(Number(v))}`}
                initialSpacing={0}
                endSpacing={0}
                curved
              />
            </View>
          ) : (
            <Text style={styles.noData}>Aucune donnée</Text>
          )}
        </Animated.View>

        {/* Participation */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.card}>
          <Text style={styles.cardTitle}>Temps de parole estimé</Text>
          {participationChart.length > 0 ? (
            <View style={styles.chartWrap}>
              <BarChart
                data={participationChart}
                height={180}
                barWidth={32}
                spacing={24}
                rounded
                barBorderRadius={6}
                yAxisColor={colors.border}
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                noOfSections={4}
              />
            </View>
          ) : (
            <Text style={styles.noData}>Aucune parole attribuable détectée.</Text>
          )}
        </Animated.View>

        {/* Statistiques table */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.card}>
          <Text style={styles.cardTitle}>Détails par locuteur</Text>
          {result.statistics.map((s: any) => (
            <View key={s.nom} style={styles.statRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.statName}>{s.nom}</Text>
                <Text style={styles.statMeta}>
                  {s.prises} prise{s.prises > 1 ? 's' : ''} · {s.participation.toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.statValue}>{s.secondes.toFixed(1)} s</Text>
            </View>
          ))}
        </Animated.View>

        {/* Événements sonores */}
        {result.events?.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.card}>
            <Text style={styles.cardTitle}>Événements sonores</Text>
            {result.events.slice(0, 8).map((e: any, i: number) => (
              <View key={i} style={styles.eventRow}>
                <Text style={styles.eventTime}>{formatClock(e.debut)}</Text>
                <Text style={styles.eventCat}>{e.categorie}</Text>
                <Text style={styles.eventScore}>{e.score.toFixed(2)}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },

  eyebrow: {
    ...typography.caption,
    color: colors.accent.coral,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.bodySm, color: colors.textSecondary },

  emptyTitle: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  emptyText: { ...typography.bodySm, color: colors.textSecondary, textAlign: 'center' },

  warningCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  warningText: { ...typography.bodySm, color: '#92400E' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.sm,
  },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  cardHint: { ...typography.caption, color: colors.textSecondary, marginTop: -spacing.sm },
  chartWrap: { alignItems: 'center', marginTop: spacing.sm },
  noData: { ...typography.bodySm, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl },

  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  statMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statValue: { ...typography.h3, color: colors.primary[600] },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  eventTime: { ...typography.mono, color: colors.textTertiary, width: 60 },
  eventCat: { ...typography.body, color: colors.textPrimary, flex: 1 },
  eventScore: { ...typography.caption, color: colors.textSecondary },
});