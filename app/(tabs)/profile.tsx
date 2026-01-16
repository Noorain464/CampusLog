import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-8 mb-4">
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{user?.name}</Text>
          <Text className="text-gray-500 mt-1">{user?.email}</Text>
          <View className={`mt-3 px-4 py-1 rounded-full ${
            user?.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            <Text className={`font-medium ${
              user?.role === 'admin' ? 'text-purple-700' : 'text-blue-700'
            }`}>
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-white mb-4">
        <View className="px-6 py-4 border-b border-gray-100">
          <Text className="text-sm text-gray-500">Account Information</Text>
        </View>
        <View className="px-6 py-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="mail-outline" size={20} color="#6b7280" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Email</Text>
              <Text className="text-gray-900 mt-1">{user?.email}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={20} color="#6b7280" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Role</Text>
              <Text className="text-gray-900 mt-1 capitalize">{user?.role}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6">
        <TouchableOpacity
          className="bg-red-600 rounded-lg py-4"
          onPress={handleLogout}
        >
          <Text className="text-white text-center font-semibold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

