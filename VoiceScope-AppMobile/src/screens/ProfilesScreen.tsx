// src/screens/ProfilesScreen.tsx
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from '../components/Icon';
import { AudioRecorder } from '../components/AudioRecorder';
import { Button } from '../components/Button';
import { api, ApiError } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, shadows, spacing, typography } from '../theme';

const AVATAR_COLORS = [colors.primary[500], colors.accent.cyan, colors.accent.coral];
const MAX_PROFILES = 3;

export default function ProfilesScreen() {
  const insets = useSafeAreaInsets();
  const profiles = useAppStore((s) => s.profiles);
  const setProfiles = useAppStore((s) => s.setProfiles);

  const [name, setName] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleAdd = useCallback(async () => {
    if (!name.trim() || !audioUri) return;
    setBusy(true);
    try {
      const result = await api.addProfile(name.trim(), audioUri, 'voice.wav');
      setProfiles(result.personnes);
      setName('');
      setAudioUri(null);
      Toast.show({
        type: 'success',
        text1: 'Profil enregistré',
        text2: `Empreinte ajoutée pour ${result.nom}.`,
      });
    } catch (e) {
      const err = e as ApiError;
      Toast.show({
        type: 'error',
        text1: 'Enrôlement échoué',
        text2: err.detail,
      });
    } finally {
      setBusy(false);
    }
  }, [name, audioUri, setProfiles]);

  const handleDelete = useCallback(
    (nom: string) => {
      Alert.alert(
        'Supprimer le profil ?',
        `Le profil « ${nom} » et ses empreintes seront supprimés définitivement.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                const updated = await api.deleteProfile(nom);
                setProfiles(updated);
                Toast.show({ type: 'success', text1: 'Profil supprimé' });
              } catch (e) {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: (e as ApiError).detail,
                });
              }
            },
          },
        ],
      );
    },
    [setProfiles],
  );

  const canAddMore = profiles.length < MAX_PROFILES;

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
          <Text style={styles.eyebrow}>VOICE PROFILES</Text>
          <Text style={styles.title}>Donnez un nom à chaque voix</Text>
          <Text style={styles.subtitle}>
            Trois personnes maximum, plusieurs échantillons par profil.
          </Text>
        </Animated.View>

        {/* Compteur */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.counterCard}>
          <View style={styles.counterRow}>
            <Icon name="users" size={20} color={colors.primary[600]} />
            <Text style={styles.counterLabel}>Profils vocaux</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>
                {profiles.length} / {MAX_PROFILES}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Liste des profils */}
        {profiles.map((p, i) => (
          <Animated.View
            key={p.nom}
            entering={FadeInDown.duration(400).delay(120 + i * 60)}
            style={styles.profileCard}
          >
            <View style={[styles.avatar, { backgroundColor: `${AVATAR_COLORS[i % 3]}18` }]}>
              <Text style={[styles.avatarText, { color: AVATAR_COLORS[i % 3] }]}>
                {p.nom[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{p.nom}</Text>
              <Text style={styles.profileMeta}>
                {p.echantillons} empreinte{p.echantillons > 1 ? 's' : ''} vocale{p.echantillons > 1 ? 's' : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDelete(p.nom)}
              hitSlop={10}
              style={styles.deleteBtn}
            >
              <Icon name="trash-2" size={18} color={colors.danger} />
            </Pressable>
          </Animated.View>
        ))}

        {profiles.length === 0 && (
          <Animated.View entering={FadeIn} style={styles.emptyCard}>
            <Icon name="mic-off" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Aucun profil enregistré</Text>
            <Text style={styles.emptyText}>
              Ajoutez un premier profil pour attribuer les voix aux locuteurs.
            </Text>
          </Animated.View>
        )}

        {/* Formulaire d'ajout */}
        {canAddMore && (
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.formCard}>
            <Text style={styles.formTitle}>Enregistrer un profil vocal</Text>
            <Text style={styles.formHint}>
              Avec l'accord de la personne, enregistrez 10 à 15 secondes de parole
              claire. Une empreinte est calculée par tranche complète de 3 secondes.
            </Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nom de la personne"
                placeholderTextColor={colors.textTertiary}
                maxLength={40}
                style={styles.input}
                autoCorrect={false}
              />
            </View>

            <AudioRecorder value={audioUri} onChange={setAudioUri} />

            <Button
              label={busy ? 'Enregistrement…' : "Enregistrer l'empreinte"}
              icon="save"
              onPress={handleAdd}
              disabled={busy || !name.trim() || !audioUri}
              fullWidth
              loading={busy}
            />
          </Animated.View>
        )}

        {!canAddMore && (
          <Animated.View entering={FadeIn} style={styles.limitCard}>
            <Icon name="info" size={18} color={colors.warning} />
            <Text style={styles.limitText}>
              Limite de {MAX_PROFILES} profils atteinte. Supprimez un profil pour en
              ajouter un autre.
            </Text>
          </Animated.View>
        )}

        {/* Import / Export */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.formCard}>
          <Text style={styles.formTitle}>Sauvegarder les profils</Text>
          <Text style={styles.formHint}>
            Les exports contiennent des données biométriques non chiffrées.
            Conservez-les dans un emplacement privé.
          </Text>
        </Animated.View>
      </ScrollView>
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

  counterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  counterLabel: { ...typography.body, color: colors.textPrimary, flex: 1, fontWeight: '600' },
  counterBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.primary[50],
    borderRadius: radius.full,
  },
  counterBadgeText: { ...typography.label, color: colors.primary[700] },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700' },
  profileName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  profileMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing['2xl'],
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptyText: { ...typography.bodySm, color: colors.textSecondary, textAlign: 'center' },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.sm,
  },
  formTitle: { ...typography.h3, color: colors.textPrimary },
  formHint: { ...typography.bodySm, color: colors.textSecondary },

  inputWrap: { gap: spacing.sm },
  inputLabel: { ...typography.label, color: colors.textSecondary },
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

  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  limitText: { ...typography.bodySm, color: '#92400E', flex: 1 },
});