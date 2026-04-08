import { StorefrontPreview } from '@ai-storefront/storefront-components'
import { readStoreConfig } from '../lib/store-config'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
    const config = await readStoreConfig()
    return <StorefrontPreview config={config} />
}
