import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RestaurantProvider } from "@/hooks/restaurant-store";
import { AuthProvider } from "@/hooks/auth-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="restaurant/[id]" 
        options={{ 
          title: "Restaurant",
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#1A1A1A',
        }} 
      />
      <Stack.Screen 
        name="(tabs)/ai/index" 
        options={{ 
          title: "Ask AI",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="plan/[id]" 
        options={{ 
          title: "Plan",
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#1A1A1A',
        }} 
      />
      <Stack.Screen 
        name="create-collection" 
        options={{ 
          title: "New Plan",
          presentation: 'modal',
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#1A1A1A',
        }} 
      />
      <Stack.Screen 
        name="join-plan" 
        options={{ 
          title: "Join Plan",
          presentation: 'modal',
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#1A1A1A',
        }} 
      />
      <Stack.Screen 
        name="auth" 
        options={{ 
          title: "Sign In",
          presentation: 'modal',
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#1A1A1A',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RestaurantProvider>
          <GestureHandlerRootView>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </RestaurantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}