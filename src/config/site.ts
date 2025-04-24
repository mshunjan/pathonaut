import { SiteConfig } from "@/types/site"
import { config } from "./global"

export const siteConfig: SiteConfig = {
    name: config.NEXT_PUBLIC_SITE_NAME,
    description: config.NEXT_PUBLIC_SITE_DESCRIPTION,
    url: config.NEXT_PUBLIC_SITE_URL,
}