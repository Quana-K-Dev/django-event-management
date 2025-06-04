import React, { useEffect, useState, useContext } from "react";
import { View, Text, Alert, FlatList, Image, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import { AuthContext } from "../../config/AuthContext";

const AdminVerifyScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const { token } = useContext(AuthContext);

  const loadRequests = async (isRefresh = false) => {
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập với quyền admin.");
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await authApis(token).get(endpoints.pendingVerification);
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err.response?.data || err.message);
      Alert.alert("Lỗi", err.response?.data?.detail || "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const verify = async (userId) => {
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập với quyền admin.");
      return;
    }

    Alert.alert(
      "Xác nhận duyệt",
      "Bạn có chắc chắn muốn duyệt yêu cầu này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Duyệt",
          style: "default",
          onPress: async () => {
            setProcessingIds(prev => new Set(prev).add(userId));
            try {
              await authApis(token).post(endpoints.verifyOrganizer(userId));
              Alert.alert("Thành công", "Đã xác minh nhà tổ chức thành công.");
              loadRequests();
            } catch (err) {
              console.error("Lỗi xác minh:", err.response?.data || err.message);
              Alert.alert("Lỗi", err.response?.data?.detail || "Không thể xác minh nhà tổ chức.");
            } finally {
              setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  const reject = async (userId) => {
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập với quyền admin.");
      return;
    }

    Alert.alert(
      "Xác nhận từ chối",
      "Bạn có chắc chắn muốn từ chối yêu cầu này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: async () => {
            setProcessingIds(prev => new Set(prev).add(userId));
            try {
              await authApis(token).post(endpoints.rejectOrganizer(userId));
              Alert.alert("Thành công", "Đã từ chối yêu cầu trở thành nhà tổ chức.");
              loadRequests();
            } catch (err) {
              console.error("Lỗi từ chối:", err.response?.data || err.message);
              Alert.alert("Lỗi", err.response?.data?.detail || "Không thể từ chối yêu cầu.");
            } finally {
              setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadRequests();
  }, [token]);

  const renderUserCard = ({ item }) => {
    const isProcessing = processingIds.has(item.id);
    const fullName = `${item.first_name || ""} ${item.last_name || ""}`.trim();
    const displayName = fullName || item.username || "Người dùng";

    return (
      <View style={[MyStyles.card, { opacity: isProcessing ? 0.7 : 1 }]}>
        {/* User Header */}
        <View style={MyStyles.cardHeader}>
          {/* Avatar */}
          <View style={{ marginRight: 16 }}>
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={MyStyles.avatar}
              />
            ) : (
              <View style={[
                MyStyles.avatar, 
                { 
                  backgroundColor: MyStyles.colors.surfaceVariant,
                  justifyContent: "center",
                  alignItems: "center"
                }
              ]}>
                <Ionicons 
                  name="person" 
                  size={32} 
                  color={MyStyles.colors.onSurfaceVariant} 
                />
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={MyStyles.userInfo}>
            <Text style={MyStyles.userName}>{displayName}</Text>
            <Text style={MyStyles.userDetail}>@{item.username}</Text>
            <Text style={MyStyles.userDetail}>{item.email}</Text>
            {item.date_joined && (
              <Text style={[MyStyles.userDetail, { fontSize: 12, marginTop: 4 }]}>
                Tham gia: {new Date(item.date_joined).toLocaleDateString('vi-VN')}
              </Text>
            )}
          </View>

          {/* Status Badge */}
          <View style={[MyStyles.badge, { backgroundColor: MyStyles.colors.warning }]}>
            <Text style={MyStyles.badgeText}>Chờ duyệt</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={MyStyles.divider} />

        {/* Action Buttons */}
        <View style={MyStyles.actionButtons}>
          <TouchableOpacity
            style={[
              MyStyles.approveButton,
              isProcessing && { opacity: 0.5 }
            ]}
            onPress={() => verify(item.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={MyStyles.row}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[MyStyles.actionButtonText, { marginLeft: 8 }]}>
                  Đang xử lý...
                </Text>
              </View>
            ) : (
              <View style={MyStyles.row}>
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={[MyStyles.actionButtonText, { marginLeft: 6 }]}>
                  Duyệt
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              MyStyles.rejectButton,
              isProcessing && { opacity: 0.5 }
            ]}
            onPress={() => reject(item.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={MyStyles.row}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[MyStyles.actionButtonText, { marginLeft: 8 }]}>
                  Đang xử lý...
                </Text>
              </View>
            ) : (
              <View style={MyStyles.row}>
                <Ionicons name="close-circle" size={16} color="white" />
                <Text style={[MyStyles.actionButtonText, { marginLeft: 6 }]}>
                  Từ chối
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <ScrollView
      contentContainerStyle={MyStyles.emptyContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadRequests(true)}
          colors={[MyStyles.colors.primary]}
        />
      }
    >
      <View style={[MyStyles.center, { paddingHorizontal: 40 }]}>
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: MyStyles.colors.surfaceVariant,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Ionicons 
            name="checkmark-circle-outline" 
            size={64} 
            color={MyStyles.colors.onSurfaceVariant} 
          />
        </View>
        <Text style={[MyStyles.emptyText, { fontSize: 20, fontWeight: '600' }]}>
          Không có yêu cầu nào
        </Text>
        <Text style={[MyStyles.emptyText, { fontSize: 16, marginTop: 8, textAlign: 'center' }]}>
          Tất cả yêu cầu xác minh nhà tổ chức đã được xử lý
        </Text>
        <TouchableOpacity
          style={[MyStyles.outlineButton, { marginTop: 20 }]}
          onPress={() => loadRequests(true)}
        >
          <Text style={MyStyles.outlineButtonText}>Tải lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const LoadingState = () => (
    <View style={MyStyles.loadingContainer}>
      <ActivityIndicator size="large" color={MyStyles.colors.primary} />
      <Text style={[MyStyles.body, { marginTop: 16, color: MyStyles.colors.onSurfaceVariant }]}>
        Đang tải danh sách yêu cầu...
      </Text>
    </View>
  );

  return (
    <View style={MyStyles.container}>
      {/* Header Section */}
      <View style={MyStyles.headerSection}>
        <View style={MyStyles.center}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: MyStyles.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="shield-checkmark" size={28} color="white" />
          </View>
          <Text style={MyStyles.title}>Xác minh nhà tổ chức</Text>
          <Text style={[MyStyles.subtitle, { fontSize: 16, marginBottom: 0 }]}>
            Quản lý yêu cầu trở thành nhà tổ chức sự kiện
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : requests.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Stats Header */}
          <View style={[MyStyles.simpleCard, { margin: 16, marginBottom: 8 }]}>
            <View style={MyStyles.row}>
              <View style={[MyStyles.center, { flex: 1 }]}>
                <Text style={[MyStyles.heading, { fontSize: 24, color: MyStyles.colors.primary }]}>
                  {requests.length}
                </Text>
                <Text style={MyStyles.caption}>Yêu cầu chờ duyệt</Text>
              </View>
              <TouchableOpacity
                style={[MyStyles.outlineButton, { marginVertical: 0 }]}
                onPress={() => loadRequests(true)}
                disabled={refreshing}
              >
                <View style={MyStyles.row}>
                  <Ionicons 
                    name="refresh" 
                    size={16} 
                    color={MyStyles.colors.onSurfaceVariant} 
                  />
                  <Text style={[MyStyles.outlineButtonText, { marginLeft: 6 }]}>
                    Tải lại
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Request List */}
          <FlatList
            data={requests}
            renderItem={renderUserCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadRequests(true)}
                colors={[MyStyles.colors.primary]}
              />
            }
          />
        </View>
      )}
    </View>
  );
};

export default AdminVerifyScreen;