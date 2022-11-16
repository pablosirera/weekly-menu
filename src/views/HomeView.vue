<script setup>
import { ref } from 'vue'
import MenuSchedule from '@/components/MenuSchedule.vue'
import RadioGroups from '@/components/RadioGroups.vue'
import { menu } from '@/utils/menu'

const defaultDay = ref(new Date().getDate())
const localMenu = ref(menu[defaultDay.value.toString()])

const changeDay = day => {
  console.log(day)
  localMenu.value = menu[day]
}

console.log(localMenu.value)
</script>

<template>
  <main>
    <h2 class="font-bold text-3xl mb-4 dark:text-white">Days</h2>
    <RadioGroups
      :options="[
        { value: '14', text: '14' },
        { value: '15', text: '15' },
        { value: '16', text: '16' },
      ]"
      :defaultOption="defaultDay.toString()"
      name="days"
      @change="changeDay"
    />
    <MenuSchedule v-bind="localMenu" />
  </main>
</template>
