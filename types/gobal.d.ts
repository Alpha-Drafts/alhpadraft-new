declare module "@packback/html-to-docx" {
  const HTMLtoDOCX: (
    html: string,
    pageOptions?: object,
    options?: object,
  ) => Promise<Blob>;
  export default HTMLtoDOCX;
}

declare module "file-saver";
