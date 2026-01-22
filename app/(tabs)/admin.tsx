import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface Transaction {
  _id: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  requestDate: string;
  returnDate?: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  item: {
    _id: string;
    name: string;
    category: string;
  };
}

export default function AdminScreen() {
  const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPendingRequests();
    }
  }, [user]);

  const loadPendingRequests = async () => {
    try {
      const response = await transactionAPI.getPendingRequests();
      if (response.success) {
        setPendingRequests(response.requests);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    try {
      const response = await transactionAPI.approveRequest(transactionId);
      if (response.success) {
        Alert.alert('Success', 'Request approved successfully!');
        loadPendingRequests();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve request');
    }
  };

  const handleReject = async (transactionId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await transactionAPI.rejectRequest(transactionId);
              if (response.success) {
                Alert.alert('Success', 'Request rejected');
                loadPendingRequests();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject request');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
        <View className="mb-3">
          <Text className="text-lg font-semibold text-gray-900">{item.item.name}</Text>
          <Text className="text-sm text-gray-500 mt-1">{item.item.category}</Text>
        </View>

        <View className="border-t border-gray-100 pt-3 mb-3">
          <Text className="text-sm text-gray-700">
            <Text className="font-medium">Student:</Text> {item.user.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">{item.user.email}</Text>
          <Text className="text-xs text-gray-400 mt-2">
            Requested: {new Date(item.requestDate).toLocaleDateString()}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 bg-green-600 px-4 py-2 rounded-lg"
            onPress={() => handleApprove(item._id)}
          >
            <Text className="text-white font-medium text-center">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-600 px-4 py-2 rounded-lg"
            onPress={() => handleReject(item._id)}
          >
            <Text className="text-white font-medium text-center">Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Pending Requests</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} pending approval
        </Text>
      </View>

      <FlatList
        data={pendingRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPendingRequests} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="checkmark-circle-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">No pending requests</Text>
            <Text className="text-gray-400 text-sm mt-2">All requests have been processed</Text>
          </View>
        }
      />
    </View>
  );
}

