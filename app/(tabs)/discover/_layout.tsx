import { Stack } from "expo-router";

export default function DiscoverLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Discover",
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#1A1A1A',
          headerTitleStyle: { fontWeight: '700' },
        }} 
      />
    </Stack>
  );
}