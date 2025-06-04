import React, { useState, useEffect, useContext } from "react";
import { View, Text, Alert } from "react-native";
import { TextInput, Button, RadioButton } from "react-native-paper";
import { WebView } from "react-native-webview";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../config/AuthContext";

const TicketBookingScreen = ({ route }) => {
  const { eventId } = route.params;
  const { token } = useContext(AuthContext);
  const [ticketType, setTicketType] = useState("regular");
  const [quantity, setQuantity] = useState("1");
  const [event, setEvent] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const navigation = useNavigation();

  const loadEvent = async () => {
    try {
      const res = await Apis.get(endpoints.eventDetails(eventId));
      setEvent(res.data);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải thông tin sự kiện");
    }
  };

  const bookTicket = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt vé');
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert("Lỗi", "Số lượng vé phải lớn hơn 0");
      return;
    }

    try {
      const form = new FormData();
      form.append("event_id", eventId);
      form.append("ticket_type", ticketType);
      form.append("quantity", quantity);

      const res = await authApis(token).post(endpoints.eventTickets(eventId), form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const ticketId = res.data.id;
      const paymentRes = await authApis(token).post(endpoints.payments, {
        ticket_id: ticketId,
        method: "vnpay",
      });

      if (paymentRes.data.payment_url) {
        setPaymentUrl(paymentRes.data.payment_url);
      } else {
        Alert.alert("Thành công", "Vé đã được đặt, chờ thanh toán");
        navigation.navigate("MyTickets");
      }
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", ex.response?.data?.detail || "Không thể đặt vé");
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    if (navState.url.includes('payments/return')) {
      setPaymentUrl(null);
      navigation.navigate("MyTickets");
    }
  };

  useEffect(() => {
    loadEvent();
  }, []);

  if (!event) {
    return <View style={MyStyles.container}><Text>Đang tải...</Text></View>;
  }

  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Đặt vé cho {event.name}</Text>
      <RadioButton.Group onValueChange={setTicketType} value={ticketType}>
        <RadioButton.Item label={`Vé thường (${event.ticket_price_regular.toLocaleString("vi-VN")} VNĐ)`} value="regular" />
        {event.ticket_price_vip && (
          <RadioButton.Item label={`Vé VIP (${event.ticket_price_vip.toLocaleString("vi-VN")} VNĐ)`} value="vip" />
        )}
      </RadioButton.Group>
      <TextInput
        label="Số lượng vé"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        style={MyStyles.m}
      />
      <Button mode="contained" onPress={bookTicket} style={MyStyles.m}>
        Đặt vé
      </Button>
    </View>
  );
};

export default TicketBookingScreen;