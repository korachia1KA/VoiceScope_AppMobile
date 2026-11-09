// src/components/AudioRecorder.tsx
import {
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '../theme';
import { ensureMicrophonePermission } from '../utils/permissions';
import { Button } from './Button';
import Icon from './Icon';

const MAX_DURATION_MS = 300_000; // 5 minutes

// Mono 16 kHz (suffisant pour la voix). Le format reste m4a/AAC (Android et iOS).
const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  sampleRate: 16000,
  numberOfChannels: 1,
  isMeteringEnabled: true,
};

interface AudioRecorderProps {
  value: string | null;
  onChange: (uri: string | null, fileName?: string) => void;
  compact?: boolean;
}

export function AudioRecorder({ value, onChange, compact = false }: AudioRecorderProps) {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recState = useAudioRecorderState(recorder, 200);
  const [busy, setBusy] = useState(false);

  const isRecording = recState.isRecording;
  const duration = recState.durationMillis / 1000;

  const pulseScale = useSharedValue(1);
  const meterWidth = useSharedValue(0);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  const meterStyle = useAnimatedStyle(() => ({
    width: `${meterWidth.value}%`,
  }));

  // Animation du pouls pendant l'enregistrement
  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = 1;
      meterWidth.value = 0;
    }
  }, [isRecording, pulseScale, meterWidth]);

  // Niveau sonore (metering en dBFS : -60 → 0)
  useEffect(() => {
    if (!isRecording) return;
    const m = recState.metering ?? -60;
    const level = Math.min(100, Math.max(0, ((m + 60) / 60) * 100));
    meterWidth.value = withTiming(level, { duration: 150 });
  }, [recState.metering, isRecording, meterWidth]);

  const stopRecording = useCallback(async () => {
    try {
      setBusy(true);
      await recorder.stop();
      const uri = recorder.uri;
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      if (uri) {
        onChange(uri, uri.split('/').pop());
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? "Arrêt d'enregistrement échoué.");
    } finally {
      setBusy(false);
    }
  }, [recorder, onChange]);

  // Arrêt automatique à 5 minutes
  useEffect(() => {
    if (isRecording && recState.durationMillis >= MAX_DURATION_MS) {
      stopRecording();
    }
  }, [isRecording, recState.durationMillis, stopRecording]);

  const startRecording = useCallback(async () => {
    const granted = await ensureMicrophonePermission();
    if (!granted) return;

    try {
      setBusy(true);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e: any) {
      Alert.alert("Erreur d'enregistrement", e?.message ?? 'Impossible de démarrer.');
    } finally {
      setBusy(false);
    }
  }, [recorder]);

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset?.uri) {
        onChange(asset.uri, asset.name);
      }
    } catch (e: any) {
      Alert.alert("Erreur d'import", e?.message ?? 'Fichier non supporté.');
    }
  }, [onChange]);

  const mm = String(Math.floor(duration / 60)).padStart(2, '0');
  const ss = String(Math.floor(duration % 60)).padStart(2, '0');

  return (
    <View style={[styles.container, compact && styles.compact]}>
      {/* Preview audio */}
      {value && !isRecording && (
        <View style={styles.previewCard}>
          <View style={styles.previewIcon}>
            <Icon name="audio-file" size={20} color={colors.primary[600]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>Enregistrement prêt</Text>
            <Text style={styles.previewSubtitle} numberOfLines={1}>
              {value.split('/').pop()}
            </Text>
          </View>
          <Pressable onPress={() => onChange(null)} hitSlop={10}>
            <Icon name="trash-2" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      )}

      {/* Meter */}
      {isRecording && (
        <View style={styles.meterWrap}>
          <View style={styles.meterTrack}>
            <Animated.View style={[styles.meterFill, meterStyle]} />
          </View>
          <Animated.View style={[styles.recDot, pulseStyle]}>
            <View style={styles.recDotInner} />
          </Animated.View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!isRecording ? (
          <>
            <Button
              label="Enregistrer"
              icon="mic"
              onPress={startRecording}
              disabled={busy}
              fullWidth
            />
            <Button
              label="Importer un fichier"
              icon="upload"
              variant="secondary"
              onPress={pickFile}
              disabled={busy}
              fullWidth
            />
          </>
        ) : (
          <Pressable
            onPress={stopRecording}
            style={styles.stopButton}
            disabled={busy}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626'] as const}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Icon name="square" size={18} color="#FFF" />
            <Text style={styles.stopLabel}>Arrêter · {mm}:{ss}</Text>
          </Pressable>
        )}
      </View>

      {busy && !isRecording && (
        <View style={styles.busyRow}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
          <Text style={styles.busyText}>Préparation…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, width: '100%' },
  compact: { gap: spacing.sm },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  previewSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  meterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  meterTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  recDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },

  actions: { gap: spacing.sm },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.brand,
  },
  stopLabel: { ...typography.label, color: '#FFF' },

  busyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  busyText: { ...typography.bodySm, color: colors.textSecondary },
});