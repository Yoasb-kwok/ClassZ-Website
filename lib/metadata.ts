import { Metadata } from 'next'

export const siteConfig = {
    name: 'ClassZ',
    title: 'ClassZ - Discover, Book & Track Extracurricular Classes for Kids',
    description: 'ClassZ is your all-in-one platform for discovering enrichment classes, booking sessions seamlessly, and tracking your child\'s learning progress. From sports to arts, coding to music - find the perfect class for your child.',
    url: 'https://classz.co',
    ogImage: '/m9.png',
    keywords: [
        'kids classes',
        'extracurricular activities',
        'children enrichment',
        'after school programs',
        'kids sports classes',
        'kids art classes',
        'coding for kids',
        'music lessons',
        'dance classes',
        'swimming lessons',
        'class booking',
        'learning progress tracking',
        'Hong Kong kids activities',
        'family activities',
        'child development'
    ],
    authors: [
        {
            name: 'ClassZ',
            url: 'https://classz.app',
        },
    ],
    creator: 'ClassZ',
    publisher: 'ClassZ',
    twitter: {
        card: 'summary_large_image' as const,
        site: '@classz',
        creator: '@classz',
    },
}

export function generateMetadata({
    title,
    description,
    image,
    url,
    keywords,
    noIndex = false,
}: {
    title?: string
    description?: string
    image?: string
    url?: string
    keywords?: string[]
    noIndex?: boolean
}): Metadata {
    const metaTitle = title ? `${title} | ClassZ` : siteConfig.title
    const metaDescription = description || siteConfig.description
    const metaImage = image || siteConfig.ogImage
    const metaUrl = url ? `${siteConfig.url}${url}` : siteConfig.url
    const metaKeywords = keywords || siteConfig.keywords

    return {
        title: metaTitle,
        description: metaDescription,
        keywords: metaKeywords,
        authors: siteConfig.authors,
        creator: siteConfig.creator,
        publisher: siteConfig.publisher,
        robots: noIndex
            ? {
                index: false,
                follow: false,
            }
            : {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            alternateLocale: ['zh_HK', 'zh_CN'],
            url: metaUrl,
            title: metaTitle,
            description: metaDescription,
            siteName: siteConfig.name,
            images: [
                {
                    url: metaImage,
                    width: 1200,
                    height: 630,
                    alt: metaTitle,
                },
            ],
        },
        twitter: {
            card: siteConfig.twitter.card,
            site: siteConfig.twitter.site,
            creator: siteConfig.twitter.creator,
            title: metaTitle,
            description: metaDescription,
            images: [metaImage],
        },
        alternates: {
            canonical: metaUrl,
        },
        verification: {
            // Add your verification codes here when available
            // google: 'your-google-verification-code',
            // yandex: 'your-yandex-verification-code',
            // bing: 'your-bing-verification-code',
        },
    }
}

export function generateStructuredData(type: 'organization' | 'website' | 'breadcrumb', data?: any) {
    const baseUrl = siteConfig.url

    switch (type) {
        case 'organization':
            return {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: siteConfig.name,
                url: baseUrl,
                logo: `${baseUrl}/logoWeb.png`,
                description: siteConfig.description,
                sameAs: [
                    // Add your social media URLs here
                    // 'https://www.facebook.com/classz',
                    // 'https://twitter.com/classz',
                    // 'https://www.instagram.com/classz',
                ],
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'Customer Service',
                    availableLanguage: ['English', 'Chinese'],
                },
            }

        case 'website':
            return {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: siteConfig.name,
                url: baseUrl,
                description: siteConfig.description,
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${baseUrl}/search?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                },
            }

        case 'breadcrumb':
            return {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: data?.items || [],
            }

        default:
            return null
    }
}
