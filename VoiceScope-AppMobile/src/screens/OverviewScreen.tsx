// src/screens/OverviewScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Button } from '../components/Button';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { api, ApiError } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import {
    colors,
    gradients,
    radius,
    shadows,
    spacing,
    typography,
} from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  
  const profiles = useAppStore((s) => s.profiles);
  const setProfiles = useAppStore((s) => s.setProfiles);
  const currentResult = useAppStore((s) => s.currentResult);
  const sessions = useAppStore((s) => s.sessions);
  const setSessions = useAppStore((s) => s.setSessions);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([api.getProfiles(), api.getSessions()]);
      setProfiles(p);
      setSessions(s);
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setRefreshing(false);
    }
  }, [setProfiles, setSessions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = currentResult?.statistics ?? [];
  const noiseLeader = currentResult?.locuteur_bruit_principal;
  const dominantSpeaker = stats
    .filter((s: any) => s.nom !== 'Inconnu')
    .sort((a: any, b: any) => b.secondes - a.secondes)[0]?.nom;

  const kpis = [
    {
      label: 'Niveau moyen',
      value: currentResult ? `${currentResult.acoustics.dbfs.toFixed(1)} dBFS` : '—',
      icon: 'volume-2',
      color: colors.primary[600],
    },
    {
      label: 'Fréquence dominante',
      value: currentResult?.acoustics.dominant_hz
        ? `${Math.round(currentResult.acoustics.dominant_hz)} Hz`
        : '—',
      icon: 'activity',
      color: colors.accent.cyan,
    },
    {
      label: 'Profils vocaux',
      value: `${profiles.length} / 3`,
      icon: 'users',
      color: colors.accent.violet,
    },
    {
      label: 'Voix dominante',
      value: noiseLeader || dominantSpeaker || '—',
      icon: 'mic',
      color: colors.accent.coral,
    },
    {
      label: 'Durée analysée',
      value: currentResult ? formatClock(currentResult.duree) : '—',
      icon: 'clock',
      color: colors.accent.lime,
    },
    {
      label: 'Alertes',
      value: currentResult ? String(currentResult.alerts.length) : '—',
      icon: 'alert-triangle',
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary[600]} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.brandRow}>
            <LinearGradient
              colors={[colors.accent.coral, '#F5A46D'] as const}
              style={styles.brandIcon}
            >
              <Icon name="audio-lines" size={22} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={styles.brandName}>
                VoiceScope <Text style={styles.brandBadge}>AI</Text>
              </Text>
              <Text style={styles.brandTagline}>CLASSROOM INTELLIGENCE</Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings' as never)}
            style={styles.avatar}
          >
            <Icon name="settings" size={20} color={colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {error && (
          <Animated.View entering={FadeIn} style={styles.errorBanner}>
            <Icon name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(80)}>
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroDecor} />
            <Text style={styles.heroEyebrow}>CHAQUE VOIX COMPTE</Text>
            <Text style={styles.heroTitle}>
              Une nouvelle façon{'\n'}d'écouter votre classe.
            </Text>
            <Text style={styles.heroSubtitle}>
              Des signaux aux échanges : explorez votre séance.
            </Text>
            <Button
              label="Nouvelle analyse"
              icon="arrow-up-right"
              iconPosition="right"
              variant="primary"
              size="md"
              onPress={() => navigation.navigate('Analysis' as never)}
              style={styles.heroCta}
            />
          </LinearGradient>
        </Animated.View>

        {/* KPIs Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, index) => (
            <Animated.View
              key={kpi.label}
              entering={FadeInDown.duration(400).delay(150 + index * 40)}
              style={styles.kpiCard}
            >
              <View style={[styles.kpiIconWrap, { backgroundColor: `${kpi.color}15` }]}>
                <Icon name={kpi.icon} size={18} color={kpi.color} />
              </View>
              <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
                {kpi.value}
              </Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Empty / Result state */}
        {!currentResult && (
          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Icon name="audio-lines" size={32} color={colors.primary[500]} />
            </View>
            <Text style={styles.emptyTitle}>Votre salle de classe, en perspective.</Text>
            <Text style={styles.emptyText}>
              Importez ou enregistrez une séance pour explorer le son, les voix
              et les interventions.
            </Text>
            <Button
              label="Analyser un enregistrement"
              icon="arrow-right"
              iconPosition="right"
              onPress={() => navigation.navigate('Analysis' as never)}
            />
          </Animated.View>
        )}

        {/* Historique */}
        {sessions.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historique récent</Text>
              <Text style={styles.sectionLink}>{sessions.length} séances</Text>
            </View>
            {sessions.slice(0, 3).map((session) => (
              <Pressable
                key={session.id}
                onPress={() => navigation.navigate('SessionDetail', { id: session.id })}
                style={({ pressed }) => [
                  styles.sessionCard,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.sessionIcon}>
                  <Icon name="file-audio" size={18} color={colors.primary[600]} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.sessionDuration}>
                    {formatClock(session.duree)} de séance
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textTertiary} />
              </Pressable>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(4, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.xl },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandIcon: {
    width: 40,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brand,
  },
  brandName: { ...typography.h3, color: colors.textPrimary, letterSpacing: -0.4 },
  brandBadge: {
    color: colors.accent.coral,
    fontSize: 12,
  },
  brandTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.bodySm, color: colors.danger, flex: 1 },
  
  hero: {
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroDecor: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(184, 217, 107, 0.15)',
    right: -60,
    bottom: -80,
  },
  heroEyebrow: {
    ...typography.caption,
    color: colors.accent.coral,
    letterSpacing: 2.4,
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.xl,
  },
  heroCta: { alignSelf: 'flex-start' },
  
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  kpiCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kpiValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  sectionLink: { ...typography.bodySm, color: colors.primary[600] },
  
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: { flex: 1 },
  sessionDate: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  sessionDuration: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});