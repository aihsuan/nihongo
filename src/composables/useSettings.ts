/**
 * 全域偏好。跟進度一樣只住在這一層，元件不直接碰 localStorage。
 */
import { reactive, watch } from 'vue'

const KEY = 'nihongo.settings.v1'

interface Settings {
  /**
   * 羅馬字。預設開，因為第一課關掉就沒人讀得下去；
   * 但第 1 章讀完會提示使用者自己關掉 —— 系統自動關會被當成壞掉，
   * 自己按下去的人才會接受後果。
   */
  romaji: boolean
  /** 那個提示只跳一次，不管使用者按了什麼 */
  romajiPromptSeen: boolean
}

function load(): Settings {
  const base: Settings = { romaji: true, romajiPromptSeen: false }
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...base, ...(JSON.parse(raw) as Partial<Settings>) } : base
  } catch {
    return base
  }
}

const settings = reactive(load())

watch(settings, (s) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* 無痕模式時略過 */
  }
})

export function useSettings() {
  return { settings }
}
