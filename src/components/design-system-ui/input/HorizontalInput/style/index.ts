import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';

export default (theme: ThemeTypes, hasLabel: boolean, isError: boolean, showAvatar?: boolean, readonly?: boolean) => {
  const baseInput = 48;

  // Stretched, not a fixed 48: pinned at top: 0 with height: baseInput these blocks centre their
  // icons at 24 no matter how tall the row really is, while the text input is centred by the row's
  // own alignItems: 'center' - so any row taller than baseInput splits the two apart by half the
  // excess. With top/bottom: 0 both follow the same height. Identical to the old style at 48.
  const partBlock: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
  };

  return StyleSheet.create({
    container: {},
    label: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    textInput: {
      ...FontMedium,
      position: 'relative',
      paddingLeft: theme.paddingXXS,
      paddingRight: theme.paddingSM,
      // Symmetric vertical padding, like the vertical input (input/style/index.ts). Without any,
      // Fabric on Android substitutes the platform EditText theme's asymmetric 10/11dp padding,
      // and neither platform is then pinned to the middle of the 48dp box by the style itself.
      paddingTop: 13,
      paddingBottom: 13,
      // Android only (iOS ignores it): makes the line box ascent..descent instead of top..bottom,
      // which is what centres the hint. It also keeps the placeholder and the typed value on the
      // same line box - the hint is a plain String and can never carry a lineHeight span.
      includeFontPadding: false,
      fontSize: theme.fontSize,
      color: !isError ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
      // Deliberately no lineHeight here. On iOS a TextInput's lineHeight only becomes
      // NSParagraphStyle min/maxLineHeight and never gets RN's baseline compensation
      // (RCTApplyBaselineOffset runs only from RCTTextLayoutManager.mm, the <Text> path), so at
      // fontSize 14 it moves the glyphs by ~0.5dp; on Android it never reaches the placeholder at
      // all and would desync it from the typed value. The padding above is what does the work.
      zIndex: 2,
      height: baseInput,
    },
    leftPart: {
      ...partBlock,
      left: 0,
    },
    rightPart: {
      ...partBlock,
      right: 0,
      zIndex: 2,
    },
  });
};
