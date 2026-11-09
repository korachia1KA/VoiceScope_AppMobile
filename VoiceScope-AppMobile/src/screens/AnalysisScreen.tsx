// src/screens/AnalysisScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from '../components/Icon';
import { AudioRecorder } from '../components/AudioRecorder';
import { Button } from '../components/Button';
import { api, ApiError } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, shadows, spacing, typography } from '../theme';

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const options = useAppStore((s) => s.options);
  const setOptions = useAppStore((s) => s.setOptions);
  const schedule = useAppStore((s) => s.schedule);
  const selectedScheduleId = useAppStore((s) => s.selectedScheduleId);
  const setSelectedScheduleId = useAppStore((s) => s.setSelectedScheduleId);
  const setCurrentResult = useAppStore((s) => s.setCurrentResult);
  const setSessions = useAppStore((s) => s.setSessions);

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>('recording.wav');
  const [busy, setBusy] = useState(false);

  const selectedSchedule = schedule.find((s) => s.id === selectedScheduleId);

  const runAnalysis = useCallback(async () => {
    if (!audioUri) return;
    setBusy(true);
    try {
      const context = selectedSchedule
        ? {
            professeur: selectedSchedule.professeur,
            classe: selectedSchedule.classe,
            matiere: selectedSchedule.matiere,
            salle: selectedSchedule.salle,
            seance: `${selectedSchedule.semestre} · ${selectedSchedule.semaine} · ${selectedSchedule.jour} ${selectedSchedule.debut}–${selectedSchedule.fin}`,
          }
        : {};

      const payload = {
        stt: options.stt,
        modele: options.modele,
        langue: options.langue,
        fenetre: options.fenetre,
        seuil: options.seuil,
        ecart: options.ecart,
        classification: options.classification,
        sound_threshold: options.sound_threshold,
        moderate_dbfs: options.moderate_dbfs,
        high_dbfs: options.high_dbfs,
        alert_seconds: options.alert_seconds,
        ...context,
      };

      const result = await api.analyse(audioUri, audioName, payload);
      setCurrentResult(result);
      const sessions = await api.getSessions();
      setSessions(sessions);
      Toast.show({
        type: 'success',
        text1: 'Analyse terminée',
        text2: 'Consultez les résultats dans Analytics.',
      });
      setAudioUri(null);
      navigation.navigate('Analytics' as never);
    } catch (e) {
      const err = e as ApiError;
      Toast.show({
        type: 'error',
        text1: 'Analyse échouée',
        text2: err.detail,
      });
    } finally {
      setBusy(false);
    }
  }, [
    audioUri,
    audioName,
    options,
    selectedSchedule,
    setCurrentResult,
    setSessions,
    navigation,
  ]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: spacing['3xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.eyebrow}>AUDIO ANALYSIS</Text>
          <Text style={styles.title}>Écouter. Comprendre. Analyser.</Text>
          <Text style={styles.subtitle}>
            Enregistrez ou importez une séance. Maximum 5 minutes / 32 Mio.
          </Text>
        </Animated.View>

        {/* Audio input */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.card}>
          <Text style={styles.cardTitle}>Source audio</Text>
          <AudioRecorder
            value={audioUri}
            onChange={(uri) => {
              setAudioUri(uri);
              setAudioName(uri?.split('/').pop() ?? 'recording.wav');
            }}
          />
        </Animated.View>

        {/* Options rapides */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.card}>
          <Text style={styles.cardTitle}>Options d'analyse</Text>

          <ToggleRow
            icon="message-square"
            label="Transcription"
            description="Whisper (STT)"
            value={options.stt}
            onToggle={(v) => setOptions({ stt: v })}
          />
          <ToggleRow
            icon="sparkles"
            label="Classification sonore"
            description="YAMNet"
            value={options.classification}
            onToggle={(v) => setOptions({ classification: v })}
          />

          <View style={styles.chipRow}>
            <Text style={styles.chipLabel}>Modèle</Text>
            {(['tiny', 'base', 'small'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setOptions({ modele: m })}
                style={[
                  styles.chip,
                  options.modele === m && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    options.modele === m && styles.chipTextActive,
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.chipRow}>
            <Text style={styles.chipLabel}>Langue</Text>
            {(
              [
                ['fr', 'FR'],
                ['en', 'EN'],
                ['ar', 'AR'],
                ['es', 'ES'],
                ['auto', 'AUTO'],
              ] as const
            ).map(([code, label]) => (
              <Pressable
                key={code}
                onPress={() => setOptions({ langue: code })}
                style={[
                  styles.chip,
                  options.langue === code && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    options.langue === code && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Séance associée */}
        {schedule.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.card}>
            <Text style={styles.cardTitle}>Séance associée (optionnel)</Text>
            <Pressable
              onPress={() => setSelectedScheduleId('')}
              style={[
                styles.scheduleOption,
                !selectedScheduleId && styles.scheduleOptionActive,
              ]}
            >
              <Icon
                name={!selectedScheduleId ? 'check-circle' : 'circle'}
                size={18}
                color={!selectedScheduleId ? colors.primary[600] : colors.textTertiary}
              />
              <Text style={styles.scheduleOptionText}>Analyse libre</Text>
            </Pressable>
            {schedule.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSelectedScheduleId(s.id)}
                style={[
                  styles.scheduleOption,
                  selectedScheduleId === s.id && styles.scheduleOptionActive,
                ]}
              >
                <Icon
                  name={selectedScheduleId === s.id ? 'check-circle' : 'circle'}
                  size={18}
                  color={
                    selectedScheduleId === s.id
                      ? colors.primary[600]
                      : colors.textTertiary
                  }
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleOptionText}>
                    {s.matiere} · {s.classe}
                  </Text>
                  <Text style={styles.scheduleOptionMeta}>
                    {s.jour} {s.debut}–{s.fin}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}

        <Button
          label={busy ? 'Analyse en cours…' : "Lancer l'analyse"}
          icon="play"
          onPress={runAnalysis}
          disabled={!audioUri || busy}
          loading={busy}
          fullWidth
          size="lg"
        />
        <Text style={styles.footnote}>
          Le traitement commence après l'enregistrement. Aucun résultat en temps réel.
          Le premier chargement des modèles peut prendre plusieurs minutes.
        </Text>
      </ScrollView>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  value,
  onToggle,
}: {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onToggle(!value)} style={styles.toggleRow}>
      <View style={styles.toggleIcon}>
        <Icon name={icon} size={18} color={colors.primary[600]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <View style={[styles.switch, value && styles.switchOn]}>
        <View style={[styles.switchThumb, value && styles.switchThumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },

  eyebrow: {
    ...typography.caption,
    color: colors.accent.coral,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.sm,
  },
  cardTitle: { ...typography.h3, color: colors.textPrimary },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  toggleDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  switch: {
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: { backgroundColor: colors.primary[500] },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    ...shadows.sm,
  },
  switchThumbOn: { transform: [{ translateX: 18 }] },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  chipLabel: { ...typography.label, color: colors.textSecondary, marginRight: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextActive: { color: '#FFF' },

  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  scheduleOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  scheduleOptionText: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  scheduleOptionMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  footnote: { ...typography.caption, color: colors.textTertiary, textAlign: 'center' },
});