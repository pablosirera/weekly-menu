<script setup>
import ScheduleItem from './ScheduleItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'

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
  <ScheduleItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Desayuno</template>

    {{ breakfast }}
  </ScheduleItem>

  <ScheduleItem>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>Almuerzo</template>

    {{ snack }}
  </ScheduleItem>

  <ScheduleItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>Comida</template>

    {{ lunch }}
  </ScheduleItem>

  <ScheduleItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Merienda</template>

    {{ snack2 }}
  </ScheduleItem>

  <ScheduleItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Cena</template>

    {{ dinner }}
  </ScheduleItem>
</template>
