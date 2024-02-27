<script setup lang="ts">
import {
  Scheme,
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  themeFromImage
} from '@material/material-color-utilities'
import { useDark } from './use'
import { useClipboard } from '@vueuse/core'
import { VarFile } from '@varlet/ui'

useDark()

const light = ref<Record<string, string>>()
const dark = ref<Record<string, string>>()
const source = ref('')
const files = ref([])
const image = ref<HTMLImageElement>()
const imageUrl = ref('')
const { copy } = useClipboard({ legacy: true })

const tokenMap = {
  surface: '--color-body',
  onSurface: '--color-text',
  primary: '--color-primary',
  secondary: '--color-info',
  tertiary: '--color-warning',
  error: '--color-danger',
  onPrimary: '--color-on-primary',
  onSecondary: '--color-on-info',
  onTertiary: '--color-on-warning',
  onError: '--color-on-danger',
  primaryContainer: '--color-primary-container',
  secondaryContainer: '--color-info-container',
  tertiaryContainer: '--color-warning-container',
  errorContainer: '--color-danger-container',
  onPrimaryContainer: '--color-on-primary-container',
  onSecondaryContainer: '--color-on-info-container',
  onTertiaryContainer: '--color-on-warning-container',
  onErrorContainer: '--color-on-danger-container',
  inverseSurface: '--color-inverse-surface',
  outline: '--color-outline',
  onSurfaceVariant: '--color-on-surface-variant'
}

watch(() => source.value, generateSchemes)

function toHexScheme(scheme: Scheme) {
  return Object.entries(scheme.toJSON()).reduce((scheme, [key, value]) => {
    if (key in tokenMap) {
      scheme[tokenMap[key as keyof typeof tokenMap]] = hexFromArgb(value)
    }
    return scheme
  }, {} as Record<string, string>)
}

function generateSchemes() {
  try {
    const theme = themeFromSourceColor(argbFromHex(source.value))
    light.value = toHexScheme(theme.schemes.light)
    dark.value = toHexScheme(theme.schemes.dark)
  } catch (e) {
    console.log('Invalid color')
  }
}

function copyThemes() {
  const themes = {
    light: light.value,
    dark: dark.value
  }
  copy(JSON.stringify(themes, null, 2))
  Snackbar.success('Themes copied!')
}

async function handleAfterRead(file: VarFile) {
  imageUrl.value = file.url!
  await nextTick()
  const theme = await themeFromImage(image.value!)
  light.value = toHexScheme(theme.schemes.light)
  dark.value = toHexScheme(theme.schemes.dark)
}
</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-screen p-[24px]">
    <var-input class="w-[300px] mt-[10px]" placeholder="e.g. #f82506" variant="outlined" v-model.trim="source">
      <template #append-icon>
        <var-uploader hide-list v-model="files" @after-read="handleAfterRead">
          <var-button type="primary">Upload Image</var-button>
        </var-uploader>
      </template>
    </var-input>

    <var-button class="mt-[30px]" type="success" v-if="light && dark" @click="copyThemes">Copy Themes</var-button>

    <var-paper class="p-[30px] mt-[30px]" :elevation="2" :radius="12" v-if="light">
      <div class="text-[22px] pb-[30px] px-[4px]">Light</div>
      <var-space :size="[24, 24]">
        <div class="flex flex-col items-center w-[50px]" v-for="i in light" :key="i">
          <div class="rounded-[50%] w-[40px] h-[40px] mb-[10px]" :style="{ backgroundColor: i }"></div>
          <div>{{ i }}</div>
        </div>
      </var-space>
    </var-paper>

    <var-paper class="p-[30px] mt-[30px]" :elevation="2" :radius="12" v-if="dark">
      <div class="text-[22px] pb-[30px] px-[4px]">Dark</div>
      <var-space :size="[24, 24]">
        <div class="flex flex-col items-center w-[50px]" v-for="i in dark" :key="i">
          <div class="rounded-[50%] w-[40px] h-[40px] mb-[10px]" :style="{ backgroundColor: i }"></div>
          <div>{{ i }}</div>
        </div>
      </var-space>
    </var-paper>

    <img ref="image" class="opacity-0 fixed left-[-1000px] pointer-events-none" :src="imageUrl" />
  </div>
</template>
