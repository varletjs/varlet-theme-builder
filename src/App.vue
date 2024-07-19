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
import Color from 'color'

const { toggleDark } = useDark()

const light = ref<Record<string, Record<string, string>>>()
const dark = ref<Record<string, Record<string, string>>>()
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
      const {
        color: [h, s, l],
        valpha
      } = Color(hexFromArgb(value)).hsl() as any
      scheme[tokenMap[key as keyof typeof tokenMap]] = {
        key: tokenMap[key as keyof typeof tokenMap].replace('--color-', ''),
        color: `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${valpha})`,
        hsl: `${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%`,
        alpha: valpha
      }
    }
    return scheme
  }, {} as Record<string, Record<string, string>>)
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
  const lightTheme = Object.entries(light.value!).reduce((theme, [key, value]) => {
    const hslKey = key.replace('--color', '--hsl')
    theme[hslKey] = value.hsl
    theme[key] = `hsla(var(${hslKey}), ${value.alpha})`
    return theme
  }, {} as Record<string, any>)

  const darkTheme = Object.entries(dark.value!).reduce((theme, [key, value]) => {
    const hslKey = key.replace('--color', '--hsl')
    theme[hslKey] = value.hsl
    theme[key] = `hsla(var(${hslKey}), ${value.alpha})`
    return theme
  }, {} as Record<string, any>)

  const themes = {
    light: lightTheme,
    dark: darkTheme
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
  <div class="w-full flex justify-center">
    <div class="flex flex-col justify-center items-center min-h-screen p-[40px] lg:p-[80px] max-w-[1400px]">
      <var-input class="w-[300px" placeholder="e.g. #f82506" variant="outlined" v-model.trim="source">
        <template #append-icon>
          <var-uploader hide-list v-model="files" @after-read="handleAfterRead" @mousedown.stop>
            <var-button type="primary">Upload Image</var-button>
          </var-uploader>
        </template>
      </var-input>

      <div class="flex items-center gap-3 mt-11">
        <var-button type="success" v-if="light && dark" @click="copyThemes">Copy Themes</var-button>
        <var-button type="primary" icon-container round @click="toggleDark">
          <var-icon name="palette" :size="24" />
        </var-button>
      </div>

      <var-paper class="p-[30px] mt-[50px]" :elevation="2" :radius="12" v-if="light">
        <div class="text-[22px] pb-[30px] pt-[4px] px-[4px]">Light</div>
        <div class="flex flex-wrap gap-8">
          <div
            class="flex flex-col items-center flex-col items-center w-full md:w-[200px]"
            v-for="i in light"
            :key="i.key"
          >
            <div class="w-full h-[44px] rounded-10" :style="{ backgroundColor: i.color }"></div>
            <div class="mt-3">{{ i.key }}</div>
            <div class="mt-2">{{ i.color }}</div>
          </div>
        </div>
      </var-paper>

      <var-paper class="p-[30px] mt-[50px]" :elevation="2" :radius="12" v-if="dark">
        <div class="text-[22px] pb-[30px] pt-[4px] pb-[24px] px-[4px]">Dark</div>
        <div class="flex flex-wrap gap-8">
          <div
            class="flex flex-col items-center flex-col items-center w-full md:w-[200px]"
            v-for="i in dark"
            :key="i.key"
          >
            <div class="w-full h-[44px] rounded-10" :style="{ backgroundColor: i.color }"></div>
            <div class="mt-3">{{ i.key }}</div>
            <div class="mt-2">{{ i.color }}</div>
          </div>
        </div>
      </var-paper>

      <img ref="image" class="opacity-0 fixed left-[-1000px] pointer-events-none" :src="imageUrl" />
    </div>
  </div>
</template>
