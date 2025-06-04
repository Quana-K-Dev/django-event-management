import { StyleSheet } from 'react-native';

const HomeStyles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: '#f8f9fa',
  },

  // Header styles
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    marginBottom: 16,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  searchButton: {
    borderRadius: 20,
    flex: 1,
    marginRight: 12,
  },

  sortButton: {
    borderRadius: 20,
  },

  resultsCount: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },

  // Category chips styles
  categoryContainer: {
    marginVertical: 12,
  },

  categoryScrollContainer: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },

  categoryLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  categoryLoadingText: {
    marginLeft: 8,
    color: '#666',
  },
  categoryChip: {
  marginRight: 8,
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 6,
  justifyContent: 'center',
  alignItems: 'center',
},

categoryChipSelected: {
  backgroundColor: '#6200ee',
},

categoryChipUnselected: {
  backgroundColor: '#f0f0f0',
},

categoryChipTextSelected: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 14,
},

categoryChipTextUnselected: {
  color: '#333',
  fontWeight: 'normal',
  fontSize: 14,
},


  // Event card styles
  eventCard: {
    margin: 12,
    borderRadius: 20,
    elevation: 6,
    overflow: "hidden",
    position: "relative",
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  // Badge styles
  hotBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ff4757",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  hotBadgeIcon: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11,
    marginRight: 4,
  },

  hotBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11,
  },

  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(98, 0, 238, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },

  categoryBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },

  // Event image styles
  eventImage: {
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  placeholderImage: {
    height: 200,
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  placeholderText: {
    color: "#666",
    fontSize: 14,
    fontWeight: '500',
  },

  // Event content styles
  eventContent: {
    padding: 16,
  },

  eventTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
    color: '#2c3e50',
    lineHeight: 26,
  },

  // Organizer info styles
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },

  organizerIcon: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },

  organizerName: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },

  verifiedBadge: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  verifiedText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Divider
  divider: {
    marginVertical: 12,
    backgroundColor: '#e9ecef',
  },

  // Event details styles
  eventDetailsContainer: {
    marginBottom: 16,
  },

  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  eventDetailIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  eventDetailText: {
    fontSize: 15,
    color: "#555",
    flex: 1,
    fontWeight: '500',
  },

  priceText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "700",
  },

  priceVipText: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 2,
  },

  // Action button styles
  actionButton: {
    backgroundColor: '#6200ee',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },

  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },

  emptyDescription: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },

  emptyButton: {
    marginTop: 20,
    borderRadius: 20,
  },

  // FlatList styles
  flatListContent: {
    paddingBottom: 100,
  },

  // Menu styles
  menuItem: {
    fontWeight: 'normal',
  },

  menuItemSelected: {
    color: '#6200ee',
    fontWeight: 'bold',
  },

  menuItemUnselected: {
    color: '#333',
    fontWeight: 'normal',
  },
});

export default HomeStyles;