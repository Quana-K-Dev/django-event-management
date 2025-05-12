import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Button, TextInput, Card} from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import Apis, { endpoints } from "../../config/Apis";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const loadEvents = async () => {
    try {
      setLoading(true);
      let url = endpoints.searchEvents;
      if (keyword) {
        url += `?keyword=${encodeURIComponent(keyword)}`;
      }
      const res = await Apis.get(url);
      setEvents(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [keyword]);

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("EventDetails", { eventId: item.id })
      }
    >
      <Card style={[MyStyles.m, { marginBottom: 10 }]}>
        {item.image ? (
          <Card.Cover
            source={{ uri: item.image }}
            style={{ height: 150 }}
          />
        ) : (
          <View style={[MyStyles.center, { height: 150, backgroundColor: "#f0f0f0" }]}>
            <Text>Không có hình ảnh</Text>
          </View>
        )}
        <Card.Content>
            <Text variant="titleLarge" style={MyStyles.subject}>
                {item.name}
            </Text>
            <Text variant="bodyMedium">
            Thời gian: {moment(item.start_time).format("DD/MM/YYYY HH:mm")}
            </Text>
            <Text variant="bodyMedium">Địa điểm: {item.location}</Text>
            <Text variant="bodyMedium">
            Giá vé: {item.ticket_price_regular.toLocaleString("vi-VN")} VNĐ
            {item.ticket_price_vip
                ? ` (VIP: ${item.ticket_price_vip.toLocaleString("vi-VN")} VNĐ)`
                : ""}
            </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={MyStyles.container}>
      <TextInput
        label="Tìm kiếm sự kiện"
        value={keyword}
        onChangeText={(t) => setKeyword(t)}
        style={MyStyles.m}
        right={<TextInput.Icon icon="magnify" />}
      />
      <Button
        mode="contained"
        onPress={loadEvents}
        loading={loading}
        disabled={loading}
        style={MyStyles.m}
      >
        Tìm kiếm
      </Button>
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

export default Home;