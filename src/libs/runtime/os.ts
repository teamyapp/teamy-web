export function getPlatform(): Platform {
    if (navigator.platform.indexOf('Mac') > -1) {
        return 'Mac';
    }

    return 'Windows';
}

export type Platform = 'Mac' | 'Windows';
