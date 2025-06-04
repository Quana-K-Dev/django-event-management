import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { endpoints } from './Apis'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = async (newToken, userData) => {
    try {
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Lỗi khi lưu token:', error);
    }
  };

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken) setToken(storedToken);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser) setUser(parsedUser);
        } catch (parseError) {
          console.error('Lỗi khi parse dữ liệu user:', parseError);
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Lỗi khi xóa token:', error);
    }
  };

  const logout = async (token) => {
  try {
    await Apis.post(endpoints.logout, null, {
      headers: {
        Authorization: `Token ${token}`, // Chú ý dùng `Token` thay vì `Bearer`
      },
    });
  } catch (error) {
    console.error('Lỗi khi gọi API logout:', error.response?.data || error.message);
  } finally {
    await clearToken();
  }
};

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, saveToken, logout, clearToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};


