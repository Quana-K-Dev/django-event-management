import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { RadioButton, Button } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";

const RoleSelectScreen = ({ navigation }) => {
  const [role, setRole] = useState("user");

  const confirmRole = () => {
    if (role === "organizer") {
      Alert.alert("Yêu cầu gửi xác minh", "Quản trị viên sẽ duyệt yêu cầu của bạn.");
    } else {
      Alert.alert("Đăng ký vai trò", "Bạn đã chọn vai trò người tham gia.");
    }
    navigation.navigate("Login");
  };

  return (
    <View style={MyStyles.container}>
      <Text style={MyStyles.title}>Chọn vai trò của bạn</Text>
      <RadioButton.Group onValueChange={setRole} value={role}>
        <View style={MyStyles.m}>
          <RadioButton.Item label="Người tham gia" value="user" />
          <RadioButton.Item label="Nhà tổ chức sự kiện" value="organizer" />
        </View>
      </RadioButton.Group>
      <Button mode="contained" onPress={confirmRole}>Xác nhận</Button>
    </View>
  );
};

export default RoleSelectScreen;
