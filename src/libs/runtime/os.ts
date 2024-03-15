export function getPlatform(): Platform {
    if (navigator.userAgent.includes('Mac')) {
        return 'Mac';
    }

    return 'Windows';
}

export type Platform = 'Mac' | 'Windows';
