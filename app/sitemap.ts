import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://classz.co'
    const currentDate = new Date()

    return [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/our-mission`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/our-features`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/partnership`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faqs`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact-us`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/delete-account`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]
}
