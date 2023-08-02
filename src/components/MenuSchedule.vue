<script setup>
import ScheduleItem from './ScheduleItem.vue'
import BordererCard from './BordererCard.vue'
import {
  BriefcaseIcon,
  CakeIcon,
  CubeTransparentIcon,
  FaceSmileIcon,
  HeartIcon,
} from '@heroicons/vue/24/outline'

defineProps({
  menu: {
    type: Object,
    required: true,
  },
})
defineEmits(['updateMenu'])
</script>

<template>
  <section class="mt-10">
    <!-- TODO: pasar las keys a constantes -->
    <h2 class="font-bold text-3xl dark:text-white">Menú</h2>
    <ScheduleItem>
      <template #icon>
        <FaceSmileIcon class="w-6 h-6" />
      </template>
      <template #heading>
        <BordererCard
          title="Desayuno"
          :text="menu['breakfast']?.description"
          :has-edit-icon="true"
          @edit="$emit('updateMenu', 'breakfast')"
        />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <BriefcaseIcon class="w-6 h-6" />
      </template>
      <template #heading>
        <BordererCard
          title="Almuerzo"
          :text="menu['snack']?.description"
          :has-edit-icon="true"
          @edit="$emit('updateMenu', 'snack')"
        />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <CubeTransparentIcon class="w-6 h-6" />
      </template>
      <template #heading>
        <BordererCard
          title="Comida"
          :text="menu['lunch']?.description"
          :has-edit-icon="true"
          @edit="$emit('updateMenu', 'lunch')"
        />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <CakeIcon class="w-6 h-6" />
      </template>
      <template #heading>
        <BordererCard
          title="Merienda"
          :text="menu['snack2']?.description"
          :has-edit-icon="true"
          @edit="$emit('updateMenu', 'snack2')"
        />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <HeartIcon class="w-6 h-6" />
      </template>
      <template #heading>
        <BordererCard
          title="Cena"
          :text="menu['dinner']?.description"
          :has-edit-icon="true"
          @edit="$emit('updateMenu', 'dinner')"
        />
      </template>
    </ScheduleItem>
  </section>
</template>
