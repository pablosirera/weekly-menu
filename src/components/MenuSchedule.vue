<script setup>
import ScheduleItem from './ScheduleItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
import BordererCard from './BordererCard.vue'

defineProps({
  breakfast: {
    type: String,
    required: true,
  },
  snack: {
    type: String,
    required: true,
  },
  lunch: {
    type: String,
    required: true,
  },
  snack2: {
    type: String,
    required: true,
  },
  dinner: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="mt-10">
    <h2 class="font-bold text-3xl dark:text-white">Menú de hoy</h2>
    <ScheduleItem>
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        <BordererCard title="Desayuno" :text="breakfast" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <ToolingIcon />
      </template>
      <template #heading>
        <BordererCard title="Almuerzo" :text="snack" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <EcosystemIcon />
      </template>
      <template #heading>
        <BordererCard title="Comida" :text="lunch" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <CommunityIcon />
      </template>
      <template #heading>
        <BordererCard title="Merienda" :text="snack2" />
      </template>
    </ScheduleItem>

    <ScheduleItem>
      <template #icon>
        <SupportIcon />
      </template>
      <template #heading>
        <BordererCard title="Cena" :text="dinner" />
      </template>
    </ScheduleItem>
  </section>
</template>
