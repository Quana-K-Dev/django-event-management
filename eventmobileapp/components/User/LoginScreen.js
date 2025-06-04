import React, { useState, useContext } from "react";
import { View, Text, Alert, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Apis, { endpoints } from "../../config/Apis";
import MyStyles from "../../styles/MyStyles";
import { AuthContext } from "../../config/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { saveToken } = useContext(AuthContext);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên đăng nhập");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return false;
    }
    return true;
  };

  const login = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = {
        grant_type: "password",
        username: username,
        password: password,
        client_id: "Axuihzp7Xp8PE7ifuGSj3drWLr8ogO0WYmOs4CLj",
        client_secret: "3a56cSVENjnIByj3RTjl4B7sI8Mu1HoNabX0LSTEojCfvL0bVG5KPJfozZAc5KvPzkEO4CQuTdAol7HKjsxgj5Gh55SkovYx08UoJ6Sql6kooMfq8nAG4eFuyxvi0N45"
      };

      const res = await Apis.post(endpoints.login, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const accessToken = res.data.access_token;

      // Gọi API lấy thông tin user hiện tại
      const userRes = await Apis.get(endpoints.currentUser, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = userRes.data;

      // Lưu token + user vào context
      await saveToken(accessToken, userData);

      Alert.alert("Thành công", "Đăng nhập thành công", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Main")
        }
      ]);
    } catch (err) {
      console.error("Đăng nhập lỗi:", err.response?.data || err.message);
      Alert.alert("Lỗi đăng nhập", "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const res = await Apis.get(endpoints.googleLogin);
      Alert.alert("Đăng nhập Google", "Tính năng đang phát triển");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể đăng nhập với Google");
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
          <Text style={MyStyles.title}>Chào mừng trở lại</Text>
          <Text style={MyStyles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        {/* Form Container */}
        <View style={[MyStyles.formContainer, { marginTop: 20 }]}>
          {/* Welcome Icon */}
          <View style={[MyStyles.center, MyStyles.mb24]}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: MyStyles.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 36, color: 'white' }}>👋</Text>
            </View>
          </View>

          {/* Username Input */}
          <View style={[MyStyles.inputContainer, { marginBottom: 12 }]}>
            <Text style={[MyStyles.caption, { marginBottom: 6, fontWeight: '500' }]}>
              Tên đăng nhập
            </Text>
            <TextInput
              style={[MyStyles.input, {
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: MyStyles.colors.onSurface,
                marginBottom: 0
              }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Nhập tên đăng nhập"
              placeholderTextColor={MyStyles.colors.onSurfaceVariant}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
            />
          </View>

          {/* Password Input */}
          <View style={[MyStyles.inputContainer, { marginBottom: 20 }]}>
            <Text style={[MyStyles.caption, { marginBottom: 6, fontWeight: '500' }]}>
              Mật khẩu
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[MyStyles.input, {
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  paddingRight: 50,
                  fontSize: 16,
                  color: MyStyles.colors.onSurface,
                  marginBottom: 0
                }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={MyStyles.colors.onSurfaceVariant}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 12,
                  padding: 4,
                }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={{ fontSize: 18, color: MyStyles.colors.onSurfaceVariant }}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginBottom: 24 }}
            onPress={() => Alert.alert("Quên mật khẩu", "Tính năng đang phát triển")}
          >
            <Text style={[MyStyles.body, { 
              color: MyStyles.colors.primary, 
              fontWeight: '500',
              fontSize: 14
            }]}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              MyStyles.primaryButton,
              { marginVertical: 12 },
              isLoading && { opacity: 0.7 }
            ]}
            onPress={login}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={MyStyles.row}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[MyStyles.primaryButtonText, { marginLeft: 8 }]}>
                  Đang đăng nhập...
                </Text>
              </View>
            ) : (
              <Text style={MyStyles.primaryButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Google Login Button */}
          <TouchableOpacity
            style={[MyStyles.secondaryButton, {
              backgroundColor: '#db4437',
              borderColor: '#db4437',
              marginVertical: 8
            }]}
            onPress={loginWithGoogle}
            disabled={isLoading}
          >
            <Text style={[MyStyles.secondaryButtonText, { color: 'white' }]}>
              🔍 Đăng nhập với Google
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={[MyStyles.divider, { marginVertical: 20 }]} />

          {/* Register Link */}
          <View style={MyStyles.center}>
            <Text style={MyStyles.body}>Chưa có tài khoản?</Text>
            <TouchableOpacity
              style={{ marginTop: 6 }}
              onPress={() => navigation.navigate("Register")}
              disabled={isLoading}
            >
              <Text style={[MyStyles.body, { 
                color: MyStyles.colors.primary, 
                fontWeight: '600' 
              }]}>
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Additional Features */}
          <View style={[MyStyles.center, { marginTop: 24 }]}>
            <TouchableOpacity
              onPress={() => Alert.alert("Trợ giúp", "Liên hệ hỗ trợ: support@example.com")}
              style={{ padding: 8 }}
              disabled={isLoading}
            >
              <Text style={[MyStyles.caption, { 
                color: MyStyles.colors.onSurfaceVariant,
                textDecorationLine: 'underline'
              }]}>
                Cần trợ giúp?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;