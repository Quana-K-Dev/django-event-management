import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  // Container cơ bản
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
  },

  // Căn giữa nội dung
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tiêu đề hoặc văn bản nổi bật
  subject: {
    fontSize: 30,
    color: 'blue',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Hiển thị theo hàng ngang
  row: {
    flexDirection: 'row',
  },

  // Cho phép xuống dòng khi nội dung dài
  wrap: {
    flexWrap: 'wrap',
  },

  // Margin cơ bản
  m: {
    margin: 8,
  },

  // Avatar tròn
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },

  // Ô nhập liệu
  input: {
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 16,
  },

  // Nút bấm
  button: {
    marginVertical: 10,
    paddingVertical: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },

  // Văn bản trong nút
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },

  // Thông báo lỗi
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },

  // Card
  card: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },

  // Điều chỉnh padding theo platform
  platformPadding: {
    padding: Platform.OS === 'ios' ? 10 : 8,
  },

  // Container cho checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});