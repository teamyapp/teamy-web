import { Duration } from "../duration"

export interface BackOff {
	onSuccess: () => void
	onFailure: () => void
	delay: () => Duration
}