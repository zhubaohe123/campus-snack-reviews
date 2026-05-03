// 设备指纹采集（前端）
// 采集浏览器特征生成唯一标识，用于反作弊

export interface DeviceFingerprint {
  hash: string
  ua: string
  screen: string
  timezone: string
  language: string
  platform: string
  cores: number
  touchSupport: boolean
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export async function collectFingerprint(): Promise<DeviceFingerprint> {
  const nav = navigator
  const screen = window.screen

  const parts = [
    nav.userAgent,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.language,
    nav.platform,
    String(nav.hardwareConcurrency || 0),
    String(nav.maxTouchPoints || 0),
  ]

  // Canvas 指纹
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = 200
      canvas.height = 50
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('fingerprint', 2, 15)
      parts.push(canvas.toDataURL().slice(-50))
    }
  } catch {
    // canvas 不可用
  }

  // WebGL 指纹
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        parts.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '')
        parts.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
      }
    }
  } catch {
    // webgl 不可用
  }

  const combined = parts.join('|||')

  return {
    hash: hashString(combined),
    ua: nav.userAgent.slice(0, 100),
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: nav.language,
    platform: nav.platform,
    cores: nav.hardwareConcurrency || 0,
    touchSupport: nav.maxTouchPoints > 0,
  }
}
