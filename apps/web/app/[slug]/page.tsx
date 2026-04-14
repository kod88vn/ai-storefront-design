'use client'

import { notFound } from 'next/navigation'
import { StorefrontPreview } from '@ai-storefront/storefront-components'
import { useConfig } from '../../lib/use-config'
import { use } from 'react'

interface Props {
    params: Promise<{ slug: string }>
}

export default function CustomPage({ params }: Props) {
    const { slug } = use(params)
    const config = useConfig()

    if (!config) return null

    const page = config.customPages?.find((p) => p.slug === `/${slug}`)
    if (!page) return notFound()

    // Build a config slice with only this page's sections so StorefrontPreview renders them
    const pageConfig = { ...config, sections: page.sections ?? [] }

    return <StorefrontPreview config={pageConfig} />
}
