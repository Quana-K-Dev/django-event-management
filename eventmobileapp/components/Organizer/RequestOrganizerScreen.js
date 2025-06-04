import React, { useContext } from 'react';
import { View, Text, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { AuthContext } from '../../config/AuthContext';
import Apis, { endpoints } from '../../config/Apis';

const RequestOrganizerScreen = () => {
  const { token } = useContext(AuthContext);

  const requestOrganizer = async () => {
    if (!token) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để gửi yêu cầu.');
      return;
    }

    try {
      const res = await Apis.post(endpoints.requestOrganizer, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const message = res.data?.detail || 'Yêu cầu đã được gửi.';
      Alert.alert('Thành công', message);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Không thể gửi yêu cầu.';
      console.error('Lỗi khi gửi yêu cầu:', err.response?.data || err.message);
      Alert.alert('Lỗi', errorMsg);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Bạn chưa phải là nhà tổ chức. Gửi yêu cầu để trở thành nhà tổ chức sự kiện.
      </Text>
      <Button mode="contained" onPress={requestOrganizer}>
        Gửi yêu cầu xác thực thành nhà tổ chức
      </Button>
    </View>
  );
};

export default RequestOrganizerScreen;
