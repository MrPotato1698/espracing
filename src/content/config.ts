import { defineCollection } from 'astro:content';
import { cldAssetsLoader } from 'astro-cloudinary/loaders';

export const collections = {
  pastchamp2021: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastchamp/2021'
    })
  }),

  pastchamp2022: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastchamp/2022'
    })
  }),

  pastchamp2023: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastchamp/2023'
    })
  }),

  pastchamp2024: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastchamp/2024'
    })
  }),

  pastchamp2025: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastchamp/2025'
    })
  }),

  pastchamp2026: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastchamp/2026'
    })
  }),

  pastevents2022: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastevents/2022'
    })
  }),

  pastevents2023: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastevents/2023'
    })
  }),

  pastevents2024: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastevents/2024'
    })
  }),

  pastevents2025: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastevents/2025'
    })
  }),

  pastevents2026: defineCollection({
    loader: cldAssetsLoader({
      folder: 'pastevents/2026'
    })
  }),
}