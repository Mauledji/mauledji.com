import { sileo } from "sileo";

/**
 * Attaches a clipboard copy handler to a button element.
 * On click: copies `email` to clipboard, runs `onCopy` for visual feedback,
 * shows a sileo toast, then reverts after 2s.
 */
export function attachCopyEmail(
  btn: HTMLButtonElement,
  email: string,
  onCopy: () => void,
  onRevert: () => void,
) {
  btn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(email);
    onCopy();
    sileo.success({ title: "Email copied", description: email });
    setTimeout(onRevert, 2000);
  });
}
