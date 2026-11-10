// 素材身份与原件一一对应，具体 URL、解码及 SHA 证据见本批 asset-receipt.json。
export const ghibliMedia = [
  {
    "original": {
      "src": "/platform/c3g/7b301e4a-0b33-4ce7-af1f-946c93af926b.jpg",
      "alt": "Original photo before Ghibli style conversion"
    },
    "styled": {
      "src": "/platform/c3g/fae3da51-844f-4bf6-a580-876ed77e6305.jpeg",
      "alt": "Photo transformed into Studio Ghibli style artwork"
    }
  },
  {
    "original": {
      "src": "/platform/c3g/9bf69e04-26b6-49cd-af58-ef395374a0dd.jpg",
      "alt": "Original portrait photo before Ghibli conversion"
    },
    "styled": {
      "src": "/platform/c3g/15073bb5-b0fe-4d51-8e0d-29fde0e8dd39.jpeg",
      "alt": "Portrait transformed into Miyazaki-style character art"
    }
  },
  {
    "original": {
      "src": "/platform/c3g/83ace46c-b265-4cea-90ca-710877e168f3.jpg",
      "alt": "Original group photo before Ghibli conversion"
    },
    "styled": {
      "src": "/platform/c3g/00177517-e294-456b-b4b4-e0598ed757c1.jpeg",
      "alt": "Group photo transformed into anime-style Ghibli art"
    }
  },
  {
    "original": {
      "src": "/platform/c3g/a824221c-7118-4a9e-8ad8-979e2ff7dfa0.jpg",
      "alt": "Original cityscape photo before Ghibli conversion"
    },
    "styled": {
      "src": "/platform/c3g/30f7ceec-8015-4943-a640-cb73fd7d942e.jpeg",
      "alt": "Cityscape transformed into Ghibli-style animation"
    }
  },
  {
    "original": {
      "src": "/platform/c3g/cb9c4ad7-6225-4773-8d6e-90007b2c6d27.jpg",
      "alt": "Original plant photo before Ghibli conversion"
    },
    "styled": {
      "src": "/platform/c3g/d6efe1d8-cf0e-415c-9a85-f6f5543b0afa.jpg",
      "alt": "Plant photo transformed into anime-style Ghibli art"
    }
  },
  {
    "original": {
      "src": "/platform/c3g/2c67d009-5b4e-4321-9c1c-00184bad0e19.jpg",
      "alt": "Original landscape photo before Ghibli conversion"
    },
    "styled": {
      "src": "/platform/c3g/dc9857ca-cac1-46c7-a493-ef9cf29e5dbb.webp",
      "alt": "Landscape transformed into Studio Ghibli style scenery"
    }
  },
  {
    "original": {
      "src": "/platform/c3g/b9dea19f-c9d2-402f-aecf-15fbeaa2ee6f.jpg",
      "alt": "Original cityscape photo before Ghibli conversion"
    },
    "styled": {
      "src": "/platform/c3g/42c763ce-5e6e-4719-b1fd-b9d6b3a7139f.jpeg",
      "alt": "Cityscape transformed into Ghibli-style animation"
    }
  }
] as const;
export type GhibliMediaPair = typeof ghibliMedia[number];
