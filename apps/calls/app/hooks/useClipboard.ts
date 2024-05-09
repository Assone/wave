import useSupport from "./useSupport";

export default function useClipboard() {
  const isSupported = useSupport(() => navigator?.clipboard);

  const copy = async (data: ClipboardItems) => {
    if (!isSupported) return;

    await navigator.clipboard.write(data);
  };

  const copyText = async (text: string) => {
    if (!isSupported) return;

    await navigator.clipboard.writeText(text);
  };

  const read = () => {
    if (!isSupported) return;

    return navigator.clipboard.read();
  };

  const readText = () => {
    if (!isSupported) return;

    return navigator.clipboard.readText();
  };

  return { isSupported, copy, copyText, read, readText };
}
