// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from '../components/Icon';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, shadows, spacing, typography } from '../theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const options = useAppStore((s) => s.options);
  const setOptions = useAppStore((s) => s.setOptions);
  const resetOptions = useAppStore((s) => s.resetOptions);
  const apiBaseUrl = useAppStore((s) => s.apiBaseUrl);
  const setApiBaseUrl = useAppStore((s) => s.setApiBaseUrl);
  const [urlDraft, setUrlDraft] = useState(apiBaseUrl);

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
          <Text style={styles.eyebrow}>SETTINGS</Text>
          <Text style={styles.title}>Réglages</Text>
          <Text style={styles.subtitle}>
            Configuration de l'analyse et de la connexion serveur.
          </Text>
        </Animated.View>

        {/* API */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="server" size={20} color={colors.primary[600]} />
            <Text style={styles.cardTitle}>Connexion API</Text>
          </View>
          <Text style={styles.cardHint}>
            Adresse du serveur VoiceScope local.
            {'\n'}Android émulateur : 10.0.2.2 · iOS : localhost
          </Text>
          <TextInput
            value={urlDraft}
            onChangeText={setUrlDraft}
            placeholder="http://10.0.2.2:8000"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Button
            label="Enregistrer l'URL"
            icon="save"
            variant="secondary"
            onPress={() => {
              setApiBaseUrl(urlDraft.trim());
              Toast.show({ type: 'success', text1: 'URL enregistrée' });
            }}
          />
        </Animated.View>

        {/* Whisper */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.card}>
          <Text style={styles.cardTitle}>Transcription</Text>
          <Text style={styles.fieldLabel}>Modèle Whisper</Text>
          <View style={styles.chipRow}>
            {(['tiny', 'base', 'small'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setOptions({ modele: m })}
                style={[styles.chip, options.modele === m && styles.chipActive]}
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
          <Text style={styles.fieldLabel}>Langue</Text>
          <View style={styles.chipRow}>
            {(
              [
                ['fr', 'Français'],
                ['en', 'English'],
                ['ar', 'العربية'],
                ['es', 'Español'],
                ['auto', 'Auto'],
              ] as const
            ).map(([code, label]) => (
              <Pressable
                key={code}
                onPress={() => setOptions({ langue: code })}
                style={[styles.chip, options.langue === code && styles.chipActive]}
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

        {/* Seuils */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.card}>
          <Text style={styles.cardTitle}>Seuils numériques</Text>
          <NumberField
            label="Fenêtre vocale (s)"
            value={options.fenetre}
            min={1}
            max={10}
            step={0.5}
            onChange={(v) => setOptions({ fenetre: v })}
          />
          <NumberField
            label="Seuil de similarité"
            value={options.seuil}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setOptions({ seuil: v })}
          />
          <NumberField
            label="Marge entre profils"
            value={options.ecart}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setOptions({ ecart: v })}
          />
          <NumberField
            label="Seuil orange (dBFS)"
            value={options.moderate_dbfs}
            min={-120}
            max={0}
            step={1}
            onChange={(v) => setOptions({ moderate_dbfs: v })}
          />
          <NumberField
            label="Seuil rouge (dBFS)"
            value={options.high_dbfs}
            min={-120}
            max={0}
            step={1}
            onChange={(v) => setOptions({ high_dbfs: v })}
          />
          <NumberField
            label="Dépassement consécutif (s)"
            value={options.alert_seconds}
            min={0.25}
            max={60}
            step={0.25}
            onChange={(v) => setOptions({ alert_seconds: v })}
          />
        </Animated.View>

        {/* Reset */}
        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <Button
            label="Réinitialiser les paramètres"
            icon="rotate-ccw"
            variant="secondary"
            onPress={() => {
              Alert.alert(
                'Réinitialiser ?',
                'Tous les paramètres reviendront aux valeurs par défaut.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: () => {
                      resetOptions();
                      Toast.show({ type: 'success', text1: 'Paramètres réinitialisés' });
                    },
                  },
                ],
              );
            }}
            fullWidth
          />
        </Animated.View>

        <Text style={styles.footer}>
          VoiceScope AI · v1.0.0{'\n'}
          Données locales · dBFS, pas dB SPL
        </Text>
      </ScrollView>
    </View>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.numberRow}>
      <Text style={styles.numberLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
          style={styles.stepperBtn}
          hitSlop={6}
        >
          <Icon name="minus" size={16} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable
          onPress={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
          style={styles.stepperBtn}
          hitSlop={6}
        >
          <Icon name="plus" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
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
    gap: spacing.md,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  cardHint: { ...typography.caption, color: colors.textSecondary },

  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },

  fieldLabel: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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

  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  numberLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    minWidth: 48,
    textAlign: 'center',
  },

  footer: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});