<script setup>
import ScheduleItem from './ScheduleItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
import BordererCard from './BordererCard.vue'

defineProps({
  menu: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="mt-10">
    <!-- TODO: pasar las keys a constantes -->
    <h2 class="font-bold text-3xl dark:text-white">Menú</h2>
    <ScheduleItem>
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <BordererCard title="Desayuno" :text="menu['breakfast']?.description" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <ToolingIcon />
      </template>
      <template #heading>
        <BordererCard title="Almuerzo" :text="menu['snack']?.description" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <EcosystemIcon />
      </template>
      <template #heading>
        <BordererCard title="Comida" :text="menu['lunch']?.description" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <CommunityIcon />
      </template>
      <template #heading>
        <BordererCard title="Merienda" :text="menu['snack2']?.description" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <SupportIcon />
      </template>
      <template #heading>
        <BordererCard title="Cena" :text="menu['dinner']?.description" />
      </template>
    </ScheduleItem>
  </section>
</template>
