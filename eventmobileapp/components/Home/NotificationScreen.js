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
  const { token } = useContext(AuthContext);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await authApis(token).get(endpoints.notifications);
      setNotifications(res.data);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // TODO: Register device for FCM push notifications
  }, []);

  const renderNotification = ({ item }) => (
    <Card style={[MyStyles.m, { marginBottom: 10 }]}>
      <Card.Content>
        <Text style={MyStyles.subject}>{item.message}</Text>
        <Text>Ngày: {moment(item.created_date).format("DD/MM/YYYY HH:mm")}</Text>
        <Text>Trạng thái: {item.is_read ? "Đã đọc" : "Chưa đọc"}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Thông báo</Text>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadNotifications}
      />
    </View>
  );
};

export default NotificationScreen;