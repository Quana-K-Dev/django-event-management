import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../config/AuthContext';
import { Alert } from 'react-native';

const LogoutScreen = () => {
  const { logout, token } = useContext(AuthContext);

  useEffect(() => {
    const performLogout = async () => {
      await logout(token);
      Alert.alert('Đã đăng xuất');
    };
    performLogout();
  }, []);

  return null;
};

export default LogoutScreen;
