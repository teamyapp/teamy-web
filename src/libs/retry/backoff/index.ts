export interface BackOff {
	onSuccess: () => void
	onFailure: () => void
	delay: () => number
}