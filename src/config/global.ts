import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const config = createEnv({
    client: {
        NEXT_PUBLIC_SITE_URL: z.string(),
        NEXT_PUBLIC_SITE_NAME: z.string(),
        NEXT_PUBLIC_SITE_DESCRIPTION: z.string(),
    },
    clientPrefix: "NEXT_PUBLIC_",
    runtimeEnv: {
        NEXT_PUBLIC_SITE_URL: "pathonaut.com",
        NEXT_PUBLIC_SITE_NAME: "Pathonaut",
        NEXT_PUBLIC_SITE_DESCRIPTION: "Pathogen Exploration, Simplified",
    },
});