import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { router } from "expo-router";

export default function ListsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "My Lists",
          headerStyle: { backgroundColor: '#FFF' },
          headerTintColor: '#1A1A1A',
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push({ pathname: '/create-collection' })}>
              <Plus size={24} color="#FF6B6B" />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack>
  );
}