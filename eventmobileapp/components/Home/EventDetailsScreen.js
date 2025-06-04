import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, Image, Alert } from "react-native";
import { Card, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Apis, { endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";
import { AuthContext } from "../../config/AuthContext";

const EventDetailsScreen = ({ route }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const loadEvent = async () => {
    try {
      const res = await Apis.get(endpoints.eventDetails(eventId));
      setEvent(res.data);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải thông tin sự kiện");
    }
  };

  useEffect(() => {
    loadEvent();
  }, []);

  if (!event) {
    return <View style={MyStyles.container}><Text>Đang tải...</Text></View>;
  }

  return (
    <ScrollView style={MyStyles.container}>
      <Card style={MyStyles.m}>
        {event.image ? (
          <Card.Cover source={{ uri: event.image }} style={{ height: 200 }} />
        ) : (
          <View style={[MyStyles.center, { height: 200, backgroundColor: "#f0f0f0" }]}>
            <Text>Không có hình ảnh</Text>
          </View>
        )}
        <Card.Content>
          <Text style={MyStyles.subject}>{event.name}</Text>
          <Text>Mô tả: {event.description}</Text>
          <Text>Thời gian: {moment(event.start_time).format("DD/MM/YYYY HH:mm")} - {moment(event.end_time).format("DD/MM/YYYY HH:mm")}</Text>
          <Text>Địa điểm: {event.location}</Text>
          <Text>Giá vé thường: {event.ticket_price_regular.toLocaleString("vi-VN")} VNĐ</Text>
          {event.ticket_price_vip && (
            <Text>Giá vé VIP: {event.ticket_price_vip.toLocaleString("vi-VN")} VNĐ</Text>
          )}
          <Text>Trạng thái: {event.status}</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate("TicketBooking", { eventId })}>Đặt vé</Button>
          <Button onPress={() => navigation.navigate("Review", { eventId })}>Xem đánh giá</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

export default EventDetailsScreen;