
export type LogLevel = "Off" | "Fatal" |"Error"|"Warning"|"Info"| "Debug"
export const LogLevelRank: Record<LogLevel, number> = {
	Off:     0,
	Fatal:   1,
	Error:   2,
	Warning: 3,
	Info:    4,
	Debug:   5,
}
