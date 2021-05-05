declare module '*.svg' {
  const content: {
    id: string;
    viewBox: string;
    content: string;
  };
  export default content;
}
