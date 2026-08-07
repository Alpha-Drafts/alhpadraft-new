export {};

// Module declarations for libraries without types
declare module "html-docx-js/dist/html-docx" {
  const mod: { asBlob: (html: string) => Blob | ArrayBuffer | Uint8Array };
  export default mod;
}
