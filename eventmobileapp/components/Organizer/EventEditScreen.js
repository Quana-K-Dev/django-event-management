import React, { useState, useEffect,useContext } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import Apis, { authApis, endpoints } from '../../config/Apis';
import MyStyles from '../../styles/MyStyles';
import { AuthContext } from '../../config/AuthContext';

const EventEditScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState({
    name: '',
    description: '',
    location: '',
    ticket_price_regular: '',
    ticket_price_vip: '',
  });
  const [image, setImage] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const { token } = useContext(AuthContext);

  const loadEvent = async () => {
    try {
      const res = await authApis(token).get(endpoints.eventDetails(eventId));
      setEvent({
        name: res.data.name,
        description: res.data.description,
        location: res.data.location,
        ticket_price_regular: res.data.ticket_price_regular.toString(),
        ticket_price_vip: res.data.ticket_price_vip ? res.data.ticket_price_vip.toString() : '',
      });
      setStartTime(new Date(res.data.start_time));
      setImage(res.data.image ? { uri: res.data.image } : null);
    } catch (ex) {
      console.error(ex);
      Alert.alert('Lỗi', 'Không thể tải thông tin sự kiện');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const updateEvent = async () => {
    try {
      let form = new FormData();
      form.append('name', event.name);
      form.append('description', event.description);
      form.append('location', event.location);
      form.append('start_time', startTime.toISOString());
      form.append('ticket_price_regular', event.ticket_price_regular);
      if (event.ticket_price_vip) form.append('ticket_price_vip', event.ticket_price_vip);
      if (image && image.uri) {
        form.append('image', {
          uri: image.uri,
          name: image.fileName || 'event.jpg',
          type: 'image/jpeg',
        });
      }

      await authApis(token).put(endpoints.editEvent(eventId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Thành công', 'Sự kiện đã được cập nhật');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể cập nhật sự kiện');
    }
  };

  useEffect(() => {
    loadEvent();
  }, []);

  return (
    <ScrollView style={MyStyles.container}>
      <Text style={MyStyles.title}>Chỉnh sửa sự kiện</Text>
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
      <Button mode="outlined" onPress={() => setShowPicker(true)} style={MyStyles.m}>
        Chọn thời gian: {moment(startTime).format('DD/MM/YYYY HH:mm')}
      </Button>
      <DateTimePickerModal
        isVisible={showPicker}
        mode="datetime"
        date={startTime}
        onConfirm={(date) => {
          setShowPicker(false);
          setStartTime(date);
        }}
        onCancel={() => setShowPicker(false)}
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
      <Button mode="outlined" onPress={pickImage} style={MyStyles.m}>
        Chọn ảnh
      </Button>
      {image && (
        <Image source={{ uri: image.uri }} style={{ height: 180, borderRadius: 8, marginVertical: 10 }} />
      )}
      <Button mode="contained" onPress={updateEvent} style={MyStyles.m}>
        Cập nhật sự kiện
      </Button>
    </ScrollView>
  );
};

export default EventEditScreen;