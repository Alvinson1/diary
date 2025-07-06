import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { SecuritySetup } from '@/components/SecuritySetup';

export default function SecurityScreen() {
  const { securitySettings } = useAuth();

  const handleComplete = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <SecuritySetup onComplete={handleComplete} onCancel={handleCancel} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});