import * as PIXI from "pixi.js";

export function usePIXI() {
  let app = new PIXI.Application({
    transparent: true,
    antialias: true,
    resolution: 1
  });

  function startPIXI() {
    app.renderer.autoResize = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);

    document.getElementById("game").appendChild(app.view);
  }

  return {
    startPIXI,
    PIXI,
    app
  };
}
