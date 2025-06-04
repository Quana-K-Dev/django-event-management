import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palette - Blue theme
const colors = {
  primary: '#2563eb',      // Blue-600
  primaryDark: '#1d4ed8',  // Blue-700
  primaryLight: '#3b82f6', // Blue-500
  secondary: '#64748b',    // Slate-500
  accent: '#0ea5e9',       // Sky-500
  background: '#f8fafc',   // Slate-50
  surface: '#ffffff',      // White
  surfaceVariant: '#f1f5f9', // Slate-100
  onSurface: '#0f172a',    // Slate-900
  onSurfaceVariant: '#475569', // Slate-600
  error: '#dc2626',        // Red-600
  success: '#16a34a',      // Green-600
  warning: '#d97706',      // Amber-600
  border: '#e2e8f0',       // Slate-200
  divider: '#e2e8f0',      // Slate-200
  disabled: '#94a3b8',     // Slate-400
};

export default StyleSheet.create({
  // ============ CONTAINERS ============
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  paddedContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // ============ LAYOUT ============
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  wrap: {
    flexWrap: 'wrap',
  },

  // ============ SPACING ============
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  mb24: { marginBottom: 24 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt20: { marginTop: 20 },
  mt24: { marginTop: 24 },
  mx16: { marginHorizontal: 16 },
  my8: { marginVertical: 8 },
  my12: { marginVertical: 12 },
  my16: { marginVertical: 16 },

  // Legacy margin (for backward compatibility)
  m: { margin: 8 },
  margin: { margin: 10 },

  // ============ TYPOGRAPHY ============
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },

  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
  },

  subheading: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.onSurface,
    marginBottom: 12,
  },

  body: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },

  caption: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  // Legacy subject (for backward compatibility)
  subject: {
    fontSize: 30,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // ============ INPUTS ============
  inputContainer: {
    marginBottom: 16,
  },

  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },

  // ============ BUTTONS ============
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  outlineButtonText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Legacy button (for backward compatibility)
  button: {
    marginVertical: 10,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },

  buttonText: {
    color: colors.surface,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },

  // ============ CARDS ============
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  simpleCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  // ============ FORM CONTAINERS ============
  authContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    margin: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // ============ HEADERS ============
  headerSection: {
    backgroundColor: colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  appHeader: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  appHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.surface,
    textAlign: 'center',
  },

  // ============ AVATAR ============
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },

  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.border,
  },

  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
    alignSelf: 'center',
    marginVertical: 16,
  },

  // ============ STATUS & FEEDBACK ============
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  successText: {
    color: colors.success,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  warningText: {
    color: colors.warning,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ============ LOADING & EMPTY STATES ============
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.background,
  },

  emptyText: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 26,
  },

  // ============ BADGES & CHIPS ============
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  chip: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  chipText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },

  // ============ DIVIDERS ============
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },

  thickDivider: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
    marginVertical: 24,
  },

  // ============ ACTION BUTTONS ============
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 16,
    gap: 12,
  },

  approveButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
    flex: 1,
  },

  rejectButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
    flex: 1,
  },

  actionButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ============ USER INFO ============
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },

  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 4,
  },

  userDetail: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
    lineHeight: 20,
  },

  // ============ FORM CONTROLS ============
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },

  radioContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // ============ IMAGE PICKER ============
  imagePickerButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: colors.surfaceVariant,
  },

  imagePickerText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },

  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 16,
    borderWidth: 4,
    borderColor: colors.primary,
  },

  // ============ EVENT SPECIFIC ============
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    margin: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },

  eventHeader: {
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 4,
  },

  eventLocation: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },

  eventContent: {
    padding: 16,
  },

  eventDescription: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 12,
  },

  eventTime: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },

  // ============ PLATFORM SPECIFIC ============
  platformPadding: {
    padding: Platform.OS === 'ios' ? 12 : 10,
  },

  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },

  // ============ GRADIENT BACKGROUNDS ============
  gradientContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Export colors for use in components
  colors: colors,
});