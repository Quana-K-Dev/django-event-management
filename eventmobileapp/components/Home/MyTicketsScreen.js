import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { Card, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";
import { AuthContext } from "../../config/AuthContext";

const MyTicketsScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await authApis(token).get(endpoints.ticketHistory);
      setTickets(res.data.data);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải lịch sử vé");
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (ticketId) => {
    try {
      await authApis(token).post(endpoints.cancelTicket(ticketId));
      Alert.alert("Thành công", "Vé đã được hủy");
      loadTickets();
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể hủy vé");
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const renderTicket = ({ item }) => (
    <Card style={[MyStyles.m, { marginBottom: 10 }]}>
      <Card.Content>
        <Text style={MyStyles.subject}>Sự kiện #{item.event_id}</Text>
        <Text>Loại vé: {item.ticket_type}</Text>
        <Text>Số lượng: {item.quantity}</Text>
        <Text>Trạng thái: {item.status}</Text>
        <Text>Ngày đặt: {moment(item.created_date).format("DD/MM/YYYY HH:mm")}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate("Main", {
          screen: "TicketDetails",
          params: { ticketId: item.id }
        })}>Chi tiết</Button>
        {item.status === "pending" && (
          <Button onPress={() => cancelTicket(item.id)}>Hủy vé</Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Vé của tôi</Text>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadTickets}
      />
    </View>
  );
};

export default MyTicketsScreen;