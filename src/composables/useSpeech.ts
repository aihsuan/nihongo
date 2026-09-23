/**
 * 日語發音。
 *
 * 用瀏覽器內建的 speechSynthesis，不綁任何音檔 —— 零資產、零成本，
 * 而且整層包在 speak() 後面，之後換真人錄音只要改這一個檔案。
 *
 * 代價是日語語音不保證存在：macOS 有 Kyoko，部分 Windows 與多數 Linux
 * 沒裝日語語音包。那些機器上必須明說「這台電腦沒有日語語音」，
 * 而不是讓按鈕按下去毫無反應。
 */
import { onMounted, ref } from 'vue'

/**
 * 挑語音不能拿「第一個 ja 開頭的」就用。
 * macOS 的日語語音有十一個，前面幾個是 Eddy、Grandma、Rocko 這類變聲玩具，
 * 唸出來的聲調是壞的。Kyoko／Hattori／O-Ren 才是正常發音的那幾個。
 */
const PREFERRED = [
  'Kyoko', 'Hattori', 'O-Ren',          // macOS / iOS
  'Ayumi', 'Haruka', 'Ichiro', 'Nanami', // Windows
  'Google 日本語',                        // Chrome
]

const supported = ref(false)
const checked = ref(false)
let jaVoice: SpeechSynthesisVoice | null = null

function findVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    checked.value = true
    return
  }
  const voices = window.speechSynthesis.getVoices()
  // 語音清單在部分瀏覽器是非同步載入的，第一次呼叫可能拿到空陣列
  if (voices.length === 0) return

  const ja = voices.filter((v) => v.lang.replace('_', '-').startsWith('ja'))
  jaVoice =
    PREFERRED.map((name) => ja.find((v) => v.name.includes(name))).find(Boolean) ??
    ja[0] ??
    null

  supported.value = Boolean(jaVoice)
  voiceName.value = jaVoice?.name ?? null
  checked.value = true
}

/** 顯示用：讓使用者知道現在是誰在唸 */
export const voiceName = ref<string | null>(null)

export function useSpeech() {
  onMounted(() => {
    findVoice()
    if (!checked.value && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', findVoice, { once: true })
    }
  })

  function speak(text: string) {
    if (!supported.value || !jaVoice) return
    const synth = window.speechSynthesis
    synth.cancel() // 連點時不要疊在一起唸
    const u = new SpeechSynthesisUtterance(text)
    u.voice = jaVoice
    u.lang = 'ja-JP'
    u.rate = 0.85 // 初學者跟不上原速
    synth.speak(u)
  }

  /**
   * 依序唸完多句，中間不 cancel —— 聽解的對話題要一整段連著播。
   *
   * 兩個角色用同一個語音、靠音高分辨。這當然不如兩個真人錄音，
   * 但比一整段平平地唸下來好：初學者至少聽得出哪裡換人講。
   */
  function speakLines(lines: { text: string; who?: 'A' | 'B' }[]) {
    if (!supported.value || !jaVoice) return
    const synth = window.speechSynthesis
    synth.cancel()
    for (const line of lines) {
      const u = new SpeechSynthesisUtterance(line.text)
      u.voice = jaVoice
      u.lang = 'ja-JP'
      u.rate = 0.85
      if (line.who) u.pitch = line.who === 'B' ? 0.75 : 1.2
      synth.speak(u)
    }
  }

  function stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  return { speak, speakLines, stop, supported, checked, voiceName }
}
