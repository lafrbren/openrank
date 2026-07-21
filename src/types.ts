export interface CropInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Clip {
  id: string
  file: string // /media/xyz.mp4
  sourceUrl?: string
  name: string
  duration: number
  width: number
  height: number
  trimStart: number
  trimEnd: number
  volume: number // 0..1
  crop: CropInsets // percent insets 0..45
  label: string // caption shown when this clip plays
}

export type Align = 'left' | 'center' | 'right'

export interface TitleStyle {
  font: string
  size: number // px at preview scale (stage width 360 logical -> x3 for export)
  align: Align
  stroke: number // 0..10
  strokeColor: string
}

export interface NumberStyle {
  font: string
  size: number
  color: string
  stroke: number
  strokeColor: string
}

export interface CaptionStyle {
  font: string
  size: number
  color: string
  stroke: number
  strokeColor: string
}

export interface ProjectState {
  titleHtml: string
  titleDelta: unknown // quill Delta ops, used for canvas export
  titleStyle: TitleStyle
  numberStyle: NumberStyle
  captionStyle: CaptionStyle
  videoHeight: number // % of frame height
  background: string
  customOrder: boolean
  order: string[] // clip ids in playback sequence
  clips: Clip[] // clips[0] = Rank #1
}
