import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Button, TextInput, Card, Divider, Menu, ActivityIndicator, Chip } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import HomeStyles from "../../styles/HomeStyles";
import Apis, { endpoints } from "../../config/Apis";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const navigation = useNavigation();

  const sortOptions = [
    { key: "popularity", label: "Độ phổ biến" },
    { key: "date", label: "Ngày diễn ra" },
    { key: "price_low", label: "Giá thấp đến cao" },
    { key: "price_high", label: "Giá cao đến thấp" },
    { key: "newest", label: "Mới nhất" }
  ];

  // Load categories from API
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await Apis.get(endpoints.categories);

      // Transform API response to match UI structure
      const apiCategories = res.data.map(tag => ({
        id: tag.id.toString(), // Convert to string for consistency
        name: tag.tag
      }));

      // Add "Tất cả" option at the beginning
      const allCategories = [
        { id: "all", name: "Tất cả" },
        ...apiCategories
      ];

      setCategories(allCategories);
    } catch (ex) {
      console.error("Error loading categories:", ex);
      // Fallback to default categories if API fails
      setCategories([
        { id: "all", name: "Tất cả" },
        { id: "1", name: "Âm nhạc" },
        { id: "2", name: "Kinh doanh" },
        { id: "3", name: "Nghệ thuật" },
        { id: "4", name: "Thể thao" },
        { id: "5", name: "Giáo dục" }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      let url = endpoints.searchEvents;
      if (keyword) {
        url += `?keyword=${encodeURIComponent(keyword)}`;
      }
      const res = await Apis.get(url);
      setEvents(res.data);
      applyFiltersAndSort(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (eventList = events) => {
    let filtered = [...eventList];

    // Filter by category
    if (selectedCategory !== "all") {
        filtered = filtered.filter(event => {
    if (event.category && event.category.id != null) {
      return String(event.category.id) === String(selectedCategory);
    }
        return false;
    });
  }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.start_time) - new Date(b.start_time);
        case "price_low":
          return (a.ticket_price_regular || 0) - (b.ticket_price_regular || 0);
        case "price_high":
          return (b.ticket_price_regular || 0) - (a.ticket_price_regular || 0);
        case "newest":
          return new Date(b.created_date || b.start_time) - new Date(a.created_date || a.start_time);
        case "popularity":
        default:
          // Hot events first
          if (a.status === "hot" && b.status !== "hot") return -1;
          if (b.status === "hot" && a.status !== "hot") return 1;
          return new Date(b.created_date || b.start_time) - new Date(a.created_date || a.start_time);
      }
    });

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    // Load both categories and events on component mount
    loadCategories();
    loadEvents();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (keyword !== "") {
        loadEvents();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [keyword]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [selectedCategory, sortBy, events]);

  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={HomeStyles.categoryContainer}
      contentContainerStyle={HomeStyles.categoryScrollContainer}
    >
      {loadingCategories ? (
        <View style={HomeStyles.categoryLoadingContainer}>
          <ActivityIndicator size="small" color="#6200ee" />
          <Text style={HomeStyles.categoryLoadingText}>Đang tải danh mục...</Text>
        </View>
      ) : (
        categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              HomeStyles.categoryChip,
              selectedCategory === category.id ? HomeStyles.categoryChipSelected : HomeStyles.categoryChipUnselected,
            ]}
            textStyle={
              selectedCategory === category.id ? HomeStyles.categoryChipTextSelected : HomeStyles.categoryChipTextUnselected
            }
          >
            {category.name}
          </Chip>
        ))
      )}
    </ScrollView>
  );

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
    >
      <Card style={HomeStyles.eventCard}>
        {/* Hot Badge */}
        {item.status === "hot" && (
          <View style={HomeStyles.hotBadge}>
            <Text style={HomeStyles.hotBadgeIcon}>🔥</Text>
            <Text style={HomeStyles.hotBadgeText}>Nổi bật</Text>
          </View>
        )}

        {/* Category Badge */}
        {item.category && (
          <View style={HomeStyles.categoryBadge}>
            <Text style={HomeStyles.categoryBadgeText}>
              {item.category.name || item.category.tag}
            </Text>
          </View>
        )}

        {/* Event Image */}
        {item.image ? (
          <Card.Cover
            source={{ uri: item.image }}
            style={HomeStyles.eventImage}
          />
        ) : (
          <View style={HomeStyles.placeholderImage}>
            <Text style={HomeStyles.placeholderIcon}>🎉</Text>
            <Text style={HomeStyles.placeholderText}>Sự kiện sắp tới</Text>
          </View>
        )}

        <Card.Content style={HomeStyles.eventContent}>
          {/* Event Title */}
          <Text
            style={HomeStyles.eventTitle}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          {/* Organizer Info */}
          {item.organizer && (
            <View style={HomeStyles.organizerContainer}>
              <Text style={HomeStyles.organizerIcon}>👤</Text>
              <Text style={HomeStyles.organizerName}>
                {item.organizer.first_name} {item.organizer.last_name}
              </Text>
              {item.organizer.is_verified && (
                <View style={HomeStyles.verifiedBadge}>
                  <Text style={HomeStyles.verifiedText}>✓ Xác thực</Text>
                </View>
              )}
            </View>
          )}

          <Divider style={HomeStyles.divider} />

          {/* Event Details */}
          <View style={HomeStyles.eventDetailsContainer}>
            {/* Date & Time */}
            <View style={HomeStyles.eventDetailRow}>
              <Text style={HomeStyles.eventDetailIcon}>🕒</Text>
              <Text style={HomeStyles.eventDetailText}>
                {moment(item.start_time).format("dddd, DD/MM/YYYY - HH:mm")}
              </Text>
            </View>

            {/* Location */}
            <View style={HomeStyles.eventDetailRow}>
              <Text style={HomeStyles.eventDetailIcon}>📍</Text>
              <Text
                style={HomeStyles.eventDetailText}
                numberOfLines={2}
              >
                {item.location}
              </Text>
            </View>

            {/* Price */}
            <View style={HomeStyles.eventDetailRow}>
              <Text style={HomeStyles.eventDetailIcon}>💰</Text>
              <View style={{ flex: 1 }}>
                <Text style={HomeStyles.priceText}>
                  {(item.ticket_price_regular || 0).toLocaleString("vi-VN")} VNĐ
                </Text>
                {item.ticket_price_vip && (
                  <Text style={HomeStyles.priceVipText}>
                    VIP: {item.ticket_price_vip.toLocaleString("vi-VN")} VNĐ
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={HomeStyles.actionButton}
            onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
          >
            <Text style={HomeStyles.actionButtonText}>
              Xem chi tiết & Đặt vé
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[MyStyles.container, HomeStyles.container]}>
      {/* Enhanced Header */}
      <View style={HomeStyles.header}>
        <Text style={HomeStyles.headerTitle}>🎭 Khám phá sự kiện</Text>

        {/* Search Input */}
        <TextInput
          label="Tìm kiếm sự kiện, địa điểm..."
          value={keyword}
          onChangeText={setKeyword}
          style={HomeStyles.searchInput}
          right={<TextInput.Icon icon="magnify" />}
          mode="outlined"
          outlineColor="#e9ecef"
          activeOutlineColor="#6200ee"
        />

        {/* Search Button & Controls */}
        <View style={HomeStyles.searchContainer}>
          <Button
            mode="contained"
            onPress={loadEvents}
            loading={loading}
            disabled={loading}
            style={HomeStyles.searchButton}
            icon="magnify"
            buttonColor="#6200ee"
          >
            Tìm kiếm
          </Button>

          {/* Sort Menu */}
          <Menu
            visible={showSortMenu}
            onDismiss={() => setShowSortMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowSortMenu(true)}
                style={HomeStyles.sortButton}
                icon="sort"
                textColor="#6200ee"
              >
                Sắp xếp
              </Button>
            }
          >
            {sortOptions.map((option) => (
              <Menu.Item
                key={option.key}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortMenu(false);
                }}
                title={option.label}
                titleStyle={
                  sortBy === option.key ? HomeStyles.menuItemSelected : HomeStyles.menuItemUnselected
                }
              />
            ))}
          </Menu>
        </View>

        {/* Results Count */}
        <Text style={HomeStyles.resultsCount}>
          {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${filteredEvents.length} sự kiện`}
        </Text>
      </View>

      {/* Category Filter */}
      {renderCategoryChips()}

      {/* Events List */}
      {loading && events.length === 0 ? (
        <View style={HomeStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={HomeStyles.loadingText}>
            Đang tải danh sách sự kiện...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                loadEvents();
                loadCategories(); // Also refresh categories
              }}
              colors={['#6200ee']}
              tintColor="#6200ee"
            />
          }
          contentContainerStyle={HomeStyles.flatListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && (
              <View style={HomeStyles.emptyContainer}>
                <Text style={HomeStyles.emptyIcon}>🔍</Text>
                <Text style={HomeStyles.emptyTitle}>
                  Không tìm thấy sự kiện nào
                </Text>
                <Text style={HomeStyles.emptyDescription}>
                  Thử thay đổi từ khóa tìm kiếm{'\n'}hoặc chọn danh mục khác
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setKeyword("");
                    setSelectedCategory("all");
                    loadEvents();
                  }}
                  style={HomeStyles.emptyButton}
                  textColor="#6200ee"
                >
                  Xem tất cả sự kiện
                </Button>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default Home;