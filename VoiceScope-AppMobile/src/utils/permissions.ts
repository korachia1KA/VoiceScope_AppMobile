// src/utils/permissions.ts
import { AudioModule } from 'expo-audio';
import { Alert, Linking } from 'react-native';

export async function requestMicrophonePermission(): Promise<boolean> {
  const { granted } = await AudioModule.requestRecordingPermissionsAsync();
  return granted;
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  const granted = await requestMicrophonePermission();
  if (!granted) {
    Alert.alert(
      'Microphone requis',
      "Autorisez l'accès au microphone dans les réglages pour enregistrer vos séances.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
      ],
    );
  }
  return granted;
}
