import { createMorph } from 'morphicons/dom';
import { defineMorphIcon } from 'morphicons/element';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  QrCode,
  Barcode,
  Search,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Monitor,
  Smartphone,
  Code2,
  Terminal,
  Cpu,
  Zap,
} from 'lucide';

defineMorphIcon();

export const Morphicons = {
  createMorph,
  icons: {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    RotateCcw,
    Sparkles,
    Check,
    CheckCircle2,
    AlertCircle,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Lock,
    Unlock,
    Key,
    QrCode,
    Barcode,
    Search,
    ShoppingCart,
    TrendingUp,
    BarChart3,
    Monitor,
    Smartphone,
    Code2,
    Terminal,
    Cpu,
    Zap,
  },
};

if (typeof window !== 'undefined') {
  (window as any).Morphicons = Morphicons;
}
