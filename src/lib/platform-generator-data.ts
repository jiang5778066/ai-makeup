export type GeneratorMode = "image" | "text";
export type GeneratorKind = "image" | "video";
export type WanGeneratorPath = `/ai-video-models/${"wan-2-2"|"wan-2-5"|"wan-2-6"|"wan-3-0"}`;
export type CoreVideoModelPath = `/ai-video-models/${"kling-ai"|"kling-3-0"|"seedance-2-0"|"happy-horse-1-0"}`;
export type AdditionalVideoModelPath = `/ai-video-models/${"grok-imagine"|"mindvideo-ai"|"sora-2"|"veo-3"|"vheer"}`;
export type VideoModelPath = CoreVideoModelPath | AdditionalVideoModelPath;
export type GeneratorPath = "/ai-video-models/dreamface-ai" | WanGeneratorPath | VideoModelPath | "/ai-image-generator" | "/ai-video-generator" | "/ai-image-models/gpt-image-2" | "/ai-image-models/nano-banana-pro";
export type GeneratorConfig = { promptLimit: number; ratios: string[]; resolutions: string[]; reference?: {max:number;accept:string;maxBytes:number;localByteLimit:boolean}; durations?: number[]; durationRange?: [number,number]; audio?: boolean; sound?:boolean; multishot?:boolean; enhance?:boolean; keyframes?:boolean; flavors?:string[] };
export type GeneratorModel = {id:string;referenceId:string;name:string;kind:GeneratorKind;brand:string;modes:Partial<Record<GeneratorMode,GeneratorConfig>> };
// 来源：C2a两组公开参数矩阵；只表示可预览的UI，真实生成尚未接入。
export const generatorModels: GeneratorModel[] = [
  {
    "id": "seedream-5-0-pro",
    "referenceId": "2403",
    "name": "Seedream 5.0 Pro",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2",
          "21:9"
        ],
        "resolutions": [
          "1K",
          "2K"
        ],
        "reference": {
          "max": 10,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2",
          "21:9"
        ],
        "resolutions": [
          "1K",
          "2K"
        ]
      }
    }
  },
  {
    "id": "seedream-5-0-lite",
    "referenceId": "2400",
    "name": "Seedream 5.0 Lite",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "2K",
          "3K",
          "4K"
        ],
        "reference": {
          "max": 8,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "2K",
          "3K",
          "4K"
        ]
      }
    }
  },
  {
    "id": "qwen-image-edit-spicy",
    "referenceId": "1410",
    "name": "Qwen Image Edit Spicy",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [],
        "resolutions": [],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      }
    }
  },
  {
    "id": "gpt-image-2",
    "referenceId": "2100",
    "name": "GPT Image 2",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "16:9",
          "9:16",
          "3:2",
          "2:3"
        ],
        "resolutions": [],
        "reference": {
          "max": 8,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "16:9",
          "9:16",
          "3:2",
          "2:3"
        ],
        "resolutions": []
      }
    }
  },
  {
    "id": "gpt-image-2-5-flare",
    "referenceId": "2110",
    "name": "GPT Image 2.5 Flare",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2",
          "21:9",
          "27:16",
          "16:27",
          "9:8",
          "8:9"
        ],
        "resolutions": [
          "1K",
          "2K",
          "4K"
        ],
        "reference": {
          "max": 16,
          "accept": "image/jpeg,image/jpg,image/png,image/webp",
          "maxBytes": 31457280,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2",
          "21:9",
          "27:16",
          "16:27",
          "9:8",
          "8:9"
        ],
        "resolutions": [
          "1K",
          "2K",
          "4K"
        ]
      }
    }
  },
  {
    "id": "gpt-image-2-5-sunburst",
    "referenceId": "2111",
    "name": "GPT Image 2.5 Sunburst",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2",
          "21:9",
          "27:16",
          "16:27",
          "9:8",
          "8:9"
        ],
        "resolutions": [
          "1K",
          "2K",
          "4K"
        ],
        "reference": {
          "max": 16,
          "accept": "image/jpeg,image/jpg,image/png,image/webp",
          "maxBytes": 31457280,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2",
          "21:9",
          "27:16",
          "16:27",
          "9:8",
          "8:9"
        ],
        "resolutions": [
          "1K",
          "2K",
          "4K"
        ]
      }
    }
  },
  {
    "id": "nano-banana-pro",
    "referenceId": "1000",
    "name": "Nano Banana Pro",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "1K",
          "2K",
          "4K"
        ],
        "reference": {
          "max": 8,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "1K",
          "2K",
          "4K"
        ]
      }
    }
  },
  {
    "id": "wan-2-7-image-pro",
    "referenceId": "1402",
    "name": "Wan 2.7 Image Pro",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1K",
          "2K"
        ],
        "reference": {
          "max": 9,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1K",
          "2K",
          "4K"
        ]
      }
    }
  },
  {
    "id": "qwen-image-edit-max",
    "referenceId": "1404",
    "name": "Qwen Image Edit Max",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1K",
          "2K"
        ],
        "reference": {
          "max": 3,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      }
    }
  },
  {
    "id": "wan-2-5-image",
    "referenceId": "1405",
    "name": "Wan 2.5",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1K"
        ],
        "reference": {
          "max": 3,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      }
    }
  },
  {
    "id": "flux-2-pro",
    "referenceId": "1300",
    "name": "Flux 2 Pro",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "1K",
          "2K"
        ],
        "reference": {
          "max": 8,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "1K",
          "2K"
        ]
      }
    }
  },
  {
    "id": "flux-2-flex",
    "referenceId": "1301",
    "name": "Flux 2 Flex",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "image": {
        "promptLimit": 20000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "1K",
          "2K"
        ],
        "reference": {
          "max": 8,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        }
      },
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "1K",
          "2K"
        ]
      }
    }
  },
  {
    "id": "z-image-spicy",
    "referenceId": "1401",
    "name": "Z Image Spicy",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [],
        "enhance": true
      }
    }
  },
  {
    "id": "z-image",
    "referenceId": "1400",
    "name": "Z Image",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "HD"
        ],
        "enhance": true
      }
    }
  },
  {
    "id": "qwen-image-2-0-pro",
    "referenceId": "1403",
    "name": "Qwen Image 2.0 Pro",
    "kind": "image",
    "brand": "Image",
    "modes": {
      "text": {
        "promptLimit": 20000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1K",
          "2K"
        ]
      }
    }
  },
  {
    "id": "wan-2-2-spicy",
    "referenceId": "803",
    "name": "Wan 2.2 Spicy",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "480P",
          "720P"
        ],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          5,
          8
        ]
      }
    }
  },
  {
    "id": "wan-3-0",
    "referenceId": "805",
    "name": "Wan 3.0",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 20,
          "accept": "image/*,video/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      }
    }
  },
  {
    "id": "wan-3-0-pro",
    "referenceId": "806",
    "name": "Wan 3.0 Pro",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1080P",
          "2K",
          "4K"
        ],
        "reference": {
          "max": 20,
          "accept": "image/*,video/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1080P",
          "2K",
          "4K"
        ],
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      }
    }
  },
  {
    "id": "wan-3-0-prime",
    "referenceId": "807",
    "name": "Wan 3.0 Prime",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 20,
          "accept": "image/*,video/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      }
    }
  },
  {
    "id": "wan-3-0-prime-pro",
    "referenceId": "808",
    "name": "Wan 3.0 Prime Pro",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1080P",
          "2K",
          "4K"
        ],
        "reference": {
          "max": 20,
          "accept": "image/*,video/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "Auto",
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "1080P",
          "2K",
          "4K"
        ],
        "sound": true,
        "durationRange": [
          5,
          30
        ]
      }
    }
  },
  {
    "id": "wan-2-7-spicy",
    "referenceId": "804",
    "name": "Wan 2.7 Spicy",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 2,
          "accept": "image/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          5,
          10,
          15
        ]
      }
    }
  },
  {
    "id": "wan-2-7",
    "referenceId": "802",
    "name": "Wan 2.7",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 3,
          "accept": "image/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          5,
          10,
          15
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "durations": [
          5,
          10,
          15
        ]
      }
    }
  },
  {
    "id": "wan-2-6",
    "referenceId": "801",
    "name": "Wan 2.6",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "multishot": true,
        "durations": [
          5,
          10,
          15
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "1:1",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "durations": [
          5,
          10,
          15
        ]
      }
    }
  },
  {
    "id": "wan-2-5",
    "referenceId": "800",
    "name": "Wan 2.5",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": false
        },
        "audio": true,
        "durations": [
          5,
          10
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "1:1",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "audio": true,
        "durations": [
          5,
          10
        ]
      }
    }
  },
  {
    "id": "wan-2-2",
    "referenceId": "114",
    "name": "Wan 2.2",
    "kind": "video",
    "brand": "Wan",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "480P",
          "1080P"
        ],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          5
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "1:1",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "1080P"
        ],
        "durations": [
          5
        ]
      }
    }
  },
  {
    "id": "seedance-2-0-fast",
    "referenceId": "1610",
    "name": "Seedance 2.0 Fast",
    "kind": "video",
    "brand": "Seedance",
    "modes": {
      "image": {
        "promptLimit": 2000,
        "ratios": [],
        "resolutions": [
          "480P",
          "720P"
        ],
        "reference": {
          "max": 5,
          "accept": "image/*,video/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durations": [
          4,
          6,
          8,
          12,
          15
        ]
      },
      "text": {
        "promptLimit": 2000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "720P"
        ],
        "sound": true,
        "durations": [
          4,
          6,
          8,
          12,
          15
        ]
      }
    }
  },
  {
    "id": "seedance-2-0",
    "referenceId": "1611",
    "name": "Seedance 2.0",
    "kind": "video",
    "brand": "Seedance",
    "modes": {
      "image": {
        "promptLimit": 2000,
        "ratios": [],
        "resolutions": [
          "480P",
          "720P"
        ],
        "reference": {
          "max": 5,
          "accept": "image/*,video/*,audio/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durations": [
          4,
          6,
          8,
          12,
          15
        ]
      },
      "text": {
        "promptLimit": 2000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "480P",
          "720P"
        ],
        "sound": true,
        "durations": [
          4,
          6,
          8,
          12,
          15
        ]
      }
    }
  },
  {
    "id": "kling-3-0",
    "referenceId": "1130",
    "name": "Kling 3.0",
    "kind": "video",
    "brand": "Kling",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "SD",
          "HD"
        ],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durations": [
          5,
          10,
          15
        ]
      }
    }
  },
  {
    "id": "kling-4-0",
    "referenceId": "1140",
    "name": "Kling 4.0",
    "kind": "video",
    "brand": "Kling",
    "modes": {
      "image": {
        "promptLimit": 8000,
        "ratios": [
          "Auto",
          "1:1",
          "9:16",
          "16:9",
          "21:9"
        ],
        "resolutions": [
          "720p",
          "1080p"
        ],
        "reference": {
          "max": 15,
          "accept": "image/*,video/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durationRange": [
          3,
          30
        ],
        "keyframes": true
      },
      "text": {
        "promptLimit": 8000,
        "ratios": [
          "Auto",
          "1:1",
          "9:16",
          "16:9",
          "21:9"
        ],
        "resolutions": [
          "720p",
          "1080p"
        ],
        "durationRange": [
          3,
          30
        ]
      }
    }
  },
  {
    "id": "kling-2-6",
    "referenceId": "1120",
    "name": "Kling 2.6",
    "kind": "video",
    "brand": "Kling",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "sound": true,
        "durations": [
          5,
          10
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "1:1",
          "9:16",
          "16:9"
        ],
        "resolutions": [],
        "sound": true,
        "durations": [
          5,
          10
        ]
      }
    }
  },
  {
    "id": "kling-2-5-turbo",
    "referenceId": "1110",
    "name": "Kling 2.5 Turbo",
    "kind": "video",
    "brand": "Kling",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          5,
          10
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "1:1",
          "9:16",
          "16:9"
        ],
        "resolutions": [],
        "durations": [
          5,
          10
        ]
      }
    }
  },
  {
    "id": "grok-imagine-video-1-5",
    "referenceId": "1801",
    "name": "Grok Imagine Video 1.5",
    "kind": "video",
    "brand": "Grok",
    "modes": {
      "image": {
        "promptLimit": 4096,
        "ratios": [],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 7,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durationRange": [
          6,
          15
        ]
      }
    }
  },
  {
    "id": "grok-imagine",
    "referenceId": "1800",
    "name": "Grok Imagine",
    "kind": "video",
    "brand": "Grok",
    "modes": {
      "image": {
        "promptLimit": 5000,
        "ratios": [],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 7,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durationRange": [
          6,
          30
        ],
        "flavors": [
          "Normal",
          "Fun"
        ]
      },
      "text": {
        "promptLimit": 5000,
        "ratios": [
          "1:1",
          "9:16",
          "16:9",
          "2:3",
          "3:2"
        ],
        "resolutions": [
          "480P",
          "720P",
          "1080P"
        ],
        "durationRange": [
          6,
          30
        ],
        "flavors": [
          "Normal",
          "Fun",
          "Spicy"
        ]
      }
    }
  },
  {
    "id": "happy-horse-1-1",
    "referenceId": "2201",
    "name": "Happy Horse 1.1",
    "kind": "video",
    "brand": "HappyHorse",
    "modes": {
      "image": {
        "promptLimit": 1000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 9,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          5,
          10,
          15
        ]
      },
      "text": {
        "promptLimit": 1000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "durations": [
          5,
          10,
          15
        ]
      }
    }
  },
  {
    "id": "happy-horse-1-0",
    "referenceId": "2200",
    "name": "Happy Horse 1.0",
    "kind": "video",
    "brand": "HappyHorse",
    "modes": {
      "image": {
        "promptLimit": 1000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "reference": {
          "max": 9,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          5,
          10,
          15
        ]
      },
      "text": {
        "promptLimit": 1000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [
          "720P",
          "1080P"
        ],
        "durations": [
          5,
          10,
          15
        ]
      }
    }
  },
  {
    "id": "veo-3-1-fast",
    "referenceId": "900",
    "name": "Veo 3.1 Fast",
    "kind": "video",
    "brand": "Veo",
    "modes": {
      "image": {
        "promptLimit": 1000,
        "ratios": [],
        "resolutions": [],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          8
        ]
      },
      "text": {
        "promptLimit": 1000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [],
        "durations": [
          8
        ]
      }
    }
  },
  {
    "id": "veo-3-1",
    "referenceId": "901",
    "name": "Veo 3.1",
    "kind": "video",
    "brand": "Veo",
    "modes": {
      "image": {
        "promptLimit": 1000,
        "ratios": [],
        "resolutions": [],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          8
        ]
      },
      "text": {
        "promptLimit": 1000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9"
        ],
        "resolutions": [],
        "durations": [
          8
        ]
      }
    }
  },
  {
    "id": "minimax-h3",
    "referenceId": "2500",
    "name": "MiniMax H3",
    "kind": "video",
    "brand": "MiniMax",
    "modes": {
      "image": {
        "promptLimit": 7000,
        "ratios": [],
        "resolutions": [
          "768P",
          "2K"
        ],
        "reference": {
          "max": 2,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durationRange": [
          4,
          15
        ]
      },
      "text": {
        "promptLimit": 7000,
        "ratios": [
          "1:1",
          "3:4",
          "4:3",
          "9:16",
          "16:9",
          "21:9"
        ],
        "resolutions": [
          "768P",
          "2K"
        ],
        "durationRange": [
          4,
          15
        ]
      }
    }
  },
  {
    "id": "lanta-2-1",
    "referenceId": "112",
    "name": "Lanta 2.1",
    "kind": "video",
    "brand": "Lanta",
    "modes": {
      "image": {
        "promptLimit": 1000,
        "ratios": [],
        "resolutions": [
          "540P",
          "720P"
        ],
        "reference": {
          "max": 1,
          "accept": "image/*",
          "maxBytes": 10485760,
          "localByteLimit": true
        },
        "durations": [
          3,
          4,
          5,
          8
        ]
      }
    }
  }
];

export const generatorPages = {
 "/ai-video-models/dreamface-ai": {kind:"video",family:"video",title:{en:"DreamFace AI Video Generator","zh-CN":"DreamFace AI 视频生成器"},defaultModel:"lanta-2-1"},
 "/ai-image-generator": { kind:"image", family:"image", title:{en:"AI Image Generator", "zh-CN":"AI 图片生成器"}, defaultModel:"seedream-5-0-pro" },
 "/ai-video-generator": { kind:"video", family:"video", title:{en:"AI Video Generator", "zh-CN":"AI 视频生成器"}, defaultModel:"wan-2-5" },
 "/ai-image-models/gpt-image-2": { kind:"image", family:"gpt", title:{en:"GPT Image 2 AI Image Generator", "zh-CN":"GPT Image 2 AI 图像生成器"}, defaultModel:"gpt-image-2" },
 "/ai-image-models/nano-banana-pro": { kind:"image", family:"nano", title:{en:"Nano Banana Pro: AI Image Generator & Photo Editor", "zh-CN":"Nano Banana Pro：AI 图像生成器与照片编辑器"}, defaultModel:"nano-banana-pro" },
 "/ai-video-models/wan-2-2": {kind:"video",family:"wan",title:{en:"Wan 2.2 AI Video Generator","zh-CN":"Wan 2.2 AI 视频生成器"},defaultModel:"wan-2-2"},
 "/ai-video-models/wan-2-5": {kind:"video",family:"wan",title:{en:"Wan 2.5 AI Video Generator","zh-CN":"Wan 2.5 AI 视频生成器"},defaultModel:"wan-2-5"},
 "/ai-video-models/wan-2-6": {kind:"video",family:"wan",title:{en:"Wan 2.6 AI Video Generator","zh-CN":"Wan 2.6 AI 视频生成器"},defaultModel:"wan-2-6"},
 "/ai-video-models/wan-3-0": {kind:"video",family:"wan",title:{en:"Wan 3.0 AI Video Generator","zh-CN":"Wan 3.0 AI 视频生成器"},defaultModel:"wan-3-0"},
 "/ai-video-models/kling-ai": {kind:"video",family:"video",title:{en:"Kling AI Video Generator on Lanta AI","zh-CN":"Lanta AI 上的 Kling AI 视频生成器"},defaultModel:"kling-2-6"},
 "/ai-video-models/kling-3-0": {kind:"video",family:"video",title:{en:"Kling 3.0: All-in-One AI Video Generator","zh-CN":"Kling 3.0：一体化 AI 视频生成器"},defaultModel:"kling-3-0"},
 "/ai-video-models/seedance-2-0": {kind:"video",family:"video",title:{en:"Seedance 2.0 AI Video Generator","zh-CN":"Seedance 2.0 AI 视频生成器"},defaultModel:"seedance-2-0"},
 "/ai-video-models/happy-horse-1-0": {kind:"video",family:"video",title:{en:"HappyHorse 1.0 AI Video Generator","zh-CN":"HappyHorse 1.0 AI 视频生成器"},defaultModel:"happy-horse-1-0"},
 "/ai-video-models/grok-imagine": {kind:"video",family:"video",title:{en:"Grok Imagine AI Video Generator","zh-CN":"Grok Imagine AI 视频生成器"},defaultModel:"grok-imagine"},
 "/ai-video-models/mindvideo-ai": {kind:"video",family:"video",title:{en:"Create Videos with MindVideo AI","zh-CN":"使用 MindVideo AI 创建视频"},defaultModel:"wan-3-0"},
 "/ai-video-models/sora-2": {kind:"video",family:"video",title:{en:"Sora 2: The Future of AI Video Generation","zh-CN":"Sora 2：AI 视频生成的未来"},defaultModel:""},
 "/ai-video-models/veo-3": {kind:"video",family:"video",title:{en:"Veo 3.1 Fast AI Video Generator","zh-CN":"Veo 3.1 Fast AI 视频生成器"},defaultModel:"veo-3-1-fast"},
 "/ai-video-models/vheer": {kind:"video",family:"video",title:{en:"Vheer AI Video Generator","zh-CN":"Vheer AI 视频生成器"},defaultModel:"lanta-2-1"},
} as const;
export const generationAvailability = "unavailable" as const;
export function isGeneratorPath(path:string): path is GeneratorPath { return Object.hasOwn(generatorPages,path); }
