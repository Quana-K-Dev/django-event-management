import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Apis, { endpoints } from '../../config/Apis';
import { AuthContext } from '../../config/AuthContext';
import MyStyles from '../../styles/MyStyles';

const EventApprovalScreen = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await Apis.get('/events/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Lọc sự kiện chưa được duyệt
      const pending = res.data.filter((e) => e.status === 'pending');
      setEvents(pending);
    } catch (err) {
      console.error('Lỗi khi tải sự kiện:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const url = `/events/${id}/${action}/`;
      await Apis.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Thành công', `Sự kiện đã được ${action === 'approve_event' ? 'duyệt' : 'từ chối'}`);
      loadEvents(); // làm mới
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể xử lý yêu cầu.');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderItem = ({ item }) => (
    <View style={MyStyles.eventCard}>
      <View style={MyStyles.eventHeader}>
        <View style={MyStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={MyStyles.eventTitle}>{item.name}</Text>
            <View style={[MyStyles.row, { marginTop: 4 }]}>
              <Ionicons name="location-outline" size={16} color="#7f8c8d" />
              <Text style={[MyStyles.eventLocation, { marginLeft: 4 }]}>
                {item.location}
              </Text>
            </View>
          </View>
          <View style={[MyStyles.badge, { backgroundColor: '#f39c12' }]}>
            <Text style={MyStyles.badgeText}>Chờ duyệt</Text>
          </View>
        </View>
      </View>

      <View style={MyStyles.eventContent}>
        <Text style={MyStyles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={{ marginTop: 12 }}>
          <View style={[MyStyles.row, { marginBottom: 4 }]}>
            <Ionicons name="calendar-outline" size={16} color="#3498db" />
            <Text style={[MyStyles.eventTime, { marginLeft: 4 }]}>
              Bắt đầu: {formatDate(item.start_time)}
            </Text>
          </View>
          <View style={MyStyles.row}>
            <Ionicons name="time-outline" size={16} color="#e74c3c" />
            <Text style={[MyStyles.eventTime, { marginLeft: 4 }]}>
              Kết thúc: {formatDate(item.end_time)}
            </Text>
          </View>
        </View>
      </View>

      <View style={MyStyles.divider} />

      <View style={MyStyles.actionButtons}>
        <Button 
          onPress={() => handleAction(item.id, 'approve_event')} 
          mode="contained"
          style={MyStyles.approveButton}
          icon="check-circle"
          compact
        >
          Duyệt
        </Button>
        <Button 
          onPress={() => handleAction(item.id, 'reject_event')} 
          mode="contained"
          style={MyStyles.rejectButton}
          icon="close-circle"
          compact
        >
          Từ chối
        </Button>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={MyStyles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color="#95a5a6" />
      <Text style={MyStyles.emptyText}>
        Không có sự kiện nào chờ duyệt
      </Text>
      <Text style={[MyStyles.emptyText, { fontSize: 14, marginTop: 8 }]}>
        Tất cả sự kiện đã được xử lý
      </Text>
    </View>
  );

  return (
    <View style={MyStyles.container}>
      <View style={MyStyles.headerSection}>
        <View style={MyStyles.center}>
          <Ionicons name="calendar-clear" size={40} color="#3498db" />
          <Text style={MyStyles.title}>Duyệt sự kiện</Text>
          <Text style={MyStyles.userDetail}>
            Quản lý và phê duyệt các sự kiện đang chờ
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={MyStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={[MyStyles.userDetail, { marginTop: 16 }]}>
            Đang tải danh sách sự kiện...
          </Text>
        </View>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default EventApprovalScreen;