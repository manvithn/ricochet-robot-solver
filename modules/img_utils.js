class Utils {
  static matchImg(img) {
    const resource = img.src.substring(img.src.lastIndexOf("/") + 1);
    const matchRobot = resource.match(/robot-(.*).svg/);
    const matchPipe1 = resource.match(/line-bltr-(.*).svg/);
    const matchPipe2 = resource.match(/line-tlbr-(.*).svg/);
    const matchTarget = resource.match(/star-solid-(.*).svg/);
    return [matchRobot, matchPipe1, matchPipe2, matchTarget];
  }

  static getTargetFromSquare(square) {
    const layer = square.querySelector(".grid__layer--target");
    if (!layer) {
      console.error("grid square does not contain expected layer");
      return null;
    }
    return [layer, layer.firstElementChild];
  }

  static getObjectFromSquare(square) {
    const layer = square.querySelector(".grid__layer--object");
    if (!layer) {
      console.error("grid square does not contain expected layer");
      return null;
    }
    return [layer, layer.firstElementChild];
  }
}

export { Utils };
