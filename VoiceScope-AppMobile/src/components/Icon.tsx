// src/components/Icon.tsx
// Remplace react-native-vector-icons/Lucide : accepte les mêmes noms (kebab-case)
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  Clock,
  FileAudio,
  Info,
  Mic,
  MicOff,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Save,
  Server,
  Settings,
  Sparkles,
  Square,
  Trash2,
  TriangleAlert,
  Upload,
  Users,
  Volume2,
  AudioLines,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

const ICONS: Record<string, LucideIcon> = {
  'activity': Activity,
  'alert-circle': CircleAlert,
  'alert-triangle': TriangleAlert,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'audio-file': FileAudio,
  'audio-lines': AudioLines,
  'chart-no-axes-combined': ChartNoAxesCombined,
  'check-circle': CircleCheck,
  'chevron-right': ChevronRight,
  'circle': Circle,
  'clock': Clock,
  'file-audio': FileAudio,
  'info': Info,
  'message-square': MessageSquare,
  'mic': Mic,
  'mic-off': MicOff,
  'minus': Minus,
  'play': Play,
  'plus': Plus,
  'rotate-ccw': RotateCcw,
  'save': Save,
  'server': Server,
  'settings': Settings,
  'sparkles': Sparkles,
  'square': Square,
  'trash-2': Trash2,
  'upload': Upload,
  'users': Users,
  'volume-2': Volume2,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Icon({ name, size = 24, color, style }: IconProps) {
  const Comp = ICONS[name];
  if (!Comp) {
    if (__DEV__) console.warn(`Icon "${name}" inconnue : ajoutez-la dans src/components/Icon.tsx`);
    return <Circle size={size} color={color} style={style} />;
  }
  return <Comp size={size} color={color} style={style} />;
}
