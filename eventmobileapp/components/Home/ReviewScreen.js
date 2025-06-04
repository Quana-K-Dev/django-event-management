import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { TextInput, Button, Card, Rating } from "react-native-paper";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../config/AuthContext";

const ReviewScreen = ({ route }) => {
  const { eventId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await Apis.get(endpoints.eventReviews(eventId));
      setReviews(res.data);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", "Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!rating || !comment) {
      Alert.alert("Lỗi", "Vui lòng nhập đánh giá và bình luận");
      return;
    }

    try {
      await authApis(token).post(endpoints.eventReviews(eventId), { rating, comment });
      Alert.alert("Thành công", "Đánh giá đã được gửi");
      setRating(0);
      setComment("");
      loadReviews();
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", ex.response?.data?.detail || "Không thể gửi đánh giá");
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const renderReview = ({ item }) => (
    <Card style={[MyStyles.m, { marginBottom: 10 }]}>
      <Card.Content>
        <Text style={MyStyles.subject}>Đánh giá bởi {item.user.username}</Text>
        <Text>Điểm: {item.rating}/5</Text>
        <Text>Bình luận: {item.comment}</Text>
        <Text>Ngày: {moment(item.created_date).format("DD/MM/YYYY HH:mm")}</Text>
        {item.replies && item.replies.length > 0 && (
          <Text>Phản hồi: {item.replies[0].content}</Text>
        )}
      </Card.Content>
      {item.user.id === 1 && ( /* current user id */
        <Card.Actions>
          <Button onPress={() => navigation.navigate("ReplyReview", { reviewId: item.id })}>Phản hồi</Button>
        </Card.Actions>
      )}
    </Card>
  );

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Đánh giá sự kiện</Text>
      <TextInput
        label="Bình luận"
        multiline
        value={comment}
        onChangeText={setComment}
        style={MyStyles.m}
      />
      <Text style={MyStyles.m}>Đánh giá (1-5):</Text>
      <Rating
        type="star"
        rating={rating}
        onPress={setRating}
        imageSize={30}
        style={MyStyles.m}
      />
      <Button mode="contained" onPress={submitReview} style={MyStyles.m}>
        Gửi đánh giá
      </Button>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadReviews}
      />
    </View>
  );
};

export default ReviewScreen;