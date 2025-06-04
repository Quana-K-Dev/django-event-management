import 'react-native-url-polyfill/auto';
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
} from "react-native";
import { Card, Button, ActivityIndicator, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import Apis, { authApis, endpoints } from "../../config/Apis";
import moment from "moment";
import { AuthContext } from "../../config/AuthContext";

const { width, height } = Dimensions.get("window");

const MyTicketsScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const loadTickets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await authApis(token).get(endpoints.ticketHistory);
      setTickets(res.data.data || []);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải lịch sử vé");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelTicket = (ticket) => {
    setSelectedTicket(ticket);
    setCancelModalVisible(true);
  };

  const confirmCancelTicket = async () => {
    try {
      setCancelModalVisible(false);
      setLoading(true);

      await authApis(token).post(endpoints.cancelTicket(selectedTicket.id));

      Alert.alert(
        "Thành công",
        "Vé đã được hủy thành công",
        [{ text: "OK", onPress: () => loadTickets() }]
      );
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể hủy vé. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setSelectedTicket(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { bg: "#FFF3CD", text: "#856404", border: "#FFEAA7" };
      case "confirmed":
        return { bg: "#D4EDDA", text: "#155724", border: "#C3E6CB" };
      case "cancelled":
        return { bg: "#F8D7DA", text: "#721C24", border: "#F5C6CB" };
      default:
        return { bg: "#E9ECEF", text: "#6C757D", border: "#DEE2E6" };
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ xử lý";
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const renderTicketCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Card style={styles.ticketCard}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.eventName} numberOfLines={2}>
            {item.event_id?.name || `Sự kiện #${item.event_id}`}
          </Text>
        </LinearGradient>

        <View style={styles.cardContent}>
          <View style={styles.ticketInfo}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Loại vé</Text>
                <Text style={styles.infoValue}>{item.ticket_type}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số lượng</Text>
                <Text style={styles.infoValue}>{item.quantity}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Tổng tiền</Text>
                <Text style={styles.priceText}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.total_price)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Trạng thái</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: statusColor.bg, borderColor: statusColor.border },
                  ]}
                  textStyle={[styles.statusText, { color: statusColor.text }]}
                >
                  {getStatusText(item.status)}
                </Chip>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={16} color="#7f8c8d" />
              <Text style={styles.dateText}>
                Ngày đặt: {moment(item.created_date).format("DD/MM/YYYY HH:mm")}
              </Text>
            </View>

            {item.qr_code && (
              <View style={styles.qrRow}>
                <MaterialIcons name="qr-code" size={16} color="#7f8c8d" />
                <Text style={styles.qrText}>Mã QR: {item.qr_code}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate("TicketDetails", { ticketId: item.id })}
            >
              <MaterialIcons name="info-outline" size={20} color="#667eea" />
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>

            {item.status === "pending" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelTicket(item)}
              >
                <MaterialIcons name="cancel" size={20} color="#ff6b6b" />
                <Text style={styles.cancelButtonText}>Hủy vé</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="confirmation-number" size={80} color="#bdc3c7" />
      <Text style={styles.emptyTitle}>Chưa có vé nào</Text>
      <Text style={styles.emptySubtitle}>
        Bạn chưa đặt vé nào. Hãy tham gia các sự kiện thú vị!
      </Text>
    </View>
  );

  useEffect(() => {
    loadTickets();
  }, []);

  if (loading && tickets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải vé...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Vé của tôi</Text>
        <Text style={styles.headerSubtitle}>
          {tickets.length > 0 ? `${tickets.length} vé` : "Không có vé"}
        </Text>
      </LinearGradient>

      <FlatList
        data={tickets}
        renderItem={renderTicketCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTickets(true)}
            colors={["#667eea"]}
            tintColor="#667eea"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="warning" size={50} color="#ff6b6b" />
            <Text style={styles.modalTitle}>Xác nhận hủy vé</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn hủy vé "{selectedTicket?.event_id?.name || 'này'}"?
              Hành động này không thể hoàn tác.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Không</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmCancelTicket}
              >
                <Text style={styles.modalConfirmText}>Hủy vé</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#667eea",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  ticketCard: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 20,
    paddingBottom: 15,
  },
  eventName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    lineHeight: 24,
  },
  cardContent: {
    padding: 20,
    backgroundColor: "white",
  },
  ticketInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoItem: {
    flex: 1,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 16,
    color: "#27ae60",
    fontWeight: "bold",
  },
  statusChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 8,
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qrText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  detailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    marginRight: 10,
  },
  detailButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#667eea",
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#ffebee",
    borderRadius: 8,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#ff6b6b",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7f8c8d",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#95a5a6",
    textAlign: "center",
    lineHeight: 22,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginHorizontal: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 15,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});

export default MyTicketsScreen;