import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { Card, Button } from "react-native-paper";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";
import { AuthContext } from "../../config/AuthContext";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const { token } = useContext(AuthContext);

  // Hàm tính số ngày từ hiện tại đến ngày sự kiện
  const calculateDaysToEvent = (startDate) => {
    const now = moment();
    const eventDate = moment(startDate);
    return eventDate.diff(now, 'days');
  };

  // Hàm tạo thông báo dựa trên số ngày còn lại
  const createEventNotification = (ticket, daysRemaining) => {
    let message = "";
    let shouldNotify = false;

    if (daysRemaining === 0) {
      message = `Sự kiện "${ticket.event_name}" bắt đầu hôm nay! Đừng quên tham gia.`;
      shouldNotify = true;
    } else if (daysRemaining === 1) {
      message = `Sự kiện "${ticket.event_name}" sẽ diễn ra vào ngày mai. Hãy chuẩn bị sẵn sàng!`;
      shouldNotify = true;
    } else if (daysRemaining === 3) {
      message = `Còn 3 ngày nữa sự kiện "${ticket.event_name}" sẽ diễn ra. Đừng quên ghi nhớ!`;
      shouldNotify = true;
    } else if (daysRemaining === 7) {
      message = `Còn 1 tuần nữa sự kiện "${ticket.event_name}" sẽ diễn ra. Hãy sắp xếp lịch trình!`;
      shouldNotify = true;
    } else if (daysRemaining < 0) {
      message = `Sự kiện "${ticket.event_name}" đã bắt đầu ${Math.abs(daysRemaining)} ngày trước.`;
      shouldNotify = false; // Không cần thông báo cho sự kiện đã qua
    }

    return { message, shouldNotify };
  };

  // Hàm load và xử lý tickets để tạo thông báo
  const loadTicketsAndCreateNotifications = async () => {
    try {
      setLoading(true);

      // Load tickets của user
      const ticketsRes = await authApis(token).get(endpoints.tickets);
      setTickets(ticketsRes.data);

      // Tạo thông báo cho từng ticket
      const eventNotifications = [];

      for (const ticket of ticketsRes.data) {
        try {
          // Gọi API để lấy chi tiết ticket
          const ticketDetailRes = await authApis(token).get(`${endpoints.tickets}${ticket.id}/`);
          const ticketDetail = ticketDetailRes.data;

          // Tính số ngày còn lại
          const daysRemaining = calculateDaysToEvent(ticketDetail.start_date);

          // Tạo thông báo
          const notification = createEventNotification(ticketDetail, daysRemaining);

          if (notification.shouldNotify) {
            eventNotifications.push({
              id: `event_${ticket.id}_${Date.now()}`,
              message: notification.message,
              created_date: new Date().toISOString(),
              is_read: false,
              type: 'event_reminder',
              ticket_id: ticket.id,
              days_remaining: daysRemaining
            });
          }
        } catch (error) {
          console.error(`Error processing ticket ${ticket.id}:`, error);
        }
      }

      // Load thông báo hiện có
      const notificationsRes = await authApis(token).get(endpoints.notifications);

      // Kết hợp thông báo sự kiện với thông báo hiện có
      const allNotifications = [...eventNotifications, ...notificationsRes.data];

      // Sắp xếp theo ngày tạo (mới nhất trước)
      allNotifications.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      setNotifications(allNotifications);

    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketsAndCreateNotifications();

    // Thiết lập interval để kiểm tra thông báo định kỳ (mỗi giờ)
    const interval = setInterval(() => {
      loadTicketsAndCreateNotifications();
    }, 3600000); // 1 giờ = 3600000ms

    return () => clearInterval(interval);
  }, []);

  // Hàm format hiển thị thông báo với thông tin bổ sung
  const formatNotificationMessage = (item) => {
    let displayMessage = item.message;

    if (item.type === 'event_reminder' && item.days_remaining !== undefined) {
      const daysText = item.days_remaining === 0 ? "Hôm nay" :
                       item.days_remaining === 1 ? "Ngày mai" :
                       item.days_remaining > 1 ? `Còn ${item.days_remaining} ngày` :
                       `Đã qua ${Math.abs(item.days_remaining)} ngày`;
      displayMessage += ` (${daysText})`;
    }

    return displayMessage;
  };

  const renderNotification = ({ item }) => (
    <Card style={[MyStyles.m, {
      marginBottom: 10,
      backgroundColor: item.type === 'event_reminder' ? '#E3F2FD' : '#FFFFFF',
      borderLeft: item.type === 'event_reminder' ? '4px solid #2196F3' : 'none'
    }]}>
      <Card.Content>
        <Text style={[
          MyStyles.subject,
          { color: item.type === 'event_reminder' ? '#1976D2' : '#000000' }
        ]}>
          {formatNotificationMessage(item)}
        </Text>
        <Text style={{ marginTop: 5 }}>
          Ngày: {moment(item.created_date).format("DD/MM/YYYY HH:mm")}
        </Text>
        <Text style={{
          color: item.is_read ? '#4CAF50' : '#FF9800',
          fontWeight: 'bold'
        }}>
          Trạng thái: {item.is_read ? "Đã đọc" : "Chưa đọc"}
        </Text>
        {item.type === 'event_reminder' && (
          <Text style={{
            marginTop: 5,
            fontSize: 12,
            color: '#666',
            fontStyle: 'italic'
          }}>
            📅 Nhắc nhở sự kiện
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Thông báo</Text>

      {/* Hiển thị tổng quan */}
      <Card style={[MyStyles.m, { marginBottom: 15, backgroundColor: '#F5F5F5' }]}>
        <Card.Content>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            📊 Tổng quan
          </Text>
          <Text style={{ marginTop: 5 }}>
            Tổng số thông báo: {notifications.length}
          </Text>
          <Text>
            Thông báo sự kiện: {notifications.filter(n => n.type === 'event_reminder').length}
          </Text>
          <Text>
            Chưa đọc: {notifications.filter(n => !n.is_read).length}
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadTicketsAndCreateNotifications}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={MyStyles.m}>
            <Card.Content>
              <Text style={{ textAlign: 'center', color: '#666' }}>
                Không có thông báo nào
              </Text>
            </Card.Content>
          </Card>
        }
      />

      {/* Nút refresh thủ công */}
      <Button
        mode="contained"
        onPress={loadTicketsAndCreateNotifications}
        style={{ margin: 15 }}
        disabled={loading}
      >
        {loading ? "Đang tải..." : "Làm mới thông báo"}
      </Button>
    </View>
  );
};

export default NotificationScreen;