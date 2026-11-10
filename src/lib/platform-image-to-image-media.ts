// 仅映射经离线解码确认的准确参照素材。
const media:Record<string,string>={
  "https://cdn.lantaai.com/resources/fae3da51-844f-4bf6-a580-876ed77e6305.jpeg": "/platform/c3h/fae3da51-844f-4bf6-a580-876ed77e6305.jpeg",
  "https://cdn.lantaai.com/resources/7b301e4a-0b33-4ce7-af1f-946c93af926b.jpg": "/platform/c3h/7b301e4a-0b33-4ce7-af1f-946c93af926b.jpg",
  "https://cdn.lantaai.com/user-upload/328b8876-0423-435f-88d3-975f1605c0b5.jpg": "/platform/c3h/328b8876-0423-435f-88d3-975f1605c0b5.jpg",
  "https://cdn.lantaai.com/images/c211f165-f249-4c91-bf34-8e205618daac.jpg": "/platform/c3h/c211f165-f249-4c91-bf34-8e205618daac.jpg",
  "https://cdn.lantaai.com/resources/_source/380c6472-a8a2-455f-817a-53c173c02416/old-photo.jpeg": "/platform/c3h/old-photo.jpeg",
  "https://cdn.lantaai.com/resources/_source/c47f7e1d-1f9f-4246-b8e4-708074eac178/restored-photo.jpg": "/platform/c3h/restored-photo.jpg",
  "https://cdn.lantaai.com/resources/bfa180ec-0de6-4a3a-a12d-869b310f67e8.png": "/platform/c3-image-composition/bfa180ec-0de6-4a3a-a12d-869b310f67e8.png",
  "https://cdn.lantaai.com/resources/aaad7f3c-9605-4dc9-a036-16c2519bbe2b.png": "/platform/c3-image-composition/aaad7f3c-9605-4dc9-a036-16c2519bbe2b.png",
  "https://cdn.lantaai.com/resources/d8f57749-9145-4c8d-a409-34a8e109cba6.png": "/platform/c3-image-composition/d8f57749-9145-4c8d-a409-34a8e109cba6.png"
};
export function imageToImageMedia(source:string){return media[source];}
