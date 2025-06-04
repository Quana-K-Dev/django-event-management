import React, { useState, useEffect, useContext } from "react";
import { View, Text, Image, Alert } from "react-native";
import { Card, Button } from "react-native-paper";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";
import QRCode from "react-native-qrcode-svg";
import { AuthContext } from "../../config/AuthContext";

const TicketDetailsScreen = ({ route }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const { token } = useContext(AuthContext);

  const loadTicket = async () => {
    try {
      const res = await authApis(token).get(endpoints.tickets + ticketId + "/");
      setTicket(res.data);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải thông tin vé");
    }
  };

  useEffect(() => {
    loadTicket();
  }, []);

  if (!ticket) {
    return <View style={MyStyles.container}><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Chi tiết vé</Text>
      <Card style={MyStyles.m}>
        <Card.Content>
          <Text style={MyStyles.subject}>{ticket.event.name}</Text>
          <Text>Địa điểm: {ticket.event.location}</Text>
          <Text>
            Thời gian:{" "}
            {moment(ticket.event.start_time).format("DD/MM/YYYY HH:mm")} -{" "}
            {moment(ticket.event.end_time).format("DD/MM/YYYY HH:mm")}
          </Text>
          <Text>Loại vé: {ticket.ticket_type}</Text>
          <Text>Số lượng: {ticket.quantity}</Text>
          <Text>
            Tổng giá: {ticket.total_price.toLocaleString("vi-VN")} VNĐ
          </Text>
          <Text>Trạng thái: {ticket.status}</Text>
          <Text>
            Ngày đặt: {moment(ticket.created_date).format("DD/MM/YYYY HH:mm")}
          </Text>
          {ticket.qr_code && (
            <View style={[MyStyles.center, { marginVertical: 20 }]}>
              <QRCode value={ticket.qr_code} size={200} />
              <Text style={{ marginTop: 10 }}>Mã QR: {ticket.qr_code}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

export default TicketDetailsScreen;