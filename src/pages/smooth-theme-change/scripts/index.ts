import "../styles/index.scss";

const themeBtn = document.querySelectorAll(".theme-btn");

for (const btn of themeBtn) {
  const inputBox = btn.querySelector(
    ".hidden-input"
  ) as HTMLInputElement | null;
  const thumb = btn.querySelector(".thumb") as HTMLElement | null;

  if (!inputBox || !thumb) continue;

  btn.addEventListener("click", () => {
    inputBox.checked = !inputBox.checked;
    if (inputBox.checked) {
      thumb.style.transform = `translateX(calc(100% + 2 * var(--thumb-pad)))`;
    } else {
      thumb.style.transform = `translateX(0px)`;
    }
  });

  thumb.addEventListener("click", (ev) => ev.stopPropagation());

  thumb.addEventListener("mousedown", () => {
    const baseX = btn.getBoundingClientRect().left;
    const baseMaxX = btn.getBoundingClientRect().right;
    const thumbSize = thumb.getBoundingClientRect().width;
    let isClick = true;

    const mouseMove = (ev: MouseEvent) => {
      thumb.classList.add("active");

      if (ev.movementX > 2) {
        isClick = false;
      }

      const mouseX = ev.clientX - baseX - thumbSize / 2;

      thumb.style.transform = `translateX(${Math.max(
        0,
        Math.min(
          mouseX,
          baseMaxX -
            baseX -
            thumbSize -
            2 *
              parseInt(
                getComputedStyle(btn).getPropertyValue("--thumb-pad") ?? "0"
              )
        )
      )}px)`;
    };

    const mouseUp = (ev: MouseEvent) => {
      thumb.classList.remove("active");
      // Check the position of the thumb and based on that move the thumb to the correct position
      const elX = thumb.getBoundingClientRect().left;

      if (isClick) {
        inputBox.checked = !inputBox.checked;
        if (inputBox.checked) {
          thumb.style.transform = `translateX(calc(100% + 2 * var(--thumb-pad)))`;
        } else {
          thumb.style.transform = `translateX(0px)`;
        }
      } else {
        if (elX - baseX + thumbSize / 2 < (baseMaxX - baseX) / 2) {
          inputBox.checked = false;
          thumb.style.transform = `translateX(0px)`;
        } else {
          inputBox.checked = true;
          thumb.style.transform = `translateX(calc(100% + 2 * var(--thumb-pad)))`;
        }
      }

      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };

    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  });
}
