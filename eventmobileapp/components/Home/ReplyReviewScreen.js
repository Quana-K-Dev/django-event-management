import React, { useState, useContext } from "react";
import { View, Text, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import Apis, { authApis, endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../config/AuthContext";

const ReplyReviewScreen = ({ route }) => {
  const { reviewId } = route.params;
  const [content, setContent] = useState("");
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const submitReply = async () => {
    if (!content) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      await authApis(token).post(endpoints.reviewReplies(reviewId), { content });
      Alert.alert("Thành công", "Phản hồi đã được gửi");
      navigation.goBack();
    } catch (ex) {
      console.error(ex);
      Alert.alert("Lỗi", ex.response?.data?.detail || "Không thể gửi phản hồi");
    }
  };

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Phản hồi đánh giá</Text>
      <TextInput
        label="Nội dung phản hồi"
        multiline
        value={content}
        onChangeText={setContent}
        style={MyStyles.m}
      />
      <Button mode="contained" onPress={submitReply} style={MyStyles.m}>
        Gửi phản hồi
      </Button>
    </View>
  );
};

export default ReplyReviewScreen;