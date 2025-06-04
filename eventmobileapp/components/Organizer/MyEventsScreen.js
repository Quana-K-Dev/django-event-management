import React, { useState, useEffect,useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { Card, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";
import { AuthContext } from "../../config/AuthContext";

const MyEventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await authApis(token).get(endpoints.myEvents);
      setEvents(res.data.filter(event => event.organizer.id === res.data.user_id)); // Filter by organizer
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await authApis(token).delete(endpoints.editEvent(eventId));
      Alert.alert("Thành công", "Sự kiện đã được xóa");
      loadEvents();
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể xóa sự kiện");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const renderEvent = ({ item }) => (
    <Card style={[MyStyles.m, { marginBottom: 10 }]}>
      {item.image ? (
        <Card.Cover source={{ uri: item.image }} style={{ height: 150 }} />
      ) : (
        <View style={[MyStyles.center, { height: 150, backgroundColor: "#f0f0f0" }]}>
          <Text>Không có hình ảnh</Text>
        </View>
      )}
      <Card.Content>
        <Text style={MyStyles.subject}>{item.name}</Text>
        <Text>Thời gian: {moment(item.start_time).format("DD/MM/YYYY HH:mm")}</Text>
        <Text>Địa điểm: {item.location}</Text>
        <Text>Trạng thái: {item.status}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate("EventEdit", { eventId: item.id })}>Chỉnh sửa</Button>
        <Button onPress={() => deleteEvent(item.id)}>Xóa</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Sự kiện của tôi</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadEvents}
      />
    </View>
  );
};

export default MyEventsScreen;