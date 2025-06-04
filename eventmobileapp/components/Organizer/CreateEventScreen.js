import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { TextInput, Button as PaperButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';
import Apis, { endpoints } from '../../config/Apis';
import MyStyles from '../../styles/MyStyles';
import { AuthContext } from '../../config/AuthContext';

const CreateEventScreen = ({ navigation }) => {
  const [event, setEvent] = useState({
    name: '',
    description: '',
    location: '',
    ticket_price_regular: '',
    ticket_price_vip: '',
  });

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState('pending');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  const { token } = useContext(AuthContext);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setVideo(result.assets[0]);
    }
  };

  const createEvent = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để tạo sự kiện');
      return;
    }

    if (!image) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh cho sự kiện');
      return;
    }

    if (!categoryId) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục sự kiện');
      return;
    }

    try {
      let form = new FormData();
      form.append('name', event.name);
      form.append('description', event.description);
      form.append('location', event.location);
      form.append('start_time', startTime.toISOString());
      form.append('end_time', endTime.toISOString());
      form.append('ticket_price_regular', event.ticket_price_regular);
      form.append('ticket_price_vip', event.ticket_price_vip || '');
      form.append('status', status);
      form.append('category_id', categoryId);

      if (image) {
        form.append('image', {
          uri: image.uri,
          name: image.fileName || 'event.jpg',
          type: 'image/jpeg',
        });
      }

      if (video) {
        form.append('video', {
          uri: video.uri,
          name: video.fileName || 'event.mp4',
          type: 'video/mp4',
        });
      }

      const res = await Apis.post(endpoints.events, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Thành công', 'Sự kiện đã được tạo');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể tạo sự kiện');
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Không có quyền', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await Apis.get('/categories/');
        setCategories(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
      }
    };

    requestPermission();
    fetchCategories();
  }, []);

  return (
    <ScrollView style={MyStyles.container}>
      <Text style={MyStyles.title}>Tạo sự kiện mới</Text>

      <TextInput
        label="Tên sự kiện"
        value={event.name}
        onChangeText={(t) => setEvent({ ...event, name: t })}
        style={MyStyles.m}
      />

      <TextInput
        label="Mô tả"
        multiline
        value={event.description}
        onChangeText={(t) => setEvent({ ...event, description: t })}
        style={MyStyles.m}
      />

      <TextInput
        label="Địa điểm"
        value={event.location}
        onChangeText={(t) => setEvent({ ...event, location: t })}
        style={MyStyles.m}
      />

      <PaperButton mode="outlined" onPress={() => setShowStartPicker(true)} style={MyStyles.m}>
        Chọn thời gian bắt đầu: {moment(startTime).format('DD/MM/YYYY HH:mm')}
      </PaperButton>

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="datetime"
        date={startTime}
        onConfirm={(date) => {
          setShowStartPicker(false);
          setStartTime(date);
        }}
        onCancel={() => setShowStartPicker(false)}
      />

      <PaperButton mode="outlined" onPress={() => setShowEndPicker(true)} style={MyStyles.m}>
        Chọn thời gian kết thúc: {moment(endTime).format('DD/MM/YYYY HH:mm')}
      </PaperButton>

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="datetime"
        date={endTime}
        onConfirm={(date) => {
          setShowEndPicker(false);
          setEndTime(date);
        }}
        onCancel={() => setShowEndPicker(false)}
      />

      <TextInput
        label="Giá vé thường (VNĐ)"
        keyboardType="numeric"
        value={event.ticket_price_regular}
        onChangeText={(t) => setEvent({ ...event, ticket_price_regular: t })}
        style={MyStyles.m}
      />

      <TextInput
        label="Giá vé VIP (VNĐ) - tùy chọn"
        keyboardType="numeric"
        value={event.ticket_price_vip}
        onChangeText={(t) => setEvent({ ...event, ticket_price_vip: t })}
        style={MyStyles.m}
      />

      <Text style={{ marginTop: 10, marginLeft: 10 }}>Chọn danh mục:</Text>
      <Picker
        selectedValue={categoryId}
        onValueChange={(itemValue) => setCategoryId(itemValue)}
        style={{ margin: 10, backgroundColor: '#f0f0f0' }}
      >
        <Picker.Item label="-- Chọn danh mục --" value="" />
        {categories.map((c) => (
          <Picker.Item label={c.name} value={c.id.toString()} key={c.id} />
        ))}
      </Picker>

      <PaperButton mode="outlined" onPress={pickImage} style={MyStyles.m}>
        Chọn ảnh
      </PaperButton>
      {image && (
        <Image source={{ uri: image.uri }} style={{ height: 180, borderRadius: 8, marginVertical: 10 }} />
      )}

      <PaperButton mode="outlined" onPress={pickVideo} style={MyStyles.m}>
        Chọn video
      </PaperButton>

      <PaperButton mode="contained" onPress={createEvent} style={MyStyles.m}>
        Tạo sự kiện
      </PaperButton>
    </ScrollView>
  );
};

export default CreateEventScreen;
