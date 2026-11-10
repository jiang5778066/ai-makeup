import {generatorMedia} from './platform-generator-media';
// 只映射取得并完整解码的准确原件，缺失时不热链也不换相似图。
const obtained:Record<string,string>={
  "https://cdn.lantaai.com/images/014dcfb3-1d43-4fb8-82a6-d3c0b66e9465.jpeg": "/platform/c3-image-composition/014dcfb3-1d43-4fb8-82a6-d3c0b66e9465.jpeg",
  "https://cdn.lantaai.com/images/04902b52-d2fc-4f41-89a1-1661e648462c.jpg": "/platform/c3-image-composition/04902b52-d2fc-4f41-89a1-1661e648462c.jpg",
  "https://cdn.lantaai.com/images/05afe04a-0199-4315-a8b8-a0cfe22c06e7.jpg": "/platform/c3-image-composition/05afe04a-0199-4315-a8b8-a0cfe22c06e7.jpg",
  "https://cdn.lantaai.com/images/08578bd5-4c0d-487a-9ae4-b720c037019c.jpeg": "/platform/c3-image-composition/08578bd5-4c0d-487a-9ae4-b720c037019c.jpeg",
  "https://cdn.lantaai.com/images/18d84b85-cc5d-472c-b07e-b2f81f244c42.jpeg": "/platform/c3-image-composition/18d84b85-cc5d-472c-b07e-b2f81f244c42.jpeg",
  "https://cdn.lantaai.com/images/22c3324a-b92b-4cdb-8e50-120415f0273f.jpeg": "/platform/c3-image-composition/22c3324a-b92b-4cdb-8e50-120415f0273f.jpeg",
  "https://cdn.lantaai.com/images/235a0436-6c8f-4449-b3f3-bdffaa78c16a.jpeg": "/platform/c3-image-composition/235a0436-6c8f-4449-b3f3-bdffaa78c16a.jpeg",
  "https://cdn.lantaai.com/images/26d55326-9a8f-4450-9ade-5f9eb4b8c1f5.jpeg": "/platform/c3-image-composition/26d55326-9a8f-4450-9ade-5f9eb4b8c1f5.jpeg",
  "https://cdn.lantaai.com/images/3bfda37e-bb10-4bfe-b651-6d31b89ed11c.jpeg": "/platform/c3-image-composition/3bfda37e-bb10-4bfe-b651-6d31b89ed11c.jpeg",
  "https://cdn.lantaai.com/images/454e4f6e-82d4-406b-b3b2-035e96060f8d.jpeg": "/platform/c3-image-composition/454e4f6e-82d4-406b-b3b2-035e96060f8d.jpeg",
  "https://cdn.lantaai.com/images/456f74d6-1be6-4693-9215-143fe9ca1a0c.jpeg": "/platform/c3-image-composition/456f74d6-1be6-4693-9215-143fe9ca1a0c.jpeg",
  "https://cdn.lantaai.com/images/4f1a9934-07bd-4410-bef3-23029f59ab3b.jpg": "/platform/c3-image-composition/4f1a9934-07bd-4410-bef3-23029f59ab3b.jpg",
  "https://cdn.lantaai.com/images/521d09b1-1c2f-479e-ab1f-b931084f9ad4.jpeg": "/platform/c3-image-composition/521d09b1-1c2f-479e-ab1f-b931084f9ad4.jpeg",
  "https://cdn.lantaai.com/images/563a91e1-f032-4ae1-8438-c532d45e7cc0.jpeg": "/platform/c3-image-composition/563a91e1-f032-4ae1-8438-c532d45e7cc0.jpeg",
  "https://cdn.lantaai.com/images/572c37bb-50a0-443e-a708-215c0dec5a02.jpeg": "/platform/c3-image-composition/572c37bb-50a0-443e-a708-215c0dec5a02.jpeg",
  "https://cdn.lantaai.com/images/71b7d34e-afc3-45d0-985a-ed1dddca0bed.jpeg": "/platform/c3-image-composition/71b7d34e-afc3-45d0-985a-ed1dddca0bed.jpeg",
  "https://cdn.lantaai.com/images/abd53dc5-6572-43cd-ac31-bddcf53d9312.jpeg": "/platform/c3-image-composition/abd53dc5-6572-43cd-ac31-bddcf53d9312.jpeg",
  "https://cdn.lantaai.com/images/cf10b23f-d0b3-4b93-9f86-f0a9934e0519.jpeg": "/platform/c3-image-composition/cf10b23f-d0b3-4b93-9f86-f0a9934e0519.jpeg",
  "https://cdn.lantaai.com/images/d9481cbd-5205-44e1-babd-1659a9bfcabe.jpeg": "/platform/c3-image-composition/d9481cbd-5205-44e1-babd-1659a9bfcabe.jpeg",
  "https://cdn.lantaai.com/images/ef1f2e26-4b6c-44c8-80ec-14073c2b7cd8.jpeg": "/platform/c3-image-composition/ef1f2e26-4b6c-44c8-80ec-14073c2b7cd8.jpeg",
  "https://cdn.lantaai.com/images/f43e39d0-18bb-4acf-b2d8-344430e06ad1.jpeg": "/platform/c3-image-composition/f43e39d0-18bb-4acf-b2d8-344430e06ad1.jpeg",
  "https://cdn.lantaai.com/resources/aaad7f3c-9605-4dc9-a036-16c2519bbe2b.png": "/platform/c3-image-composition/aaad7f3c-9605-4dc9-a036-16c2519bbe2b.png",
  "https://cdn.lantaai.com/resources/b0c22ee9-c7d2-4db7-ae66-095dd788f953.png": "/platform/c3-image-composition/b0c22ee9-c7d2-4db7-ae66-095dd788f953.png",
  "https://cdn.lantaai.com/resources/bfa180ec-0de6-4a3a-a12d-869b310f67e8.png": "/platform/c3-image-composition/bfa180ec-0de6-4a3a-a12d-869b310f67e8.png",
  "https://cdn.lantaai.com/resources/d8f57749-9145-4c8d-a409-34a8e109cba6.png": "/platform/c3-image-composition/d8f57749-9145-4c8d-a409-34a8e109cba6.png",
  "https://cdn.lantaai.com/user-upload/ab1b40a6-697e-454d-80b5-d65e4ce643ce.jpg": "/platform/c3-image-composition/ab1b40a6-697e-454d-80b5-d65e4ce643ce.jpg",
  "https://cdn.lantaai.com/user-upload/e5fdf83d-0261-48dd-ba82-1ab3148c04fa.png": "/platform/c3-image-composition/e5fdf83d-0261-48dd-ba82-1ab3148c04fa.png"
};
export const compositionMedia=(source:string)=>obtained[source]??generatorMedia[source]?.src;
