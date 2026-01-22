import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Alert, 
  SectionList, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { inventoryAPI, transactionAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
}

interface SectionData {
  title: string;
  data: InventoryItem[];
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    totalQuantity: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getAllItems();
      if (response.success) {
        setItems(response.items);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Group items by category
  const categorizedItems = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, InventoryItem[]>);

    return Object.keys(grouped)
      .sort()
      .map((category) => ({
        title: category,
        data: grouped[category].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [items]);

  // --- Actions ---

  const handleRequestItem = async (itemId: string) => {
    if (user?.role === 'admin') return;

    Alert.alert(
      'Request Item',
      'Are you sure you want to request this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              const response = await transactionAPI.requestItem(itemId);
              if (response.success) {
                Alert.alert('Success', 'Item requested successfully!');
                loadInventory();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to request item');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await inventoryAPI.deleteItem(itemId);
              if (response.success) {
                Alert.alert('Success', 'Item deleted');
                loadInventory();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  // --- Modal Logic ---

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', category: '', totalQuantity: '' });
    setModalVisible(true);
  };

  const openEditModal = async (item: InventoryItem) => {
    // Optional: Fetch fresh data as requested
    try {
        const response = await inventoryAPI.getItemById(item._id);
        if (response.success) {
            const freshItem = response.item;
            setFormData({
                name: freshItem.name,
                category: freshItem.category,
                totalQuantity: freshItem.totalQuantity.toString()
            });
            setSelectedItemId(freshItem._id);
            setIsEditing(true);
            setModalVisible(true);
        }
    } catch (error) {
        Alert.alert('Error', 'Could not fetch item details');
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.category || !formData.totalQuantity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      totalQuantity: parseInt(formData.totalQuantity),
      // For new items, available = total. For updates, backend logic handles specific fields.
      // If adding new item, availableQuantity will default to totalQuantity in backend
      ...(isEditing ? {} : { availableQuantity: parseInt(formData.totalQuantity) })
    };

    try {
      if (isEditing && selectedItemId) {
        const response = await inventoryAPI.updateItem(selectedItemId, payload);
        if (response.success) Alert.alert('Success', 'Item updated');
      } else {
        const response = await inventoryAPI.addItem(payload);
        if (response.success) Alert.alert('Success', 'Item added');
      }
      setModalVisible(false);
      loadInventory();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save item');
    }
  };

  // --- Renderers ---

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isAvailable = item.availableQuantity > 0;
    const isAdmin = user?.role === 'admin';
    
    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
            <Text className="text-sm text-gray-500 mt-1">{item.category}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-medium ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
              {isAvailable ? 'Available' : 'Out of Stock'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-sm text-gray-600">
            {item.availableQuantity} of {item.totalQuantity} available
          </Text>
          
          {/* Admin Controls */}
          {isAdmin ? (
            <View className="flex-row gap-3">
               <TouchableOpacity 
                onPress={() => openEditModal(item)}
                className="p-2 bg-blue-50 rounded-full"
              >
                <Ionicons name="pencil" size={20} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteItem(item._id)}
                className="p-2 bg-red-50 rounded-full"
              >
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ) : (
            /* Student Control */
            isAvailable && (
              <TouchableOpacity
                className="bg-blue-600 px-4 py-2 rounded-lg"
                onPress={() => handleRequestItem(item._id)}
              >
                <Text className="text-white font-medium">Request</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View className="bg-gray-100 px-4 py-2 mt-4 mb-2">
      <Text className="text-lg font-bold text-gray-800">{section.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SectionList
        sections={categorizedItems}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }} // Add padding for FAB
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadInventory} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="cube-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">No items available</Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />

      {/* Floating Action Button for Admin */}
      {user?.role === 'admin' && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg"
          onPress={openAddModal}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}

      {/* Add/Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end bg-black/50"
          >
            <View className="bg-white rounded-t-3xl p-6 shadow-xl">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Item' : 'Add New Item'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View className="space-y-4 mb-6">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Item Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg p-3"
                    placeholder="e.g., Cricket Bat"
                    value={formData.name}
                    onChangeText={(t) => setFormData(prev => ({...prev, name: t}))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Category</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg p-3"
                    placeholder="e.g., Sports"
                    value={formData.category}
                    onChangeText={(t) => setFormData(prev => ({...prev, category: t}))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Total Quantity</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg p-3"
                    placeholder="e.g., 5"
                    keyboardType="numeric"
                    value={formData.totalQuantity}
                    onChangeText={(t) => setFormData(prev => ({...prev, totalQuantity: t}))}
                  />
                </View>
              </View>

              <TouchableOpacity
                className="bg-blue-600 p-4 rounded-xl mb-4"
                onPress={handleSaveItem}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isEditing ? 'Update Item' : 'Add Item'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}