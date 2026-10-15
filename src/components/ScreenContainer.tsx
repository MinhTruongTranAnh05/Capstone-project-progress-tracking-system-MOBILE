/**
 * ScreenContainer & ScreenHeader
 *
 * Shared layout wrappers that handle:
 * 1. Top safe area — pushes content below status bar / Dynamic Island / notch
 * 2. Bottom padding — pushes content above the bottom tab bar + home indicator
 *
 * Works on:
 *   - iPhone with Dynamic Island (insets.top ~59px)
 *   - iPhone with Notch (insets.top ~44px)
 *   - iPhone SE / older without notch (insets.top ~20px)
 *   - Android edge-to-edge
 *
 * Usage (plain View wrapper):
 *   <ScreenContainer>...</ScreenContainer>
 *
 * Usage (ScrollView wrapper):
 *   <ScreenContainer scrollable contentContainerStyle={styles.inner}>
 *     ...
 *   </ScreenContainer>
 *
 * Usage (only top edge — for screens that manage their own FlatList padding):
 *   <ScreenContainer edges={['top']}>...</ScreenContainer>
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

/** Approximate tab bar height per platform; keeps us from importing
 *  @react-navigation/bottom-tabs which is not a direct dependency. */
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

type ScreenEdge = 'top' | 'bottom';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Render a ScrollView instead of a plain View */
  scrollable?: boolean;
  /** Which edges receive inset padding. Default: ['top', 'bottom'] */
  edges?: ScreenEdge[];
  /** Extra bottom spacing on top of tab bar + insets.bottom (default 16) */
  extraBottomPad?: number;
  /** Style for the outer wrapper */
  style?: StyleProp<ViewStyle>;
  /** Passed to ScrollView's contentContainerStyle */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Additional ScrollView props */
  scrollViewProps?: Omit<React.ComponentProps<typeof ScrollView>, 'contentContainerStyle' | 'style'>;
}

export function ScreenContainer({
  children,
  scrollable = false,
  edges = ['top', 'bottom'],
  extraBottomPad = 16,
  style,
  contentContainerStyle,
  scrollViewProps,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const wantsTop = edges.includes('top');
  const wantsBottom = edges.includes('bottom');

  // Top = actual system inset (status bar + Dynamic Island / notch)
  const paddingTop = wantsTop ? insets.top : 0;

  // Bottom = tab bar + home-indicator bottom inset + extra buffer
  // The tab bar's paddingBottom already accounts for insets.bottom on iOS,
  // so we only need TAB_BAR_HEIGHT + extra (not double-counting insets.bottom).
  const paddingBottom = wantsBottom ? TAB_BAR_HEIGHT + extraBottomPad : 0;

  if (scrollable) {
    return (
      <View style={[styles.flex, style]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            { paddingTop, paddingBottom },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { paddingTop }, style]}>
      {children}
      {/* Spacer at the bottom so content never slides under the tab bar */}
      {wantsBottom && <View style={{ height: paddingBottom }} />}
    </View>
  );
}

// ---------------------------------------------------------------------------

/**
 * ScreenHeader
 *
 * Wraps any header content and automatically applies paddingTop = insets.top
 * so the header always starts just below the status bar / Dynamic Island.
 *
 * Use this as a drop-in around the existing banner/header JSX in each screen.
 */
interface ScreenHeaderProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ children, style, innerStyle }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerOuter, { paddingTop: insets.top }, style]}>
      <View style={innerStyle}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerOuter: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3DC',
  },
});
