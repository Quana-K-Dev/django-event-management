import React, { useState } from "react";
import { View, Text, Alert, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Apis, { endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";

const RegisterScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: ""
  });
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const validateForm = () => {
    if (!user.username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên đăng nhập");
      return false;
    }
    if (!user.email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return false;
    }
    if (!user.email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return false;
    }
    if (user.password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (user.password !== user.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp");
      return false;
    }
    return true;
  };

  const register = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let form = new FormData();
      form.append("username", user.username);
      form.append("password", user.password);
      form.append("email", user.email);
      
      if (avatar) {
        form.append("avatar", {
          uri: avatar.uri,
          name: avatar.fileName || "avatar.jpg",
          type: "image/jpeg",
        });
      }

      const res = await Apis.post(endpoints.register, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Thành công", "Đăng ký thành công", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login")
        }
      ]);
    } catch (err) {
      console.error("Register error:", err);
      Alert.alert("Lỗi", "Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async () => {
    try {
      const res = await Apis.get(endpoints.googleLogin);
      Alert.alert("Đăng ký Google", "Tính năng đang phát triển");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể đăng ký với Google");
    }
  };

  return (
    <View style={MyStyles.container}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={[MyStyles.headerSection, { marginBottom: 0 }]}>
          <Text style={MyStyles.title}>Tạo tài khoản</Text>
          <Text style={MyStyles.subtitle}>Điền thông tin để bắt đầu</Text>
        </View>

        {/* Form Container */}
        <View style={[MyStyles.formContainer, { marginTop: 20 }]}>
          {/* Avatar Section */}
          <View style={[MyStyles.center, MyStyles.mb16]}>
            {avatar ? (
              <TouchableOpacity onPress={pickImage} style={MyStyles.center}>
                <Image 
                  source={{ uri: avatar.uri }} 
                  style={[MyStyles.previewImage, { marginVertical: 0 }]}
                />
                <Text style={[MyStyles.caption, MyStyles.mt8, { color: MyStyles.colors.primary }]}>
                  Nhấn để thay đổi
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[MyStyles.imagePickerButton, { marginVertical: 0, paddingVertical: 16 }]} 
                onPress={pickImage}
              >
                <Text style={{ fontSize: 30, color: MyStyles.colors.primary }}>📷</Text>
                <Text style={[MyStyles.imagePickerText, { marginTop: 4 }]}>Chọn ảnh đại diện</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Username Input */}
          <View style={[MyStyles.inputContainer, { marginBottom: 12 }]}>
            <Text style={[MyStyles.caption, { marginBottom: 6, fontWeight: '500' }]}>Tên đăng nhập</Text>
            <TextInput
              style={[MyStyles.input, {
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: MyStyles.colors.onSurface,
                marginBottom: 0
              }]}
              value={user.username}
              onChangeText={(t) => setUser({ ...user, username: t })}
              placeholder="Nhập tên đăng nhập"
              placeholderTextColor={MyStyles.colors.onSurfaceVariant}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View style={[MyStyles.inputContainer, { marginBottom: 12 }]}>
            <Text style={[MyStyles.caption, { marginBottom: 6, fontWeight: '500' }]}>Email</Text>
            <TextInput
              style={[MyStyles.input, {
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: MyStyles.colors.onSurface,
                marginBottom: 0
              }]}
              value={user.email}
              onChangeText={(t) => setUser({ ...user, email: t })}
              placeholder="Nhập địa chỉ email"
              placeholderTextColor={MyStyles.colors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={[MyStyles.inputContainer, { marginBottom: 12 }]}>
            <Text style={[MyStyles.caption, { marginBottom: 6, fontWeight: '500' }]}>Mật khẩu</Text>
            <TextInput
              style={[MyStyles.input, {
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: MyStyles.colors.onSurface,
                marginBottom: 0
              }]}
              value={user.password}
              onChangeText={(t) => setUser({ ...user, password: t })}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor={MyStyles.colors.onSurfaceVariant}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={[MyStyles.inputContainer, { marginBottom: 20 }]}>
            <Text style={[MyStyles.caption, { marginBottom: 6, fontWeight: '500' }]}>Nhập lại mật khẩu</Text>
            <TextInput
              style={[MyStyles.input, {
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: MyStyles.colors.onSurface,
                marginBottom: 0
              }]}
              value={user.confirmPassword}
              onChangeText={(t) => setUser({ ...user, confirmPassword: t })}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor={MyStyles.colors.onSurfaceVariant}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              MyStyles.primaryButton,
              { marginVertical: 12 },
              isLoading && { opacity: 0.7 }
            ]}
            onPress={register}
            disabled={isLoading}
          >
            <Text style={MyStyles.primaryButtonText}>
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Text>
          </TouchableOpacity>

          {/* Google Register Button */}
          <TouchableOpacity
            style={[MyStyles.secondaryButton, {
              backgroundColor: '#db4437',
              borderColor: '#db4437',
              marginVertical: 8
            }]}
            onPress={registerWithGoogle}
          >
            <Text style={[MyStyles.secondaryButtonText, { color: 'white' }]}>
              🔍 Đăng ký với Google
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={[MyStyles.divider, { marginVertical: 16 }]} />

          {/* Login Link */}
          <View style={MyStyles.center}>
            <Text style={MyStyles.body}>Đã có tài khoản?</Text>
            <TouchableOpacity
              style={{ marginTop: 6 }}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={[MyStyles.body, { 
                color: MyStyles.colors.primary, 
                fontWeight: '600' 
              }]}>
                Đăng nhập ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;