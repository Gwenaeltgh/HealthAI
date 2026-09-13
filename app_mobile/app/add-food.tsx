import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';
import { useFoodStore } from '@/stores/food.store';
import type { FoodItem } from '@/types/food';

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
};

export default function AddFoodScreen() {
  const router = useRouter();
  const colors = useColors();

  const { mealId, mealType } = useLocalSearchParams<{
    mealId: string;
    mealType: string;
  }>();

  const { foods, searchFoods, isLoading } = useFoodStore();

  const [query, setQuery] = useState('');

  const mealLabel = MEAL_LABELS[mealType ?? ''] ?? 'Repas';

  // // 🔍 chargement initial (suggestions)
  // useEffect(() => {
  //   searchFoods('');
  // }, []);

  // 🔍 debounce search
  useEffect(() => {
  if (!query.trim()) return;

  const t = setTimeout(() => {
    searchFoods(query);
  }, 250);

  return () => clearTimeout(t);
}, [query]);

  const goToDetail = (food: FoodItem) => {
    router.push({
      pathname: '/food-detail' as any,
      params: {
        mealId,
        mealType,
        foodId: food.id,
        foodName: food.name,
        foodCalories: food.calories,
        foodProtein: food.protein,
        foodCarbs: food.carbs,
        foodFat: food.fat,
      },
    });
  };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.headerBg,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    cancelBtn: { width: 72 },
    cancelTxt: { fontSize: 16, color: colors.textSecondary },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'serif',
    },

    searchWrap: { padding: 16, paddingBottom: 8 },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },

    scroll: {
      padding: 16,
      gap: 12,
      paddingBottom: 40,
    },

    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 1,
    },

    empty: {
      alignItems: 'center',
      paddingTop: 48,
      gap: 12,
    },

    emptyTxt: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    list: { gap: 10 },

    foodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },

    foodInfo: { flex: 1, gap: 2 },

    foodName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },

    foodCategory: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    foodKcal: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      marginTop: 2,
    },

    foodRight: {
      alignItems: 'flex-end',
      gap: 8,
    },

    foodMacros: {
      fontSize: 11,
      color: colors.textSecondary,
    },

    addBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelTxt}>Annuler</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Ajouter — {mealLabel}
        </Text>

        <View style={styles.cancelBtn} />
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un aliment..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>
          {query.length > 0
            ? `RÉSULTATS (${foods.length})`
            : 'SUGGESTIONS'}
        </Text>

        {isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>Chargement...</Text>
          </View>
        ) : foods.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={40}
              color={colors.outlineVariant}
            />
            <Text style={styles.emptyTxt}>
              Aucun aliment trouvé
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {foods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.foodItem}
                onPress={() => goToDetail(food)}
              >
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>
                    {food.name}
                  </Text>

                  {/* fallback simple car OpenFoodFacts n’a pas category */}
                  {/* <Text style={styles.foodCategory}>
                    Aliment OpenFoodFacts
                  </Text> */}
                 

                  <Text style={styles.foodKcal}>
                    {food.calories} kcal / 100g
                  </Text>
                </View>

                <View style={styles.foodRight}>
                  <Text style={styles.foodMacros}>
                    P {food.protein}g · G {food.carbs}g · L {food.fat}g
                  </Text>

                  <View style={styles.addBtn}>
                    <Ionicons
                      name="add"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}