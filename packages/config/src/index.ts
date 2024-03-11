import type { UserConfig } from '@untheme/core';
import type { LoadConfigResult } from 'unconfig';
import { loadConfig } from 'unconfig';

export async function loadUnthemeConfig<U extends UserConfig>(): Promise<LoadConfigResult<U>> {
    return await loadConfig<U>({
        sources: [
            {
                files: "theme.config",
            }
        ],
        merge: true,
    });
}